import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { generateRoomCode } from '@/lib/utils';
import { setGame } from '@/lib/store';
import type { GameState } from '@/lib/types';

export async function POST(request: Request) {
  try {
    const { playerName } = await request.json();

    if (!playerName || typeof playerName !== 'string' || playerName.trim().length === 0) {
      return NextResponse.json({ error: 'Player name is required' }, { status: 400 });
    }

    const roomId = generateRoomCode();
    const playerId = uuidv4();

    const state: GameState = {
      id: roomId,
      status: 'lobby',
      players: [
        {
          id: playerId,
          name: playerName.trim(),
          chips: 0,
          wonCards: [],
          currentBid: null,
          connected: true,
          isHost: true,
        },
      ],
      deck: [],
      groups: [],
      currentGroupIndex: 0,
      auctionResults: [],
      version: 1,
      createdAt: Date.now(),
    };

    await setGame(roomId, state);

    return NextResponse.json({ roomId, playerId });
  } catch {
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
