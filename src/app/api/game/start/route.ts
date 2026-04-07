import { NextResponse } from 'next/server';
import { getGame, setGame } from '@/lib/store';
import { createGame } from '@/lib/game/game-engine';
import { MIN_PLAYERS } from '@/lib/constants';

export async function POST(request: Request) {
  try {
    const { roomId, playerId } = await request.json();

    const state = await getGame(roomId);
    if (!state) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    if (state.status !== 'lobby') {
      return NextResponse.json({ error: 'Game already started' }, { status: 400 });
    }

    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 });
    }

    if (!player.isHost) {
      return NextResponse.json({ error: 'Only the host can start the game' }, { status: 403 });
    }

    if (state.players.length < MIN_PLAYERS) {
      return NextResponse.json({ error: `Need at least ${MIN_PLAYERS} players` }, { status: 400 });
    }

    const gameState = createGame(
      roomId,
      state.players.map((p) => ({ id: p.id, name: p.name, isHost: p.isHost }))
    );

    await setGame(roomId, gameState);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to start game' }, { status: 500 });
  }
}
