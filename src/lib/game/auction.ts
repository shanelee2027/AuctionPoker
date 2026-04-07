import { randomPick } from '../utils';

interface Bid {
  playerId: string;
  amount: number;
}

interface AuctionOutcome {
  winnerId: string;
  pricePaid: number;
}

export function resolveAuction(bids: Bid[]): AuctionOutcome {
  if (bids.length === 0) {
    throw new Error('Cannot resolve auction with no bids');
  }

  // Sort descending by amount
  const sorted = [...bids].sort((a, b) => b.amount - a.amount);
  const highestAmount = sorted[0].amount;

  // Find all players tied at the highest bid
  const tiedWinners = sorted.filter((b) => b.amount === highestAmount);

  // Pick winner randomly among tied players
  const winner = randomPick(tiedWinners);

  // Second-highest bid (the price to pay)
  // Find the highest bid that is NOT from the winner, OR if all tied, the tied amount
  let pricePaid = 0;

  if (tiedWinners.length > 1) {
    // Multiple people tied at top - winner pays the tied amount
    pricePaid = highestAmount;
  } else {
    // Winner is sole highest bidder - pays second highest bid
    const secondHighest = sorted.find((b) => b.playerId !== winner.playerId);
    pricePaid = secondHighest ? secondHighest.amount : 0;
  }

  return { winnerId: winner.playerId, pricePaid };
}
