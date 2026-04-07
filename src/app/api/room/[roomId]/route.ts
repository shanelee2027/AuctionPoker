import { NextResponse } from 'next/server';
import { getGame } from '@/lib/store';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ roomId: string }> }
) {
  const { roomId } = await params;
  const state = await getGame(roomId);

  if (!state) {
    return NextResponse.json({ error: 'Room not found' }, { status: 404 });
  }

  // Return lobby info (no sensitive data)
  return NextResponse.json({
    roomId: state.id,
    status: state.status,
    players: state.players.map((p) => ({
      id: p.id,
      name: p.name,
      connected: p.connected,
      isHost: p.isHost,
    })),
  });
}
