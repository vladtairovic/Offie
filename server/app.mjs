import express from 'express';
import { createServer } from 'node:http';
import { randomBytes, scryptSync, timingSafeEqual } from 'node:crypto';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { Server } from 'socket.io';
import { getSnapshot, getUsers, openStore } from './store.mjs';

const project=resolve(fileURLToPath(new URL('..',import.meta.url)));
export function createOffie({dbPath=resolve(project,'data/offie.sqlite'),now=Date.now,sessionMs=240000,cooldownMs=1800000}={}) {
  if(!Number.isFinite(sessionMs)||sessionMs<1000||!Number.isFinite(cooldownMs)||cooldownMs<1000) throw new Error('Os tempos devem ser números positivos de pelo menos 1 segundo.');
  const db=openStore(dbPath,now()); const app=express(); const server=createServer(app); const io=new Server(server); let closed=false;
  app.disable('x-powered-by'); app.use(express.json({limit:'8kb'}));
  app.use('/api',(_req,res,next)=>{res.set('Cache-Control','no-store');next();});
  const error=(res,status,message,extra={})=>res.status(status).json({error:message,serverNow:now(),...extra});
  function endSession(session,at) { const until=at+cooldownMs; db.exec('BEGIN'); try {db.prepare('UPDATE users SET cooldown_until=MAX(cooldown_until,?) WHERE id=?').run(until,session.user_id);db.prepare('DELETE FROM sessions WHERE token=?').run(session.token);db.exec('COMMIT');}catch(err){db.exec('ROLLBACK');throw err;} io.to(session.token).emit('session-ended',{cooldownUntil:until,serverNow:now()}); return until; }
  function expire() { for(const s of db.prepare('SELECT * FROM sessions WHERE expires_at<=?').all(now())) endSession(s,s.expires_at); }
  const interval=setInterval(expire,500); interval.unref();
  function auth(req,res,next) { const token=req.headers.authorization?.replace(/^Bearer /,''); const session=token ? db.prepare('SELECT * FROM sessions WHERE token=?').get(token) : null;
    if(!session) return error(res,401,'Seu momento terminou. Vamos recarregar as energias!');
    if(session.expires_at<=now()) return error(res,401,'Hora de recarregar as energias!',{cooldownUntil:endSession(session,session.expires_at)});
    req.session=session; next();
  }
  function publicSession(s) {return {token:s.token,userId:s.user_id,expiresAt:s.expires_at,duration:s.duration,cooldown:cooldownMs,serverNow:now()};}
  function notice(user,actor,type,post=null) {if(user===actor)return; const prior=db.prepare('SELECT id FROM notifications WHERE user_id=? AND actor_id=? AND type=? AND post_id IS ?').get(user,actor,type,post); if(prior && type!=='reply') return; db.prepare('INSERT INTO notifications (user_id,actor_id,type,post_id,created_at) VALUES (?,?,?,?,?)').run(user,actor,type,post,now());}
  const update=()=>io.emit('update');
  const findPost=(req,res)=>{const id=Number(req.params.id);const p=Number.isSafeInteger(id)?db.prepare('SELECT * FROM posts WHERE id=?').get(id):null;if(!p)error(res,404,'Esta publicação não está mais por aqui.');return p;};
  io.on('connection',socket=>{ const token=socket.handshake.auth?.token; if(typeof token!=='string')return;const s=db.prepare('SELECT * FROM sessions WHERE token=? AND expires_at>?').get(token,now());if(s)socket.join(token); });
  app.get('/api/health',(_req,res)=>res.json({ok:true,serverNow:now()}));
  app.get('/api/users',(_req,res)=>res.json(getUsers(db)));
  app.post('/api/login',(req,res)=>{expire();const {userId,pin}=req.body||{}; if(!Number.isSafeInteger(userId)||typeof pin!=='string'||pin.length>8)return error(res,400,'Escolha sua conta e digite o PIN.'); const user=db.prepare('SELECT * FROM users WHERE id=?').get(userId);
    if(!user||!timingSafeEqual(scryptSync(pin,`offie-demo-${userId}`,32),Buffer.from(user.pin_hash,'hex')))return error(res,401,'Esse PIN não conferiu. Na demonstração, use 1234.');
    if(user.cooldown_until>now())return error(res,429,'Hora de recarregar as energias! ⚡',{cooldownUntil:user.cooldown_until});
    if(db.prepare('SELECT 1 FROM sessions WHERE user_id=?').get(userId))return error(res,409,'Sua conta já está em outro totem. Encerre aquela sessão primeiro.');
    const s={token:randomBytes(32).toString('hex'),user_id:userId,expires_at:now()+sessionMs,duration:sessionMs};db.prepare('INSERT INTO sessions (token,user_id,expires_at,duration) VALUES (?,?,?,?)').run(s.token,s.user_id,s.expires_at,s.duration);res.json(publicSession(s));
  });
  app.get('/api/session',auth,(req,res)=>res.json(publicSession(req.session)));
  app.post('/api/logout',auth,(req,res)=>res.json({cooldownUntil:endSession(req.session,now()),serverNow:now()}));
  app.get('/api/snapshot',auth,(req,res)=>res.json(getSnapshot(db,req.session.user_id,now())));
  app.post('/api/posts',auth,(req,res)=>{const {text,parentId}=req.body||{};if(typeof text!=='string'||!text.trim()||Array.from(text.trim()).length>280)return error(res,400,'Sua ideia precisa ter de 1 a 280 caracteres.');let parent=null;
    if(parentId!==undefined&&parentId!==null){if(!Number.isSafeInteger(parentId))return error(res,400,'Escolha uma conversa válida.');parent=db.prepare('SELECT * FROM posts WHERE id=?').get(parentId);if(!parent)return error(res,404,'A conversa original não está mais por aqui.');}
    const r=db.prepare('INSERT INTO posts (user_id,text,created_at,parent_id) VALUES (?,?,?,?)').run(req.session.user_id,text.trim(),now(),parent?.id||null);if(parent)notice(parent.user_id,req.session.user_id,'reply',parent.id);update();res.status(201).json({id:Number(r.lastInsertRowid)});
  });
  app.delete('/api/posts/:id',auth,(req,res)=>{const p=findPost(req,res);if(!p)return;if(p.user_id!==req.session.user_id)return error(res,403,'Você só pode excluir suas próprias publicações.');db.prepare('DELETE FROM posts WHERE id=?').run(p.id);update();res.json({ok:true});});
  for(const [path,table,type] of [['like','likes','like'],['repost','reposts','repost']]) app.post(`/api/posts/:id/${path}`,auth,(req,res)=>{const p=findPost(req,res);if(!p)return;const me=req.session.user_id;const existing=db.prepare(`SELECT 1 FROM ${table} WHERE user_id=? AND post_id=?`).get(me,p.id);if(existing)db.prepare(`DELETE FROM ${table} WHERE user_id=? AND post_id=?`).run(me,p.id);else {if(table==='reposts')db.prepare('INSERT INTO reposts (user_id,post_id,created_at) VALUES (?,?,?)').run(me,p.id,now());else db.prepare('INSERT INTO likes (user_id,post_id) VALUES (?,?)').run(me,p.id);notice(p.user_id,me,type,p.id);}update();res.json({active:!existing});});
  app.post('/api/users/:id/follow',auth,(req,res)=>{const target=Number(req.params.id),me=req.session.user_id;if(target===me)return error(res,400,'Você já faz parte da sua própria história.');if(!Number.isSafeInteger(target)||!db.prepare('SELECT 1 FROM users WHERE id=?').get(target))return error(res,404,'Esta pessoa não foi encontrada.');const existing=db.prepare('SELECT 1 FROM follows WHERE follower_id=? AND following_id=?').get(me,target);if(existing)db.prepare('DELETE FROM follows WHERE follower_id=? AND following_id=?').run(me,target);else {db.prepare('INSERT INTO follows (follower_id,following_id) VALUES (?,?)').run(me,target);notice(target,me,'follow');}update();res.json({active:!existing});});
  app.post('/api/notifications/read',auth,(req,res)=>{db.prepare('UPDATE notifications SET is_read=1 WHERE user_id=?').run(req.session.user_id);update();res.json({ok:true});});
  app.use('/api',(_req,res)=>error(res,404,'Caminho não encontrado.'));
  const dist=resolve(project,'dist');if(existsSync(resolve(dist,'index.html'))){app.use(express.static(dist));app.get('/{*path}',(_req,res)=>res.sendFile(resolve(dist,'index.html')));}
  app.use((err,_req,res,_next)=>{if(err instanceof SyntaxError)return error(res,400,'Não foi possível ler os dados enviados.');if(err.type==='entity.too.large')return error(res,413,'Essa mensagem ficou grande demais.');console.error(err);return error(res,500,'Algo saiu do ritmo. Tente novamente em instantes.');});
  async function close(){if(closed)return;closed=true;clearInterval(interval);await new Promise(r=>io.close(r));db.close();}
  return {app,server,io,db,close};
}
