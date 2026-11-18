import { useState } from 'react';
import { motion } from 'motion/react';
import { Heart, MessageCircle, Repeat2, Trash2 } from 'lucide-react';
import type { Post, User } from '../types';
import { timeLabel } from '../api';
import { Avatar, Verified } from './UI';

export interface PostActions { profile: (id: number) => void; thread: (id: number) => void; react: (id: number, type: 'like' | 'repost') => Promise<void>; remove: (id: number) => void; hashtag: (tag: string) => void }
export function PostCard({ post, users, me, actions, inThread = false }: { post: Post; users: User[]; me: number; actions: PostActions; inThread?: boolean }) {
  const user = users.find(u => u.id === post.userId)!;
  const [pending, setPending] = useState('');
  if (!user) return null;
  async function react(type: 'like' | 'repost') { if (pending) return; setPending(type); try { await actions.react(post.id, type); } finally { setPending(''); } }
  return <motion.article className={`post-card ${inThread ? 'thread-post' : ''}`} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .22 }}>
    <Avatar user={user} onClick={() => actions.profile(user.id)}/><div className="post-content"><div className="post-meta"><button className="post-author" onClick={() => actions.profile(user.id)}>{user.name}{user.official && <Verified/>}</button><span className="post-handle">@{user.handle}</span><span className="post-time">· {timeLabel(post.createdAt)}</span>{post.userId === me && <button className="icon-button delete-post" onClick={() => actions.remove(post.id)} aria-label="Excluir publicação"><Trash2 size={16}/></button>}</div><div className="post-text">{post.text.split(/(#[\p{L}\p{N}_]+)/gu).map((part, i) => part.startsWith('#') ? <button key={i} className="hashtag" onClick={() => actions.hashtag(part)}>{part}</button> : part)}</div><div className="post-actions"><motion.button className={`post-action ${post.liked ? 'liked' : ''}`} whileTap={{ scale: .85 }} onClick={() => void react('like')} disabled={!!pending} aria-label={post.liked ? 'Remover curtida' : 'Curtir publicação'} aria-pressed={post.liked}><motion.span key={String(post.liked)} animate={post.liked ? { scale: [1, 1.35, 1] } : { scale: 1 }}><Heart size={20} fill={post.liked ? 'currentColor' : 'none'}/></motion.span><span>{post.likes || 'Curtir'}</span></motion.button><button className="post-action" onClick={() => actions.thread(post.id)} aria-label="Ver respostas"><MessageCircle size={20}/><span>{post.replies || 'Responder'}</span></button><motion.button className={`post-action ${post.reposted ? 'reposted' : ''}`} whileTap={{ scale: .9 }} onClick={() => void react('repost')} disabled={!!pending} aria-label={post.reposted ? 'Desfazer republicação' : 'Republicar'} aria-pressed={post.reposted}><Repeat2 size={21}/><span>{post.reposts || 'Republicar'}</span></motion.button></div></div>
  </motion.article>;
}
