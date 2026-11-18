export interface User { id: number; name: string; handle: string; bio: string; course: string; color: string; avatar: string; official: boolean; followers: number; following: number; posts: number; isFollowing: boolean }
export interface Post { id: number; userId: number; text: string; createdAt: number; parentId: number | null; likes: number; replies: number; reposts: number; liked: boolean; reposted: boolean; reposters: number[] }
export interface Notice { id: number; actorId: number; type: 'like' | 'reply' | 'follow' | 'repost'; postId: number | null; createdAt: number; read: boolean }
export interface Trend { tag: string; count: number }
export interface Snapshot { users: User[]; posts: Post[]; notifications: Notice[]; trends: Trend[]; serverNow: number }
export interface Session { token: string; userId: number; expiresAt: number; duration: number; serverNow: number; cooldown: number; clientSavedAt?: number }
export type Page = 'home' | 'explore' | 'notifications' | 'profile';
