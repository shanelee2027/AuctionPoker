import { NextResponse } from 'next/server';
import { getGame, setGame } from '@/lib/store';

export async function POST(request: Request) {
  try {
    const { roomId, playerId } = await request.json();

    const state = await getGame(roomId);
    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (state.status !== 'auction') {
      return NextResponse.json({ error: 'Not in auction phase' }, { status: 400 });
    }

    const player = state.players.find((p) => p.id === playerId);
    if (!player) {
      return NextResponse.json({ error: 'Player not found' }, { status: 403 });
    }

    if (player.currentBid === null) {
      return NextResponse.json({ error: 'No bid to cancel' }, { status: 400 });
    }

    // Only allow cancel if auction hasn't resolved yet (not all bids in)
    const allIn = state.players.every((p) => p.currentBid !== null);
    if (allIn) {
      return NextResponse.json({ error: 'Auction already resolved' }, { status: 400 });
    }

    state.players = state.players.map((p) =>
      p.id === playerId ? { ...p, currentBid: null } : p
    );
    state.version += 1;

    await setGame(roomId, state);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to cancel bid' }, { status: 500 });
  }
}
