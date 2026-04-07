'use client';

import type { AuctionResult, PlayerPublicInfo } from '@/lib/types';

interface AuctionHistoryProps {
  results: AuctionResult[];
  players: PlayerPublicInfo[];
}

export function AuctionHistory({ results, players }: AuctionHistoryProps) {
  if (results.length === 0) return null;

  const playerName = (id: string) =>
    players.find((p) => p.id === id)?.name || 'Unknown';

  return (
    <div className="bg-gray-800/40 rounded-xl p-4">
      <h3 className="text-sm font-semibold text-gray-400 mb-3">
        Auction History
      </h3>
      <div className="space-y-2 max-h-48 overflow-y-auto">
        {results.map((result) => (
          <div
            key={result.groupIndex}
            className="flex items-center justify-between text-sm bg-gray-700/30 rounded-lg px-3 py-2"
          >
            <span className="text-gray-300">
              Group {result.groupIndex}
            </span>
            <span className="text-white font-medium">
              {playerName(result.winnerId)}
            </span>
            <span className="text-amber-400">
              {result.pricePaid} chips
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
