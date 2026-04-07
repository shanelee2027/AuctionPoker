import type { GameState } from './types';

// In-memory store for local development
// In production, replace with Vercel KV (@vercel/kv)
const games = new Map<string, string>();

const TTL_MS = 2 * 60 * 60 * 1000; // 2 hours
const expirations = new Map<string, NodeJS.Timeout>();

export async function getGame(roomId: string): Promise<GameState | null> {
  const data = games.get(`game:${roomId}`);
  if (!data) return null;
  return JSON.parse(data) as GameState;
}

export async function setGame(roomId: string, state: GameState): Promise<void> {
  const key = `game:${roomId}`;
  games.set(key, JSON.stringify(state));

  // Reset TTL
  const existing = expirations.get(key);
  if (existing) clearTimeout(existing);
  expirations.set(
    key,
    setTimeout(() => {
      games.delete(key);
      expirations.delete(key);
    }, TTL_MS)
  );
}

export async function deleteGame(roomId: string): Promise<void> {
  const key = `game:${roomId}`;
  games.delete(key);
  const timer = expirations.get(key);
  if (timer) {
    clearTimeout(timer);
    expirations.delete(key);
  }
}

// Optimistic locking helper
export async function updateGame(
  roomId: string,
  updater: (state: GameState) => GameState
): Promise<GameState> {
  const state = await getGame(roomId);
  if (!state) throw new Error('Game not found');

  const newState = updater(state);
  await setGame(roomId, newState);
  return newState;
}
