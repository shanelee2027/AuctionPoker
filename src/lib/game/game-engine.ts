import type {
  GameState,
  Player,
  Card,
  PlayerView,
  PlayerPublicInfo,
  CardGroupView,
  CardView,
  HandResult,
  ShowdownResult,
} from '../types';
import { STARTING_CHIPS } from '../constants';
import { createDeck, shuffleDeck } from './deck';
import { partitionDeck } from './partition';
import { resolveAuction } from './auction';
import { bestFiveCardHand, compareHands } from './hand-eval';

export function createGame(
  roomId: string,
  players: { id: string; name: string; isHost: boolean }[]
): GameState {
  const deck = shuffleDeck(createDeck());
  const groups = partitionDeck(deck, players.length);

  return {
    id: roomId,
    status: 'auction',
    players: players.map((p) => ({
      id: p.id,
      name: p.name,
      chips: STARTING_CHIPS,
      wonCards: [],
      currentBid: null,
      connected: true,
      isHost: p.isHost,
    })),
    deck,
    groups,
    currentGroupIndex: 0,
    auctionResults: [],
    version: 1,
    createdAt: Date.now(),
  };
}

export function submitBid(
  state: GameState,
  playerId: string,
  amount: number
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Player not found');
  if (state.status !== 'auction') throw new Error('Game is not in auction phase');
  if (player.currentBid !== null) throw new Error('Bid already submitted');
  if (amount < 0) throw new Error('Bid must be non-negative');
  if (amount > player.chips) throw new Error('Bid exceeds available chips');
  if (!Number.isInteger(amount)) throw new Error('Bid must be a whole number');

  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, currentBid: amount } : p
    ),
  };
}

export function allBidsIn(state: GameState): boolean {
  return state.players.every((p) => p.currentBid !== null);
}

export function advanceAuction(state: GameState): GameState {
  if (!allBidsIn(state)) throw new Error('Not all bids are in');

  const currentGroup = state.groups[state.currentGroupIndex];
  const bids = state.players.map((p) => ({
    playerId: p.id,
    amount: p.currentBid!,
  }));

  const { winnerId, pricePaid } = resolveAuction(bids);

  const auctionResult = {
    groupIndex: currentGroup.index,
    bids,
    winnerId,
    pricePaid,
  };

  // Award cards to winner, reveal face-down cards for winner
  const wonCards = currentGroup.cards.map((c) => ({ ...c, faceDown: false }));

  const newGroups = state.groups.map((g, i) =>
    i === state.currentGroupIndex
      ? { ...g, auctioned: true, winnerId }
      : g
  );

  const newPlayers = state.players.map((p) => ({
    ...p,
    chips: p.id === winnerId ? p.chips - pricePaid : p.chips,
    wonCards: p.id === winnerId ? [...p.wonCards, ...wonCards] : p.wonCards,
    currentBid: null, // reset for next round
  }));

  const nextGroupIndex = state.currentGroupIndex + 1;
  const isLastGroup = nextGroupIndex >= state.groups.length;

  return {
    ...state,
    players: newPlayers,
    groups: newGroups,
    currentGroupIndex: isLastGroup ? state.currentGroupIndex : nextGroupIndex,
    auctionResults: [...state.auctionResults, auctionResult],
    status: isLastGroup ? 'showdown' : 'auction',
    version: state.version + 1,
  };
}

export function resolveShowdown(state: GameState): {
  state: GameState;
  results: ShowdownResult[];
} {
  const results: ShowdownResult[] = state.players
    .map((player) => {
      const hand = bestFiveCardHand(player.wonCards);
      const completedAtRound = hand
        ? findCompletionRound(state, player.id, hand)
        : state.groups.length;

      return {
        playerId: player.id,
        playerName: player.name,
        hand: hand!,
        allCards: player.wonCards,
        completedAtRound,
      };
    })
    .filter((r) => r.hand !== null);

  // Sort by hand rank, then by completion round for tiebreak
  results.sort((a, b) => {
    const handComp = compareHands(a.hand, b.hand);
    if (handComp !== 0) return handComp;
    return a.completedAtRound - b.completedAtRound; // earlier = better
  });

  return {
    state: { ...state, status: 'finished', version: state.version + 1 },
    results,
  };
}

function findCompletionRound(
  state: GameState,
  playerId: string,
  bestHand: HandResult
): number {
  // Find the earliest round at which the player had all 5 cards of their best hand
  const bestCardKeys = new Set(
    bestHand.cards.map((c) => `${c.rank}-${c.suit}`)
  );

  const collectedCards = new Set<string>();
  for (const result of state.auctionResults) {
    if (result.winnerId === playerId) {
      const group = state.groups.find((g) => g.index === result.groupIndex)!;
      for (const card of group.cards) {
        collectedCards.add(`${card.rank}-${card.suit}`);
      }

      // Check if all best hand cards are collected
      let allFound = true;
      for (const key of bestCardKeys) {
        if (!collectedCards.has(key)) {
          allFound = false;
          break;
        }
      }
      if (allFound) return result.groupIndex;
    }
  }

  return state.groups.length; // shouldn't happen
}

export function getPlayerView(
  state: GameState,
  playerId: string
): PlayerView {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new Error('Player not found');

  const isShowdownOrFinished =
    state.status === 'showdown' || state.status === 'finished';

  const players: PlayerPublicInfo[] = state.players.map((p) => ({
    id: p.id,
    name: p.name,
    chips: p.chips,
    cardCount: p.wonCards.length,
    connected: p.connected,
    bidSubmitted: p.currentBid !== null,
    isHost: p.isHost,
  }));

  const groups: CardGroupView[] = state.groups.map((g) => ({
    index: g.index,
    cards: g.cards.map((c): CardView => {
      // If card is face-down and not won by this player and not showdown
      if (c.faceDown && g.winnerId !== playerId && !isShowdownOrFinished) {
        return { suit: null, rank: null, faceDown: true, hidden: true };
      }
      // If card is face-down, won by another player, and not showdown
      if (c.faceDown && g.winnerId !== null && g.winnerId !== playerId && !isShowdownOrFinished) {
        return { suit: null, rank: null, faceDown: true, hidden: true };
      }
      return { suit: c.suit, rank: c.rank, faceDown: c.faceDown, hidden: false };
    }),
    auctioned: g.auctioned,
    winnerId: g.winnerId,
  }));

  const myHand = bestFiveCardHand(player.wonCards);

  let winner: PlayerView['winner'] = null;
  if (isShowdownOrFinished) {
    const { results } = resolveShowdown(state);
    if (results.length > 0) {
      const winnerResult = results[0];
      winner = {
        playerId: winnerResult.playerId,
        playerName: winnerResult.playerName,
        hand: winnerResult.hand,
      };
    }
  }

  return {
    id: state.id,
    status: state.status,
    players,
    groups,
    currentGroupIndex: state.currentGroupIndex,
    auctionResults: state.auctionResults,
    myCards: player.wonCards,
    myChips: player.chips,
    myBidSubmitted: player.currentBid !== null,
    myHand,
    winner,
  };
}
