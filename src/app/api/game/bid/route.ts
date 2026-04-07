import { NextResponse } from 'next/server';
import { getGame, setGame } from '@/lib/store';
import {
  submitBid,
  allBidsIn,
  advanceAuction,
} from '@/lib/game/game-engine';

export async function POST(request: Request) {
  try {
    const { roomId, playerId, amount } = await request.json();

    if (typeof amount !== 'number' || amount < 0 || !Number.isInteger(amount)) {
      return NextResponse.json({ error: 'Invalid bid amount' }, { status: 400 });
    }

    let state = await getGame(roomId);
    if (!state) {
      return NextResponse.json({ error: 'Game not found' }, { status: 404 });
    }

    if (state.status !== 'auction') {
      return NextResponse.json({ error: 'Not in auction phase' }, { status: 400 });
    }

    // Submit the bid
    try {
      state = submitBid(state, playerId, amount);
    } catch (err) {
      return NextResponse.json(
        { error: (err as Error).message },
        { status: 400 }
      );
    }

    // Check if all bids are in — resolve auction automatically
    if (allBidsIn(state)) {
      state = advanceAuction(state);
    }

    await setGame(roomId, state);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to submit bid' }, { status: 500 });
  }
}
