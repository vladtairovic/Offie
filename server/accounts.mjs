import { scryptSync } from 'node:crypto';
import { getUsers } from './store.mjs';

const hash = (pin,id) => scryptSync(pin,'offie-demo-'+id,32).toString('hex');
const portrait = n => '/assets/portraits/avatar-'+n+'.png';
export function migrateAccounts(db) {
  if(db.prepare('PRAGMA table_info(users)').all().some(c=>c.name==='admin')) return;
  db.exec('BEGIN');
  try {
    db.exec('ALTER TABLE users ADD COLUMN admin INTEGER NOT NULL DEFAULT 0');
    db.prepare("UPDATE users SET admin=1,cooldown_until=0 WHERE handle='offie'").run();
    const id=Number(db.prepare("INSERT INTO users(name,handle,course,bio,color,avatar,official,admin,pin_hash) VALUES ('Vlad','vlad','Administração','Administrador do Offie.','#ffdf88',?,0,1,'')").run(portrait(24)).lastInsertRowid);
    db.prepare('UPDATE users SET pin_hash=? WHERE id=?').run(hash('12345',id),id);
    db.prepare("UPDATE users SET avatar='/assets/portraits/avatar-' || id || '.png' WHERE admin=0 AND id BETWEEN 1 AND 20 AND avatar='/assets/avatar-' || id || '.svg'").run();
    db.exec('COMMIT');
  } catch(e){ db.exec('ROLLBACK'); throw e; }
}
export function accountRoutes(app,db,auth,update,error) {
  function save(req,res) {
    const editing=req.method==='PATCH';
    const current=editing && db.prepare('SELECT * FROM users WHERE id=?').get(Number(req.params.id));
    if(editing && !current)return error(res,404,'Conta não encontrada.');
    if(editing && current.id!==req.session.user_id && !req.session.admin)return error(res,403,'Sem permissão para editar este perfil.');
    const {name,handle,course,bio,avatar,pin=''}=req.body||{};
    if(typeof name!=='string'||!name.trim()||name.length>60||typeof handle!=='string'||!/^\w[\w.]{1,23}$/.test(handle)||typeof course!=='string'||course.length>60||typeof bio!=='string'||bio.length>180)return error(res,400,'Confira nome, usuário (2 a 24 caracteres), curso e biografia.');
    if((!editing||pin!=='')&&(typeof pin!=='string'||!/^\d{4,8}$/.test(pin)))return error(res,400,'Use um PIN de 4 a 8 números.');
    if(typeof avatar!=='string' || (avatar!==current?.avatar && !Array.from({length:24},(_,i)=>portrait(i+1)).includes(avatar)))return error(res,400,'Escolha um avatar da galeria.');
    const username=handle.toLowerCase();
    if(db.prepare('SELECT id FROM users WHERE lower(handle)=? AND id<>?').get(username,current?.id||0))return error(res,409,'Esse @usuário já está em uso.');
    db.exec('BEGIN');
    let id=current?.id;
    try {
      if(editing)db.prepare('UPDATE users SET name=?,handle=?,course=?,bio=?,avatar=? WHERE id=?').run(name.trim(),username,course.trim(),bio.trim(),avatar,id);
      else id=Number(db.prepare("INSERT INTO users(name,handle,course,bio,avatar,color,official,pin_hash) VALUES (?,?,?,?,?,'#eadbc4',0,'')").run(name.trim(),username,course.trim(),bio.trim(),avatar).lastInsertRowid);
      if(pin)db.prepare('UPDATE users SET pin_hash=? WHERE id=?').run(hash(pin,id),id);
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    update();res.status(editing?200:201).json(getUsers(db).find(u=>u.id===id));
  }
  app.post('/api/accounts',save);
  app.patch('/api/users/:id',auth,save);
  app.use('/api/admin',auth,(req,res,next)=>req.session.admin?next():error(res,403,'Apenas administradores.'));
  app.patch('/api/admin/posts/:id',(req,res)=>{
    const text=req.body?.text;
    if(typeof text!=='string'||!text.trim()||Array.from(text.trim()).length>280)return error(res,400,'Use de 1 a 280 caracteres.');
    if(!db.prepare('UPDATE posts SET text=? WHERE id=?').run(text.trim(),Number(req.params.id)).changes)return error(res,404,'Publicação não encontrada.');
    update();res.json({ok:true});
  });
  app.delete('/api/admin/users/:id',(req,res)=>{
    const id=Number(req.params.id);
    const target=db.prepare('SELECT admin FROM users WHERE id=?').get(id);
    if(!target)return error(res,404,'Conta não encontrada.');
    if(target.admin)return error(res,400,'As duas contas administrativas são permanentes.');
    db.exec('BEGIN');
    try{
      for(const table of ['sessions','likes','reposts','posts'])db.prepare('DELETE FROM '+table+' WHERE user_id=?').run(id);
      db.prepare('DELETE FROM notifications WHERE user_id=? OR actor_id=?').run(id,id);
      db.prepare('DELETE FROM follows WHERE follower_id=? OR following_id=?').run(id,id);
      db.prepare('DELETE FROM users WHERE id=?').run(id);
      db.exec('COMMIT');
    }catch(e){db.exec('ROLLBACK');throw e;}
    update();res.json({ok:true});
  });
}
