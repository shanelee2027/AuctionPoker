export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  suit: Suit;
  rank: Rank;
  faceDown: boolean;
}

export interface CardGroup {
  index: number; // 1-based
  cards: Card[];
  auctioned: boolean;
  winnerId: string | null;
}

export interface Player {
  id: string;
  name: string;
  chips: number;
  wonCards: Card[];
  currentBid: number | null;
  connected: boolean;
  isHost: boolean;
}

export interface AuctionResult {
  groupIndex: number;
  bids: { playerId: string; amount: number }[];
  winnerId: string;
  pricePaid: number;
}

export type GameStatus = 'lobby' | 'auction' | 'showdown' | 'finished';

export interface ChatMessage {
  id: string;
  playerId: string;
  playerName: string;
  text: string;
  timestamp: number;
}

export interface GameState {
  id: string;
  status: GameStatus;
  players: Player[];
  deck: Card[];
  groups: CardGroup[];
  currentGroupIndex: number;
  auctionResults: AuctionResult[];
  messages: ChatMessage[];
  version: number;
  createdAt: number;
}

// Hand evaluation types
export enum HandRank {
  ROYAL_FLUSH = 1,
  STRAIGHT_FLUSH = 2,
  FLUSH = 3,
  FOUR_OF_A_KIND = 4,
  FULL_HOUSE = 5,
  THREE_OF_A_KIND = 6,
  STRAIGHT = 7,
  TWO_PAIR = 8,
  ONE_PAIR = 9,
  HIGH_CARD = 10,
}

export interface HandResult {
  rank: HandRank;
  cards: Card[];
  values: number[]; // numeric values for comparison (kickers)
  description: string;
}

// What a specific player sees (filtered view)
export interface PlayerView {
  id: string;
  status: GameStatus;
  players: PlayerPublicInfo[];
  groups: CardGroupView[];
  currentGroupIndex: number;
  auctionResults: AuctionResult[];
  myCards: Card[];
  myChips: number;
  myBidSubmitted: boolean;
  myHand: HandResult | null;
  winner: { playerId: string; playerName: string; hand: HandResult } | null;
  messages: ChatMessage[];
}

export interface PlayerPublicInfo {
  id: string;
  name: string;
  chips: number;
  cardCount: number;
  connected: boolean;
  bidSubmitted: boolean;
  isHost: boolean;
}

export interface CardGroupView {
  index: number;
  cards: CardView[];
  auctioned: boolean;
  winnerId: string | null;
}

export interface CardView {
  suit: Suit | null;
  rank: Rank | null;
  faceDown: boolean;
  hidden: boolean; // true if this card's value is unknown to the viewer
}

// Showdown results
export interface ShowdownResult {
  playerId: string;
  playerName: string;
  hand: HandResult;
  allCards: Card[];
  completedAtRound: number;
}
