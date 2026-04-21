'use client';

import { useState, useEffect, useCallback } from 'react';

interface Piece {
  type: string;
  color: string;
}

interface GameState {
  id: string;
  board: (string | null)[][];
  turn: 'w' | 'b';
  players: { id: string; name: string; color: 'w' | 'b' | null }[];
  status: string;
  winner: 'w' | 'b' | null;
  moveHistory: string[];
  lastMove: { from: string; to: string } | null;
  inCheck: boolean;
  chat: { id: string; sender: string; text: string; timestamp: number }[];
  fen: string;
}

interface ChessBoardProps {
  socket: any;
  gameState: GameState | null;
  myColor: 'w' | 'b' | null;
}

const PIECE_SYMBOLS: Record<string, string> = {
  'wk': '♔', 'wq': '♕', 'wr': '♖', 'wb': '♗', 'wn': '♘', 'wp': '♙',
  'bk': '♚', 'bq': '♛', 'br': '♜', 'bb': '♝', 'bn': '♞', 'bp': '♟',
};

const FILES = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
const RANKS = ['8', '7', '6', '5', '4', '3', '2', '1'];

export default function ChessBoard({ socket, gameState, myColor }: ChessBoardProps) {
  const [selectedSquare, setSelectedSquare] = useState<string | null>(null);
  const [highlightedSquares, setHighlightedSquares] = useState<Set<string>>(new Set());
  const [game, setGame] = useState<GameState | null>(null);

  useEffect(() => {
    setGame(gameState);
  }, [gameState]);

  useEffect(() => {
    if (!socket || !game) return;

    const handleState = (state: GameState) => {
      setGame(state);
      setSelectedSquare(null);
      setHighlightedSquares(new Set());
    };

    socket.on('game:state', handleState);
    return () => {
      socket.off('game:state', handleState);
    };
  }, [socket, game]);

  const isLegalMove = useCallback((from: string, to: string): boolean => {
    if (!game || game.status !== 'playing') return false;
    if (myColor !== game.turn) return false;

    try {
      const tempFen = game.fen;
      const chess = new (window as any).Chess(tempFen);
      const moves = chess.moves({ square: from, verbose: true });
      return moves.some((m: any) => m.to === to);
    } catch {
      return false;
    }
  }, [game, myColor]);

  const handleSquareClick = useCallback((row: number, col: number) => {
    if (!game || game.status !== 'playing') return;
    if (myColor !== game.turn) return;

    const square = FILES[col] + RANKS[row];
    const piece = game.board[row][col];

    if (selectedSquare) {
      if (highlightedSquares.has(square)) {
        const moveData: any = { from: selectedSquare, to: square };
        
        if (piece && piece[0] === (myColor === 'w' ? 'w' : 'b')) {
          setSelectedSquare(square);
          setHighlightedSquares(new Set());
          return;
        }
        
        const pieceType = piece ? piece.charAt(1) : '';
        if (pieceType === 'p' && (row === 0 || row === 7) && selectedSquare[1] === '7' || selectedSquare[1] === '2') {
          moveData.promotion = 'q';
        }
        
        socket.emit('game:move', moveData);
        setSelectedSquare(null);
        setHighlightedSquares(new Set());
      } else {
        setSelectedSquare(square);
        setHighlightedSquares(new Set());
      }
    } else if (piece) {
      const pieceColor = piece[0];
      if ((myColor === 'w' && pieceColor === 'w') || (myColor === 'b' && pieceColor === 'b')) {
        setSelectedSquare(square);
        setHighlightedSquares(new Set());
      }
    }
  }, [game, myColor, selectedSquare, highlightedSquares, socket]);

  useEffect(() => {
    if (!selectedSquare || !game || !socket) return;

    const fromCol = FILES.indexOf(selectedSquare[0]);
    const fromRow = RANKS.indexOf(selectedSquare[1]);
    
    try {
      const chess = new (window as any).Chess(game.fen);
      const moves = chess.moves({ square: selectedSquare, verbose: true });
      const newHighlighted = new Set<string>();
      moves.forEach((m: any) => {
        newHighlighted.add(m.to);
      });
      setHighlightedSquares(newHighlighted);
    } catch {
      setHighlightedSquares(new Set());
    }
  }, [selectedSquare, game, socket]);

  const handleResign = () => {
    if (socket && confirm('Are you sure you want to resign?')) {
      socket.emit('game:resign');
    }
  };

  if (!game) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  const opponent = game.players.find((p: any) => p.color !== myColor);
  const myPlayer = game.players.find((p: any) => p.color === myColor);

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      <div className="flex-1">
        <div className="mb-4">
          <div className="bg-gray-800 text-white p-3 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-gray-400 text-sm">Opponent</span>
              <div className="font-semibold">{opponent?.name || 'Waiting...'}</div>
            </div>
            {game.status === 'playing' && (
              <div className={`px-3 py-1 rounded ${game.turn !== myColor ? 'bg-green-600' : 'bg-gray-600'}`}>
                {game.turn !== myColor ? 'Their turn' : 'Waiting'}
              </div>
            )}
          </div>
        </div>

        <div className="inline-block border-4 border-gray-800 rounded-lg overflow-hidden shadow-2xl">
          <div className="flex">
            <div className="w-6 bg-gray-900 text-gray-400 text-xs flex flex-col">
              {RANKS.map((rank, i) => (
                <div key={i} className="h-12 flex items-center justify-center">{rank}</div>
              ))}
            </div>
            <div>
              {game.board.map((row: (string | null)[], rowIndex: number) => (
                <div key={rowIndex} className="flex">
                  {row.map((piece: string | null, colIndex: number) => {
                    const isWhite = (rowIndex + colIndex) % 2 === 0;
                    const square = FILES[colIndex] + RANKS[rowIndex];
                    const isSelected = selectedSquare === square;
                    const isHighlighted = highlightedSquares.has(square);
                    const isLastMove = game.lastMove && (game.lastMove.from === square || game.lastMove.to === square);
                    const isCheck = game.inCheck && piece && piece[1] === 'k' && piece[0] === game.turn;

                    return (
                      <div
                        key={colIndex}
                        onClick={() => handleSquareClick(rowIndex, colIndex)}
                        className={`
                          w-12 h-12 flex items-center justify-center cursor-pointer
                          transition-colors duration-150 text-3xl font-bold select-none
                          ${isWhite ? 'bg-amber-50' : 'bg-amber-800'}
                          ${isSelected ? 'ring-2 ring-inset ring-yellow-400 ring-4' : ''}
                          ${isHighlighted ? 'ring-2 ring-inset ring-green-500 ring-4' : ''}
                          ${isLastMove ? (isWhite ? 'bg-amber-200' : 'bg-amber-700') : ''}
                          ${isCheck ? 'animate-pulse bg-red-500' : ''}
                          hover:${isWhite ? 'bg-amber-100' : 'bg-amber-700'}
                        `}
                      >
                        {piece && PIECE_SYMBOLS[piece] && (
                          <span className={piece[0] === 'w' ? 'text-white drop-shadow-lg' : 'text-gray-900 drop-shadow-lg'}>
                            {PIECE_SYMBOLS[piece]}
                          </span>
                        )}
                        {isHighlighted && !piece && (
                          <div className="w-3 h-3 bg-green-500 rounded-full opacity-50" />
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
              <div className="flex bg-gray-900 text-gray-400 text-xs">
                <div className="w-6" />
                {FILES.map((file, i) => (
                  <div key={i} className="w-12 h-6 flex items-center justify-center">{file}</div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4">
          <div className="bg-gray-800 text-white p-3 rounded-lg flex justify-between items-center">
            <div>
              <span className="text-gray-400 text-sm">You</span>
              <div className="font-semibold">{myPlayer?.name || 'Player'}</div>
            </div>
            {game.status === 'playing' && (
              <button
                onClick={handleResign}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded transition-colors"
              >
                Resign
              </button>
            )}
          </div>
        </div>

        {game.status !== 'playing' && game.status !== 'waiting' && (
          <div className="mt-4 p-4 bg-gray-800 rounded-lg text-center">
            <div className="text-2xl font-bold mb-2">
              {game.status === 'checkmate' && `Checkmate! ${game.winner === myColor ? 'You win!' : 'You lose!'}`}
              {game.status === 'stalemate' && 'Stalemate! Draw game.'}
              {game.status === 'resignation' && `${game.winner === myColor ? 'You win!' : 'You lose!'} (Resignation)`}
            </div>
            <div className="text-gray-400">The game has ended.</div>
          </div>
        )}

        {game.status === 'waiting' && (
          <div className="mt-4 p-4 bg-blue-900 rounded-lg text-center">
            <div className="text-lg font-semibold">Waiting for opponent...</div>
            <div className="text-gray-400 mt-1">Share the game ID with your opponent</div>
          </div>
        )}
      </div>
    </div>
  );
}