'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import ChessBoard from '@/components/ChessBoard';
import Chat from '@/components/Chat';

interface Player {
  id: string;
  name: string;
  color: 'w' | 'b' | null;
}

interface GameState {
  id: string;
  board: (string | null)[][];
  turn: 'w' | 'b';
  players: Player[];
  status: string;
  winner: 'w' | 'b' | null;
  moveHistory: string[];
  lastMove: { from: string; to: string } | null;
  inCheck: boolean;
  chat: { id: string; sender: string; text: string; timestamp: number }[];
  fen: string;
}

function ChessGameContent() {
  const [socket, setSocket] = useState<any>(null);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [myColor, setMyColor] = useState<'w' | 'b' | null>(null);
  const [playerName, setPlayerName] = useState('');
  const [gameId, setGameId] = useState<string | null>(null);
  const [connected, setConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const initSocket = async () => {
      try {
        const { io } = await import('socket.io-client');
        const socketUrl = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';
        const socketInstance = io(socketUrl, {
          transports: ['websocket', 'polling'],
        });

        socketInstance.on('connect', () => {
          console.log('Connected to server');
          setConnected(true);
          setIsLoading(false);
        });

        socketInstance.on('connect_error', (err: Error) => {
          console.error('Connection error:', err);
          setError('Failed to connect to server. Please try again.');
          setIsLoading(false);
        });

        socketInstance.on('disconnect', () => {
          console.log('Disconnected from server');
          setConnected(false);
        });

        socketInstance.on('game:waiting', (data: { gameId: string }) => {
          setGameId(data.gameId);
        });

        socketInstance.on('game:start', (data: { gameId: string; players: Player[] }) => {
          setGameId(data.gameId);
        });

        socketInstance.on('game:state', (state: GameState) => {
          setGameState(state);
        });

        socketInstance.on('game:end', (data: { reason: string; winner: 'w' | 'b' | null }) => {
          console.log('Game ended:', data);
        });

        socketInstance.on('error', (data: { message: string }) => {
          setError(data.message);
          setIsLoading(false);
        });

        setSocket(socketInstance);
      } catch (err) {
        console.error('Failed to initialize socket:', err);
        setError('Failed to initialize connection');
      }
    };

    initSocket();

    return () => {
      setSocket((prev: any) => {
        if (prev) prev.disconnect();
        return null;
      });
    };
  }, []);

  const handleCreateGame = () => {
    if (!socket || !playerName.trim()) return;
    setIsLoading(true);
    setError(null);
    socket.emit('game:create', { playerName: playerName.trim() });
  };

  const handleJoinGame = () => {
    if (!socket || !playerName.trim()) return;
    setIsLoading(true);
    setError(null);
    socket.emit('game:join', { playerName: playerName.trim() });
  };

  useEffect(() => {
    if (!socket || !gameState) return;

    const myPlayer = gameState.players.find((p: Player) => p.id === socket.id);
    if (myPlayer) {
      setMyColor(myPlayer.color);
    }
  }, [socket, gameState]);

  if (!connected) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">♔</div>
          <h1 className="text-3xl font-bold text-white mb-4">Online Chess</h1>
          <p className="text-gray-400 mb-8">Connect to play chess with another player</p>
          <div className="animate-pulse text-blue-400">Connecting to server...</div>
        </div>
      </div>
    );
  }

  if (!gameState) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 rounded-lg p-8 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">♔</div>
            <h1 className="text-3xl font-bold text-white mb-2">Online Chess</h1>
            <p className="text-gray-400">Enter your name to play</p>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-900 text-red-200 rounded-lg">{error}</div>
          )}

          <div className="space-y-4">
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="Enter your name..."
              className="w-full px-4 py-3 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              maxLength={20}
            />

            <button
              onClick={handleCreateGame}
              disabled={!playerName.trim() || isLoading}
              className="w-full px-4 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
            >
              {isLoading ? 'Connecting...' : 'Create New Game'}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-2 bg-gray-800 text-gray-400 text-sm">or</span>
              </div>
            </div>

            <button
              onClick={handleJoinGame}
              disabled={!playerName.trim() || isLoading}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white font-semibold transition-colors"
            >
              {isLoading ? 'Finding game...' : 'Join Existing Game'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="mb-4 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white">Online Chess</h1>
            {gameId && <p className="text-gray-400 text-sm">Game ID: {gameId}</p>}
          </div>
          <div className="flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-gray-400 text-sm">{connected ? 'Connected' : 'Disconnected'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <ChessBoard socket={socket} gameState={gameState} myColor={myColor} />
          </div>
          <div>
            <Chat socket={socket} messages={gameState?.chat || []} playerName={playerName} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ChessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-blue-400">Loading...</div>
      </div>
    }>
      <ChessGameContent />
    </Suspense>
  );
}