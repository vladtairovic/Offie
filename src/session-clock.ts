import type { Session } from './types';

/** Keeps asynchronous responses attached to the account that requested them. */
export class SessionClock {
  token: string | null = null;
  deadline = 0;
  cooldownMs = 1800000;
  private now: () => number;
  constructor(session: Session | null, now = Date.now) { this.now = now; if (session) this.start(session); }
  start(session: Session) {
    this.token = session.token;
    this.deadline = (session.clientSavedAt ?? this.now()) + session.expiresAt - session.serverNow;
    this.cooldownMs = session.cooldown ?? 1800000;
  }
  accepts(token: string) { return token === this.token; }
  reconcile(token: string, session: Session) {
    if (!this.accepts(token)) return false;
    this.start({ ...session, clientSavedAt: this.now() });
    return true;
  }
  end(token: string) { if (!this.accepts(token)) return false; this.token = null; return true; }
  get cooldownUntil() { return this.deadline + this.cooldownMs; }
}
