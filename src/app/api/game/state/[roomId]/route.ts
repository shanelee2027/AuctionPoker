import { NextResponse } from 'next/server';
import { getGame } from '@/lib/store';
import { getPlayerView } from '@/lib/game/game-engine';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const url = new URL(request.url);
  const playerId = url.searchParams.get('playerId');

  if (!playerId) {
    return NextResponse.json({ error: 'playerId is required' }, { status: 400 });
  }

  const state = await getGame(roomId);
  if (!state) {
    return NextResponse.json({ error: 'Game not found' }, { status: 404 });
  }

  if (state.status === 'lobby') {
    return NextResponse.json({
      id: state.id,
      status: 'lobby',
      players: state.players.map((p) => ({
        id: p.id,
        name: p.name,
        connected: p.connected,
        isHost: p.isHost,
      })),
    });
  }

  try {
    const view = getPlayerView(state, playerId);
    return NextResponse.json(view);
  } catch {
    return NextResponse.json({ error: 'Player not found in game' }, { status: 403 });
  }
}
