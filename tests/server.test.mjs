import { test } from 'node:test';
import assert from 'node:assert/strict';
import { once } from 'node:events';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { io as client } from 'socket.io-client';
import { createOffie } from '../server/app.mjs';

async function setup(t, options = {}) {
  let time = 1800000000000;
  const app = createOffie({ dbPath: ':memory:', now: () => time, ...options });
  app.server.listen(0, '127.0.0.1'); await once(app.server, 'listening');
  const url = `http://127.0.0.1:${app.server.address().port}`;
  t.after(() => app.close());
  const request = async (path, { token, method = 'GET', body } = {}) => {
    const r = await fetch(url + '/api' + path, { method, headers: { 'Content-Type': 'application/json', ...(token ? {Authorization:`Bearer ${token}`} : {}) }, ...(body !== undefined ? {body:JSON.stringify(body)} : {}) });
    return { status:r.status, data:await r.json() };
  };
  const login = async (userId = 1) => { const r=await request('/login',{method:'POST',body:{userId,pin:'1234'}}); assert.equal(r.status,200); return r.data.token; };
  return { ...app, url, request, login, advance:ms => {time += ms;} };
}

test('21 contas e 40 publicações iniciais; PIN não é exposto e login inválido é recusado',async t => {
  const s=await setup(t); const users=await s.request('/users'); assert.equal(users.data.length,21); assert.ok(users.data.some(u => u.handle==='offie' && u.avatar.includes('offie-mascot'))); assert.ok(users.data.every(u => !('pin' in u) && !('pin_hash' in u)));
  assert.equal((await s.request('/login',{method:'POST',body:{userId:1,pin:'0000'}})).status,401);
  const token=await s.login(); const snap=await s.request('/snapshot',{token}); assert.equal(snap.data.posts.filter(p=>!p.parentId).length,40); assert.ok(snap.data.trends.length>=5); assert.ok(snap.data.notifications.length>0);
});
test('sessão dura 4 minutos, refresh não reinicia, cooldown bloqueia a conta em outro terminal',async t => {
  const s=await setup(t); const token=await s.login(); const original=(await s.request('/session',{token})).data;
  assert.equal(original.expiresAt-original.serverNow,240000);
  s.advance(100000); assert.equal((await s.request('/session',{token})).data.expiresAt,original.expiresAt);
  assert.equal((await s.request('/login',{method:'POST',body:{userId:1,pin:'1234'}})).status,409);
  s.advance(140000); const expired=await s.request('/posts',{token,method:'POST',body:{text:'Fora do tempo'}}); assert.equal(expired.status,401);
  assert.equal((await s.request('/login',{method:'POST',body:{userId:1,pin:'1234'}})).status,429);
  s.advance(1799999); assert.equal((await s.request('/login',{method:'POST',body:{userId:1,pin:'1234'}})).status,429);
  s.advance(1); assert.ok(await s.login());
});
test('logout antecipado inicia cooldown imediatamente e invalida o token',async t => {
  const s=await setup(t); const token=await s.login(); s.advance(1000); const r=await s.request('/logout',{token,method:'POST'}); assert.equal(r.status,200); assert.equal(r.data.cooldownUntil-r.data.serverNow,1800000);
  assert.equal((await s.request('/snapshot',{token})).status,401); assert.equal((await s.request('/login',{method:'POST',body:{userId:1,pin:'1234'}})).status,429);
});
test('modo acelerado informa e aplica 45 segundos de sessão e 90 de pausa',async t => {
  const s=await setup(t,{sessionMs:45000,cooldownMs:90000}); const token=await s.login();
  const active=(await s.request('/session',{token})).data; assert.equal(active.duration,45000); assert.equal(active.cooldown,90000);
  s.advance(45000); const ended=await s.request('/session',{token}); assert.equal(ended.status,401); const cooldown=await s.request('/login',{method:'POST',body:{userId:1,pin:'1234'}}); assert.equal(cooldown.status,429); assert.equal(cooldown.data.cooldownUntil-cooldown.data.serverNow,90000);
  s.advance(90000); assert.ok(await s.login());
});
test('publicações aceitam 280 Unicode, rejeitam vazio/excesso; exclusão requer autor e apaga respostas',async t => {
  const s=await setup(t); const a=await s.login(1), b=await s.login(2);
  assert.equal((await s.request('/posts',{token:a,method:'POST',body:{text:'   '}})).status,400);
  assert.equal((await s.request('/posts',{token:a,method:'POST',body:{text:'a'.repeat(281)}})).status,400);
  assert.equal((await s.request('/posts',{token:a,method:'POST',body:{text:123}})).status,400);
  const p=await s.request('/posts',{token:a,method:'POST',body:{text:'💛'.repeat(280)}}); assert.equal(p.status,201);
  const reply=await s.request('/posts',{token:b,method:'POST',body:{text:'Que ideia boa! #Projetos',parentId:p.data.id}}); assert.equal(reply.status,201);
  assert.equal((await s.request(`/posts/${p.data.id}`,{token:b,method:'DELETE'})).status,403);
  assert.equal((await s.request(`/posts/${p.data.id}`,{token:a,method:'DELETE'})).status,200);
  const snap=(await s.request('/snapshot',{token:a})).data; assert.ok(!snap.posts.some(x=>x.id===reply.data.id||x.id===p.data.id)); assert.ok(!snap.notifications.some(n=>n.postId===p.data.id));
  assert.equal((await s.request('/posts',{token:a,method:'POST',body:{text:'Resposta',parentId:99999}})).status,404);
});
test('curtir, republicar, responder e seguir geram notificações reais, sem duplicatas ao alternar',async t => {
  const s=await setup(t); const a=await s.login(1), b=await s.login(2); const p=(await s.request('/posts',{token:a,method:'POST',body:{text:'Projeto novo #TesteLocal'}})).data;
  for (const type of ['like','repost']) {
    assert.equal((await s.request(`/posts/${p.id}/${type}`,{token:b,method:'POST'})).status,200);
    let snap=(await s.request('/snapshot',{token:b})).data; assert.equal(snap.posts.find(x=>x.id===p.id)[type==='like'?'liked':'reposted'],true);
    await s.request(`/posts/${p.id}/${type}`,{token:b,method:'POST'}); await s.request(`/posts/${p.id}/${type}`,{token:b,method:'POST'});
  }
  await s.request('/posts',{token:b,method:'POST',body:{text:'Conte comigo!',parentId:p.id}});
  let snap=(await s.request('/snapshot',{token:b})).data;
  if(snap.users.find(u=>u.id===1).isFollowing) await s.request('/users/1/follow',{token:b,method:'POST'});
  await s.request('/users/1/follow',{token:b,method:'POST'});
  snap=(await s.request('/snapshot',{token:a})).data;
  for(const type of ['like','repost','reply']) assert.equal(snap.notifications.filter(n=>n.actorId===2 && n.postId===p.id && n.type===type).length,1);
  assert.ok(snap.notifications.some(n=>n.type==='follow'&&n.actorId===2)); assert.ok(snap.trends.some(t=>t.tag==='#TesteLocal'));
  await s.request('/notifications/read',{token:a,method:'POST'}); assert.ok((await s.request('/snapshot',{token:a})).data.notifications.every(n=>n.read));
  assert.equal((await s.request('/users/1/follow',{token:a,method:'POST'})).status,400);
});
test('dois clientes Socket.IO recebem a publicação sem recarregar e conexão reconcilia estado',async t => {
  const s=await setup(t); const a=await s.login(1), b=await s.login(2); const one=client(s.url,{auth:{token:a},transports:['websocket']}), two=client(s.url,{auth:{token:b},transports:['websocket']}); t.after(()=>{one.close();two.close();});
  await Promise.all([once(one,'connect'),once(two,'connect')]);
  const updateA=once(one,'update'),updateB=once(two,'update');
  const p=await s.request('/posts',{token:a,method:'POST',body:{text:'Bom dia, Totem B!'}});
  await Promise.all([updateA,updateB]); assert.ok((await s.request('/snapshot',{token:b})).data.posts.some(x=>x.id===p.data.id));
  const ended=once(one,'session-ended'); await s.request('/logout',{token:a,method:'POST'}); const [event]=await ended; assert.equal(event.cooldownUntil-event.serverNow,1800000);
});
test('SQLite mantém publicação e cooldown após reiniciar o servidor',async t => {
  const dir=await mkdtemp(join(tmpdir(),'offie-test-')); t.after(()=>rm(dir,{recursive:true,force:true})); const path=join(dir,'test.sqlite');
  const s=await setup(t,{dbPath:path}); const token=await s.login(1); const p=await s.request('/posts',{token,method:'POST',body:{text:'Persistência na LAN'}}); await s.request('/logout',{token,method:'POST'}); await s.close();
  const next=await setup(t,{dbPath:path}); assert.equal((await next.request('/login',{method:'POST',body:{userId:1,pin:'1234'}})).status,429); const other=await next.login(2); assert.ok((await next.request('/snapshot',{token:other})).data.posts.some(x=>x.id===p.data.id)); await next.close();
});

test('Vlad e Offie renovam o mesmo token após quatro minutos',async t=>{
  const s=await setup(t);
  const accounts=(await s.request('/users')).data;
  for(const handle of ['vlad','offie']){
    const user=accounts.find(u=>u.handle===handle);
    const login=await s.request('/login',{method:'POST',body:{userId:user.id,pin:handle==='vlad'?'12345':'1234'}});
    assert.equal(login.status,200);
    s.advance(240000);
    const renewed=await s.request('/session',{token:login.data.token});
    assert.equal(renewed.status,200);
    assert.equal(renewed.data.expiresAt-renewed.data.serverNow,240000);
    assert.equal(renewed.data.token,login.data.token);
  }
});

test('cadastro, perfil e moderação respeitam permissões',async t=>{
  const s=await setup(t);
  const body={name:'Alice',handle:'alice',course:'Design',bio:'Oi!',avatar:'/assets/portraits/avatar-2.png',pin:'54321',admin:true};
  const created=await s.request('/accounts',{method:'POST',body});
  assert.equal(created.status,201);assert.equal(!!created.data.admin,false);
  assert.equal((await s.request('/accounts',{method:'POST',body})).status,409);
  const id=created.data.id;
  const token=(await s.request('/login',{method:'POST',body:{userId:id,pin:body.pin}})).data.token;
  assert.equal((await s.request('/users/'+id,{token,method:'PATCH',body:{...body,bio:'Novo perfil'}})).data.bio,'Novo perfil');
  assert.equal((await s.request('/users/1',{token,method:'PATCH',body})).status,403);
  assert.equal((await s.request('/admin/posts/1',{token,method:'PATCH',body:{text:'Edição'}})).status,403);
  const admin=await s.login(5);
  assert.equal((await s.request('/admin/posts/1',{token:admin,method:'PATCH',body:{text:'Edição'}})).status,200);
  assert.equal((await s.request('/admin/users/'+id,{token:admin,method:'DELETE'})).status,200);
  assert.equal((await s.request('/session',{token})).status,401);
});
