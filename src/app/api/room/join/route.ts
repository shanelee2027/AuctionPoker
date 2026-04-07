import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getGame, setGame } from '@/lib/store';
import { MAX_PLAYERS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { roomId, playerName } = await request.json();

    if (!roomId || !playerName?.trim()) {
      return NextResponse.json({ error: 'Room code and player name are required' }, { status: 400 });
    }

    const state = await getGame(roomId.toUpperCase());
    if (!state) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (state.status !== 'lobby') {
      return NextResponse.json({ error: 'Game already in progress' }, { status: 400 });
    }

    if (state.players.length >= MAX_PLAYERS) {
      return NextResponse.json({ error: 'Room is full' }, { status: 400 });
    }

    const playerId = uuidv4();

    state.players.push({
      id: playerId,
      name: playerName.trim(),
      chips: 0,
      wonCards: [],
      currentBid: null,
      connected: true,
      isHost: false,
    });

    state.version += 1;
    await setGame(state.id, state);

    return NextResponse.json({ roomId: state.id, playerId });
  } catch {
    return NextResponse.json({ error: 'Failed to join room' }, { status: 500 });
  }
}
