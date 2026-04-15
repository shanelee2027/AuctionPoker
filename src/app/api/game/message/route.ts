import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getGame, setGame } from '@/lib/store';
import type { ChatMessage } from '@/lib/types';

const MAX_MESSAGE_LENGTH = 500;
const MAX_STORED_MESSAGES = 200;

export async function POST(request: Request) {
  try {
    const { roomId, playerId, text } = await request.json();

    if (typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json({ error: 'Message is empty' }, { status: 400 });
    }

    const trimmed = text.trim().slice(0, MAX_MESSAGE_LENGTH);

    const state = await getGame(roomId);
    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not in game' }, { status: 403 });
    }

    const message: ChatMessage = {
      id: uuidv4(),
      playerId,
      playerName: player.name,
      text: trimmed,
      timestamp: Date.now(),
    };

    const existing = state.messages ?? [];
    const messages = [...existing, message].slice(-MAX_STORED_MESSAGES);

    await setGame(roomId, { ...state, messages });

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to send message' }, { status: 500 });
  }
}
