'use client';

import type { PlayerView } from '@/lib/types';
import { CardGroupDisplay } from './CardGroupDisplay';
import { BidPanel } from './BidPanel';
import { PlayerBar } from './PlayerBar';
import { AuctionHistory } from './AuctionHistory';
import { WonCards } from './WonCards';
import { HiddenCards } from './HiddenCards';
import { ChatPanel } from './ChatPanel';

interface GameBoardProps {
  gameState: PlayerView;
  currentPlayerId: string;
  onSubmitBid: (amount: number) => Promise<void>;
  onCancelBid: () => Promise<void>;
  onSendMessage: (text: string) => Promise<void>;
}

export function GameBoard({
  gameState,
  currentPlayerId,
  onSubmitBid,
  onCancelBid,
  onSendMessage,
}: GameBoardProps) {
  const playerName = (id: string) =>
    gameState.players.find((p) => p.id === id)?.name;

  const isAuction = gameState.status === 'auction';

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-green-950 p-4 lg:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-amber-400">Auction Poker</h1>
          <div className="text-sm text-gray-400">
            Room: <span className="text-white font-mono">{gameState.id}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main area: card groups + bid panel */}
          <div className="lg:col-span-3 space-y-6">
            {/* Card Groups */}
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-3">
                Card Groups
                {isAuction && (
                  <span className="ml-2 text-amber-400">
                    - Round {gameState.currentGroupIndex + 1} of{' '}
                    {gameState.groups.length}
                  </span>
                )}
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {gameState.groups.map((group) => (
                  <CardGroupDisplay
                    key={group.index}
                    group={group}
                    isActive={
                      isAuction &&
                      group.index === gameState.groups[gameState.currentGroupIndex]?.index
                    }
                    winnerName={
                      group.winnerId
                        ? playerName(group.winnerId)
                        : undefined
                    }
                  />
                ))}
              </div>
            </div>

            {/* Bid Panel */}
            {isAuction && (
              <BidPanel
                maxChips={gameState.myChips}
                bidSubmitted={gameState.myBidSubmitted}
                onSubmitBid={onSubmitBid}
                onCancelBid={onCancelBid}
                roundIndex={gameState.currentGroupIndex}
              />
            )}

            {/* Won Cards */}
            <WonCards cards={gameState.myCards} bestHand={gameState.myHand} />

            {/* Hidden Cards - process of elimination */}
            {isAuction && <HiddenCards gameState={gameState} />}
          </div>

          {/* Sidebar: players + history */}
          <div className="space-y-4">
            <div>
              <h2 className="text-sm font-semibold text-gray-400 mb-3">
                Players
              </h2>
              <div className="space-y-2">
                {gameState.players.map((player) => (
                  <PlayerBar
                    key={player.id}
                    player={player}
                    isCurrentPlayer={player.id === currentPlayerId}
                    showBidStatus={isAuction}
                    wonGroups={gameState.groups.filter(
                      (g) => g.auctioned && g.winnerId === player.id
                    )}
                  />
                ))}
              </div>
            </div>

            <AuctionHistory
              results={gameState.auctionResults}
              players={gameState.players}
            />

            <ChatPanel
              messages={gameState.messages}
              currentPlayerId={currentPlayerId}
              onSend={onSendMessage}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
