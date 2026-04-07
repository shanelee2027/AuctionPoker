import { createClient } from 'redis';
import type { GameState } from './types';

const TTL_SECONDS = 2 * 60 * 60; // 2 hours

// Redis client for production (Vercel KV / Redis)
let redisClient: ReturnType<typeof createClient> | null = null;

async function getRedis() {
  if (!process.env.REDIS_URL) return null;

  if (!redisClient) {
    redisClient = createClient({ url: process.env.REDIS_URL });
    await redisClient.connect();
  }

  return redisClient;
}

// In-memory fallback for local development
const localGames = new Map<string, string>();

export async function getGame(roomId: string): Promise<GameState | null> {
  const key = `game:${roomId}`;
  const redis = await getRedis();

  if (redis) {
    const data = await redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as GameState;
  }

  const data = localGames.get(key);
  if (!data) return null;
  return JSON.parse(data) as GameState;
}

export async function setGame(roomId: string, state: GameState): Promise<void> {
  const key = `game:${roomId}`;
  const json = JSON.stringify(state);
  const redis = await getRedis();

  if (redis) {
    await redis.set(key, json, { EX: TTL_SECONDS });
    return;
  }

  localGames.set(key, json);
}

export async function deleteGame(roomId: string): Promise<void> {
  const key = `game:${roomId}`;
  const redis = await getRedis();

  if (redis) {
    await redis.del(key);
    return;
  }

  localGames.delete(key);
}
