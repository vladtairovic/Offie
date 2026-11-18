import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { seed } from './seed.mjs';

export function openStore(path, now) {
  if(path!==':memory:') mkdirSync(dirname(path),{recursive:true});
  const db=new DatabaseSync(path);
  db.exec(`PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON;
    CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY,name TEXT NOT NULL,handle TEXT UNIQUE NOT NULL,course TEXT NOT NULL,bio TEXT NOT NULL,color TEXT NOT NULL,avatar TEXT NOT NULL,official INTEGER NOT NULL DEFAULT 0,pin_hash TEXT NOT NULL,cooldown_until INTEGER NOT NULL DEFAULT 0);
    CREATE TABLE IF NOT EXISTS sessions (token TEXT PRIMARY KEY,user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),expires_at INTEGER NOT NULL,duration INTEGER NOT NULL);
    CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL REFERENCES users(id),text TEXT NOT NULL,created_at INTEGER NOT NULL,parent_id INTEGER REFERENCES posts(id) ON DELETE CASCADE);
    CREATE TABLE IF NOT EXISTS likes (user_id INTEGER NOT NULL REFERENCES users(id),post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,PRIMARY KEY(user_id,post_id));
    CREATE TABLE IF NOT EXISTS reposts (user_id INTEGER NOT NULL REFERENCES users(id),post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,created_at INTEGER NOT NULL,PRIMARY KEY(user_id,post_id));
    CREATE TABLE IF NOT EXISTS follows (follower_id INTEGER NOT NULL REFERENCES users(id),following_id INTEGER NOT NULL REFERENCES users(id),PRIMARY KEY(follower_id,following_id));
    CREATE TABLE IF NOT EXISTS notifications (id INTEGER PRIMARY KEY AUTOINCREMENT,user_id INTEGER NOT NULL REFERENCES users(id),actor_id INTEGER NOT NULL REFERENCES users(id),type TEXT NOT NULL,post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,created_at INTEGER NOT NULL,is_read INTEGER NOT NULL DEFAULT 0);
    CREATE INDEX IF NOT EXISTS posts_parent ON posts(parent_id);
    CREATE INDEX IF NOT EXISTS notifications_user ON notifications(user_id,created_at);
  `);
  seed(db,now);
  return db;
}

export function getUsers(db, viewer=0) {
  return db.prepare(`SELECT u.id,u.name,u.handle,u.course,u.bio,u.color,u.avatar,u.official,
  (SELECT count(*) FROM follows WHERE following_id=u.id) as followers,
  (SELECT count(*) FROM follows WHERE follower_id=u.id) as following,
  (SELECT count(*) FROM posts WHERE user_id=u.id AND parent_id IS NULL) as posts,
  EXISTS(SELECT 1 FROM follows WHERE follower_id=? AND following_id=u.id) as isFollowing FROM users u ORDER BY u.id`).all(viewer).map(u=>({...u,official:!!u.official,isFollowing:!!u.isFollowing}));
}
export function getSnapshot(db,viewer,now) {
  const posts=db.prepare(`SELECT p.id,p.user_id as userId,p.text,p.created_at as createdAt,p.parent_id as parentId,
    (SELECT count(*) FROM likes WHERE post_id=p.id) as likes,
    (SELECT count(*) FROM posts WHERE parent_id=p.id) as replies,
    (SELECT count(*) FROM reposts WHERE post_id=p.id) as reposts,
    EXISTS(SELECT 1 FROM likes WHERE post_id=p.id AND user_id=?) as liked,
    EXISTS(SELECT 1 FROM reposts WHERE post_id=p.id AND user_id=?) as reposted FROM posts p ORDER BY p.created_at DESC,p.id DESC`).all(viewer,viewer).map(p=>({...p,liked:!!p.liked,reposted:!!p.reposted,reposters:[]}));
  const byId=new Map(posts.map(p=>[p.id,p]));
  for(const r of db.prepare('SELECT user_id,post_id FROM reposts').all()) byId.get(r.post_id)?.reposters.push(r.user_id);
  const tags=new Map();
  for(const p of posts) for(const tag of new Set(p.text.match(/#[\p{L}\p{N}_]+/gu)||[])) { const key=tag.toLocaleLowerCase('pt-BR'); const entry=tags.get(key)||{tag,count:0}; entry.count++; tags.set(key,entry); }
  return {users:getUsers(db,viewer),posts,notifications:db.prepare('SELECT id,actor_id as actorId,type,post_id as postId,created_at as createdAt,is_read as read FROM notifications WHERE user_id=? ORDER BY created_at DESC,id DESC LIMIT 200').all(viewer).map(n=>({...n,read:!!n.read})),trends:[...tags.values()].sort((a,b)=>b.count-a.count),serverNow:now};
}
