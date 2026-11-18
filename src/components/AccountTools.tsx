import { useState } from 'react';
import type { User, Snapshot } from '../types';
import { api, friendly } from '../api';
import { Modal } from './UI';

const gallery=Array.from({length:24},(_,i)=>'/assets/portraits/avatar-'+(i+1)+'.png');

export function AccountForm({person,token,close,saved}:{person?:User;token?:string;close:()=>void;saved:(u:User)=>void}) {
  const [fields,setFields]=useState({name:person?.name||'',handle:person?.handle||'',course:person?.course||'',bio:person?.bio||'',avatar:person?.avatar||gallery[0],pin:''});
  const [error,setError]=useState(''),[busy,setBusy]=useState(false);
  const change=(key:keyof typeof fields,value:string)=>setFields(previous=>({...previous,[key]:value}));
  return <Modal title={person?'Editar perfil':'Criar conta'} onClose={close}><form className="account-form" onSubmit={async e=>{
    e.preventDefault(); if(busy)return; setBusy(true);setError('');
    try {saved(await api<User>(person?'/users/'+person.id:'/accounts',token,person?'PATCH':'POST',fields));}
    catch(err){setError(friendly(err));}finally{setBusy(false);}
  }}>
  <label>Nome<input required maxLength={60} value={fields.name} onChange={e=>change('name',e.target.value)}/></label>
  <label>@usuário<input required pattern="[a-zA-Z0-9_][a-zA-Z0-9_.]{1,23}" maxLength={24} value={fields.handle} onChange={e=>change('handle',e.target.value)}/></label>
  <label>Curso ou setor<input maxLength={60} value={fields.course} onChange={e=>change('course',e.target.value)}/></label>
  <label>Biografia<textarea maxLength={180} value={fields.bio} onChange={e=>change('bio',e.target.value)}/></label>
  <label>{person?'Novo PIN (opcional)':'PIN de acesso'}<input type="password" required={!person} autoComplete="new-password" inputMode="numeric" pattern="[0-9]{4,8}" placeholder="4 a 8 números" value={fields.pin} onChange={e=>change('pin',e.target.value)}/></label>
  <fieldset><legend>Avatar</legend><div className="portrait-grid">{[...new Set([...(person?[person.avatar]:[]),...gallery])].map((src,i)=><button key={src} type="button" aria-label={'Avatar '+(i+1)} aria-pressed={fields.avatar===src} onClick={()=>change('avatar',src)}><img src={src} alt=""/></button>)}</div></fieldset>
  {error&&<p role="alert">{error}</p>}<button className="button primary" disabled={busy}>{busy?'Salvando…':person?'Salvar alterações':'Criar minha conta'}</button></form></Modal>;
}

export function AdminTools({data,token,close}:{data:Snapshot;token:string;close:()=>void}){
  const [section,setSection]=useState('accounts'),[query,setQuery]=useState(''),[editing,setEditing]=useState<User>(),[message,setMessage]=useState('');
  const [postId,setPostId]=useState(0),[text,setText]=useState('');
  async function action(path:string,method:string,body?:unknown){
    try{await api(path,token,method,body);setMessage('Alteração salva.');setPostId(0);}
    catch(err){setMessage(friendly(err));}
  }
  if(editing)return <AccountForm person={editing} token={token} close={()=>setEditing(undefined)} saved={()=>{setEditing(undefined);setMessage('Perfil atualizado.');}}/>;
  return <Modal title="Administração" onClose={close} wide><div className="account-form"><div className="segmented-control">{[['accounts','Contas'],['posts','Publicações e respostas']].map(([id,label])=><button key={id} className={id===section?'active':''} onClick={()=>{setSection(id);setQuery('');}}>{label}</button>)}</div>
  <input aria-label="Filtrar registros" placeholder="Pesquisar" value={query} onChange={e=>setQuery(e.target.value)}/><p role="status">{message}</p>
  {section==='accounts'?data.users.filter(u=>(u.name+' '+u.handle).toLowerCase().includes(query.toLowerCase())).map(u=><div className="admin-row" key={u.id}><strong>{u.name} · @{u.handle}</strong><button onClick={()=>setEditing(u)}>Editar</button>{!u.admin&&<button onClick={()=>{if(window.confirm('Excluir a conta @'+u.handle+' e seu conteúdo?'))void action('/admin/users/'+u.id,'DELETE');}}>Excluir</button>}</div>):
  data.posts.filter(p=>p.text.toLowerCase().includes(query.toLowerCase())).map(p=><div className="admin-row" key={p.id}>{postId===p.id?<><textarea aria-label="Texto da publicação" value={text} onChange={e=>setText(e.target.value)}/><button onClick={()=>void action('/admin/posts/'+p.id,'PATCH',{text})}>Salvar</button></>:<><p>{p.text}</p><button onClick={()=>{setPostId(p.id);setText(p.text);}}>Editar</button></>}<button onClick={()=>{if(window.confirm('Excluir esta publicação e suas respostas?'))void action('/posts/'+p.id,'DELETE');}}>Excluir</button></div>)}</div></Modal>;
}
