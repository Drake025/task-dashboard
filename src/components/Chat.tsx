'use client';

import { useState, useEffect, useRef } from 'react';

interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: number;
}

interface ChatProps {
  socket: any;
  messages: ChatMessage[];
  playerName: string;
}

export default function Chat({ socket, messages, playerName }: ChatProps) {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setChatMessages(messages);
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    const handleMessage = (msg: ChatMessage) => {
      setChatMessages((prev) => [...prev, msg]);
    };

    socket.on('chat:message', handleMessage);
    return () => {
      socket.off('chat:message', handleMessage);
    };
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!message.trim() || !socket) return;
    socket.emit('chat:send', { text: message.trim() });
    setMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="bg-gray-800 rounded-lg flex flex-col h-96">
      <div className="p-3 border-b border-gray-700">
        <h3 className="font-semibold text-white">Chat</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {chatMessages.length === 0 ? (
          <div className="text-gray-500 text-center text-sm mt-8">No messages yet</div>
        ) : (
          chatMessages.map((msg) => (
            <div
              key={msg.id}
              className={`text-sm ${
                msg.sender === playerName ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`inline-block px-3 py-2 rounded-lg max-w-xs break-words ${
                  msg.sender === playerName
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-white'
                }`}
              >
                <div className="font-semibold text-xs opacity-75">{msg.sender}</div>
                <div>{msg.text}</div>
                <div className="text-xs opacity-50 mt-1">{formatTime(msg.timestamp)}</div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-3 border-t border-gray-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a message..."
            className="flex-1 px-3 py-2 bg-gray-700 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            maxLength={500}
          />
          <button
            onClick={handleSend}
            disabled={!message.trim()}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed rounded-lg text-white transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}