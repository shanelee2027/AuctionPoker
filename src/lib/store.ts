import { kv } from '@vercel/kv';
import type { GameState } from './types';

const TTL_SECONDS = 2 * 60 * 60; // 2 hours

// In-memory fallback for local development (when KV is not configured)
const localGames = new Map<string, string>();

function useKV(): boolean {
  return !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

export async function getGame(roomId: string): Promise<GameState | null> {
  const key = `game:${roomId}`;

  if (useKV()) {
    const data = await kv.get<GameState>(key);
    return data ?? null;
  }

  const data = localGames.get(key);
  if (!data) return null;
  return JSON.parse(data) as GameState;
}

export async function setGame(roomId: string, state: GameState): Promise<void> {
  const key = `game:${roomId}`;

  if (useKV()) {
    await kv.set(key, state, { ex: TTL_SECONDS });
    return;
  }

  localGames.set(key, JSON.stringify(state));
}

export async function deleteGame(roomId: string): Promise<void> {
  const key = `game:${roomId}`;

  if (useKV()) {
    await kv.del(key);
    return;
  }

  localGames.delete(key);
}
