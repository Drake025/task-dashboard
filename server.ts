import { createServer } from 'http';
import { Server as SocketServer } from 'socket.io';
import { Chess } from 'chess.js';

const httpServer = createServer();
const io = new SocketServer(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

interface Player {
  id: string;
  name: string;
  color: 'w' | 'b' | null;
}

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface GameState {
  id: string;
  board: (string | null)[][];
  turn: 'w' | 'b';
  players: Player[];
  status: 'waiting' | 'playing' | 'checkmate' | 'stalemate' | 'resignation' | 'draw';
  winner: 'w' | 'b' | null;
  moveHistory: string[];
  lastMove: { from: string; to: string } | null;
  inCheck: boolean;
  chat: ChatMessage[];
  fen: string;
}

const games = new Map<string, GameState>();
const waitingPlayers: Map<string, string> = new Map();

function createInitialBoard(): (string | null)[][] {
  const board: (string | null)[][] = [];
  const backRank = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  
  for (let r = 0; r < 8; r++) {
    board[r] = [];
    for (let c = 0; c < 8; c++) {
      if (r === 0 || r === 7) {
        const color = r === 0 ? 'b' : 'w';
        board[r][c] = color + backRank[c];
      } else if (r === 1 || r === 6) {
        const color = r === 1 ? 'b' : 'w';
        board[r][c] = color + 'p';
      } else {
        board[r][c] = null;
      }
    }
  }
  return board;
}

function boardToArray(fen: string): (string | null)[][] {
  const board: (string | null)[][] = [];
  const rows = fen.split('/');
  let rankIndex = 7;
  
  for (let r = 7; r >= 0; r--) {
    board[r] = [];
    let fileIndex = 0;
    for (const char of rows[r]) {
      if (/\d/.test(char)) {
        const empty = parseInt(char);
        for (let i = 0; i < empty; i++) {
          board[r][fileIndex++] = null;
        }
      } else {
        const isBlack = char === char.toLowerCase();
        board[r][fileIndex++] = (isBlack ? 'b' : 'w') + char.toLowerCase();
      }
    }
    rankIndex--;
  }
  return board;
}

function createGameState(gameId: string): GameState {
  return {
    id: gameId,
    board: createInitialBoard(),
    turn: 'w',
    players: [],
    status: 'waiting',
    winner: null,
    moveHistory: [],
    lastMove: null,
    inCheck: false,
    chat: [],
    fen: 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1',
  };
}

function generateGameId(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}

function getBoardFEN(state: GameState): string {
  let fen = '';
  for (let r = 7; r >= 0; r--) {
    let empty = 0;
    for (let c = 0; c < 8; c++) {
      const piece = state.board[r][c];
      if (piece === null) {
        empty++;
      } else {
        if (empty > 0) {
          fen += empty;
          empty = 0;
        }
        const [color, type] = piece;
        fen += color === 'w' ? type.toUpperCase() : type;
      }
    }
    if (empty > 0) fen += empty;
    if (r > 0) fen += '/';
  }
  fen += state.turn === 'w' ? ' w' : ' b';
  fen += ' KQkq - 0 1';
  return fen;
}

io.on('connection', (socket) => {
  console.log('Player connected:', socket.id);

  socket.on('game:create', ({ playerName }) => {
    const gameId = generateGameId();
    const gameState = createGameState(gameId);
    
    const player: Player = {
      id: socket.id,
      name: playerName,
      color: 'w',
    };
    
    gameState.players.push(player);
    games.set(gameId, gameState);
    
    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.player = player;
    
    socket.emit('game:waiting', { gameId });
    socket.emit('game:state', gameState);
    console.log(`Game ${gameId} created by ${playerName}`);
  });

  socket.on('game:join', ({ playerName }) => {
    for (const [gameId, game] of games) {
      if (game.status === 'waiting') {
        const player: Player = {
          id: socket.id,
          name: playerName,
          color: 'b',
        };
        
        game.players.push(player);
        game.status = 'playing';
        
        socket.join(gameId);
        socket.data.gameId = gameId;
        socket.data.player = player;
        
        io.to(gameId).emit('game:start', {
          gameId,
          players: game.players,
        });
        
        io.to(gameId).emit('game:state', game);
        console.log(`${playerName} joined game ${gameId}`);
        return;
      }
    }
    
    socket.emit('error', { message: 'No games available. Creating new game...' });
    
    const gameId = generateGameId();
    const gameState = createGameState(gameId);
    
    const player: Player = {
      id: socket.id,
      name: playerName,
      color: 'w',
    };
    
    gameState.players.push(player);
    games.set(gameId, gameState);
    
    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.player = player;
    
    socket.emit('game:waiting', { gameId });
    socket.emit('game:state', gameState);
  });

  socket.on('game:move', ({ from, to, promotion }) => {
    const gameId = socket.data.gameId;
    const game = games.get(gameId);
    const player = socket.data.player;
    
    if (!game || !player || game.status !== 'playing') {
      socket.emit('error', { message: 'Cannot make move' });
      return;
    }
    
    if (player.color !== game.turn) {
      socket.emit('error', { message: 'Not your turn' });
      return;
    }
    
    try {
      const chess = new Chess(game.fen);
      const move = chess.move({ from, to, promotion });
      
      if (!move) {
        socket.emit('error', { message: 'Illegal move' });
        return;
      }
      
      game.board = boardToArray(chess.fen());
      game.fen = chess.fen();
      game.turn = chess.turn();
      game.lastMove = { from, to };
      game.inCheck = chess.inCheck();
      game.moveHistory.push(`${from}-${to}`);
      
      if (chess.isCheckmate()) {
        game.status = 'checkmate';
        game.winner = move.color === 'w' ? 'w' : 'b';
        io.to(gameId).emit('game:end', {
          reason: 'checkmate',
          winner: game.winner,
        });
      } else if (chess.isStalemate()) {
        game.status = 'stalemate';
        io.to(gameId).emit('game:end', {
          reason: 'stalemate',
          winner: null,
        });
      } else if (chess.isThreefoldRepetition()) {
        game.status = 'draw';
        io.to(gameId).emit('game:end', {
          reason: 'threefold repetition',
          winner: null,
        });
      }
      
      io.to(gameId).emit('game:state', game);
    } catch (e) {
      socket.emit('error', { message: 'Invalid move' });
    }
  });

  socket.on('game:resign', () => {
    const gameId = socket.data.gameId;
    const game = games.get(gameId);
    const player = socket.data.player;
    
    if (!game || !player || game.status !== 'playing') {
      return;
    }
    
    game.status = 'resignation';
    game.winner = player.color === 'w' ? 'b' : 'w';
    
    io.to(gameId).emit('game:end', {
      reason: 'resignation',
      winner: game.winner,
    });
    
    io.to(gameId).emit('game:state', game);
  });

  socket.on('chat:send', ({ text }) => {
    const gameId = socket.data.gameId;
    const player = socket.data.player;
    const game = games.get(gameId);
    
    if (!game || !player || !text.trim()) {
      return;
    }
    
    const message: ChatMessage = {
      id: Math.random().toString(36).substring(2, 10),
      sender: player.name,
      text: text.trim().substring(0, 500),
      timestamp: Date.now(),
    };
    
    game.chat.push(message);
    io.to(gameId).emit('chat:message', message);
  });

  socket.on('disconnect', () => {
    const gameId = socket.data.gameId;
    const player = socket.data.player;
    
    if (gameId && player) {
      const game = games.get(gameId);
      if (game) {
        if (game.status === 'playing') {
          game.status = 'resignation';
          game.winner = player.color === 'w' ? 'b' : 'w';
          io.to(gameId).emit('game:end', {
            reason: 'opponent disconnected',
            winner: game.winner,
          });
        }
        game.players = game.players.filter((p: Player) => p.id !== socket.id);
        
        if (game.players.length === 0) {
          games.delete(gameId);
        }
      }
    }
    
    console.log('Player disconnected:', socket.id);
  });
});

const PORT = process.env.SOCKET_PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`Socket.IO server running on port ${PORT}`);
});