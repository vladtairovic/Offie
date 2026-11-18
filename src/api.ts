export class ApiError extends Error {
  status: number; data: Record<string, unknown>;
  constructor(status: number, data: Record<string, unknown>) { super(String(data.error || 'Não foi possível conectar. Tente novamente.')); this.status = status; this.data = data; }
}
export async function api<T>(path: string, token?: string, method = 'GET', body?: unknown): Promise<T> {
  const response = await fetch(`/api${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, ...(body !== undefined ? { body: JSON.stringify(body) } : {}), signal: AbortSignal.timeout(10000) });
  const data = await response.json();
  if (!response.ok) throw new ApiError(response.status, data);
  return data as T;
}
export function friendly(error: unknown) { return error instanceof ApiError ? error.message : 'A conexão com o servidor local oscilou. Tente novamente.'; }
export const mascot = '/assets/offie-mascot.png';
export function timeLabel(timestamp: number) { const minutes = Math.max(0, Math.floor((Date.now() - timestamp) / 60000)); return minutes < 1 ? 'agora' : minutes < 60 ? `${minutes} min` : minutes < 1440 ? `${Math.floor(minutes / 60)} h` : `${Math.floor(minutes / 1440)} d`; }
export function countdown(seconds: number) { return `${Math.floor(Math.max(0, seconds) / 60).toString().padStart(2, '0')}:${Math.floor(Math.max(0, seconds) % 60).toString().padStart(2, '0')}`; }
