import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, Check, Moon, Sun, Wifi, X } from 'lucide-react';
import { mascot } from '../api';
import type { User } from '../types';

export function Brand({ small = false }: { small?: boolean }) { return <span className={`brand ${small ? 'brand-small' : ''}`} aria-label="Offie"><span className="brand-symbol"><Wifi size={23} strokeWidth={3}/></span>offie<span className="brand-dot">.</span></span>; }
export function Avatar({ user, size = '', onClick }: { user: User; size?: string; onClick?: () => void }) { const content = <img src={user.avatar} alt={user.name} draggable={false}/>; return onClick ? <button className={`avatar ${size}`} style={{ background: user.color }} onClick={onClick} aria-label={`Ver perfil de ${user.name}`}>{content}</button> : <span className={`avatar ${size}`} style={{ background: user.color }}>{content}</span>; }
export function Verified() { return <span className="verified" title="Conta oficial"><Check size={10} strokeWidth={4}/></span>; }
export function ThemeButton({ dark, toggle }: { dark: boolean; toggle: () => void }) { return <button className="icon-button theme-toggle" onClick={toggle} aria-label={dark ? 'Ativar tema claro' : 'Ativar tema escuro'}>{dark ? <Sun size={21}/> : <Moon size={21}/>}</button>; }
export function Connection({ connected }: { connected: boolean }) { return <span className={`connection ${connected ? '' : 'disconnected'}`}><span className="status-dot"/>{connected ? 'Conectado ao campus' : 'Reconectando ao campus'}</span>; }
export function Empty({ title, description, action }: { title: string; description: string; action?: ReactNode }) { return <div className="empty-state"><img src={mascot} alt="Offie está com você"/><h3>{title}</h3><p>{description}</p>{action}</div>; }
export function Modal({ title, children, onClose, wide = false }: { title: string; children: ReactNode; onClose: () => void; wide?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    ref.current?.focus();
    const keydown = (e: KeyboardEvent) => {
      const dialogs = document.querySelectorAll('[role="dialog"]');
      if (dialogs[dialogs.length - 1] !== ref.current) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const nodes = Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input, textarea, [tabindex="0"]') || []);
        const first = nodes[0], last = nodes[nodes.length - 1];
        if (e.shiftKey && (document.activeElement === first || document.activeElement === ref.current)) { e.preventDefault(); last?.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
      }
    };
    document.addEventListener('keydown', keydown);
    return () => { document.removeEventListener('keydown', keydown); if (previous?.isConnected) previous.focus(); };
  }, [onClose]);
  return <motion.div className="modal-backdrop" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}><motion.div ref={ref} tabIndex={-1} role="dialog" aria-modal="true" aria-label={title} className={`modal ${wide ? 'modal-wide' : ''}`} initial={{ y: 30, scale: .97 }} animate={{ y: 0, scale: 1 }} exit={{ y: 20, opacity: 0 }} transition={{ duration: .2 }}><div className="modal-header"><h2>{title}</h2><button className="icon-button" aria-label="Fechar" onClick={onClose}><X size={22}/></button></div>{children}</motion.div></motion.div>;
}
export function ArrowLink({ children, onClick }: { children: ReactNode; onClick: () => void }) { return <button className="text-link" onClick={onClick}>{children}<ArrowUpRight size={17}/></button>; }
