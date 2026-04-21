export type PieceType = 'p' | 'n' | 'b' | 'r' | 'q' | 'k';
export type PieceColor = 'w' | 'b';
export type Square = string;

export interface Piece {
  type: PieceType;
  color: PieceColor;
}

export interface Move {
  from: Square;
  to: Square;
  promotion?: PieceType;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  color: 'w' | 'b' | null;
}

export interface GameState {
  id: string;
  board: (Piece | null)[][];
  turn: PieceColor;
  players: Player[];
  status: 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'resignation' | 'draw';
  winner: PieceColor | null;
  moveHistory: Move[];
  lastMove: Move | null;
  inCheck: boolean;
  chat: ChatMessage[];
  fen: string;
}

export interface GameRoom {
  gameId: string;
  players: Map<string, Player>;
  spectators: Set<string>;
  state: GameState;
  startTime: number;
}

export type ServerToClientEvents = {
  'game:state': (state: GameState) => void;
  'game:joined': (data: { gameId: string; player: Player; color: PieceColor }) => void;
  'game:waiting': (data: { gameId: string }) => void;
  'game:start': (data: { gameId: string; players: Player[] }) => void;
  'game:end': (data: { reason: string; winner: PieceColor | null }) => void;
  'chat:message': (message: ChatMessage) => void;
  'error': (data: { message: string }) => void;
};

export type ClientToServerEvents = {
  'game:join': (data: { playerName: string }) => void;
  'game:create': (data: { playerName: string }) => void;
  'game:move': (data: { from: Square; to: Square; promotion?: PieceType }) => void;
  'game:resign': () => void;
  'chat:send': (data: { text: string }) => void;
};