import { NextResponse } from 'next/server';
import { getGame, setGame } from '@/lib/store';
import type { GameState } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { roomId, playerId } = await request.json();

    const state = await getGame(roomId);
    if (!state) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not in room' }, { status: 403 });
    }

    // Reset to lobby with the same players
    const lobbyState: GameState = {
      id: state.id,
      status: 'lobby',
      players: state.players.map((p) => ({
        ...p,
        chips: 0,
        wonCards: [],
        currentBid: null,
        connected: true,
      })),
      deck: [],
      groups: [],
      currentGroupIndex: 0,
      auctionResults: [],
      version: state.version + 1,
      createdAt: Date.now(),
    };

    await setGame(roomId, lobbyState);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to restart game' }, { status: 500 });
  }
}
