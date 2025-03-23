"use client";

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Message } from '../types/message';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

let socket: Socket;

export default function ChatComponent() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [userName, setUserName] = useState('');
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // WebSocketサーバーに接続（相対パスを使用）
    const initSocket = async () => {
      try {
        // WebSocketサーバーを初期化
        const response = await fetch('/api/socket', {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to initialize WebSocket server');
        }

        // Socket.IOクライアントを設定（相対パスを使用）
        socket = io({
          path: '/api/socket',
          withCredentials: true,
          transports: ['polling', 'websocket'],
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          autoConnect: true,
          timeout: 60000,
          forceNew: true,
          upgrade: true,
          rememberUpgrade: true,
          secure: window.location.protocol === 'https:',
          // 接続エラー時のリトライ設定
          reconnection: true,
          reconnectionDelayMax: 10000
        });

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          setIsConnected(false);
        });

        socket.on('connect', () => {
          setIsConnected(true);
        });

        socket.on('load-messages', (loadedMessages: Message[]) => {
          setMessages(loadedMessages);
        });

        socket.on('new-message', (message: Message) => {
          setMessages((prev) => [...prev, message]);
        });
      } catch (error) {
        console.error('Failed to initialize socket:', error);
      }
    };

    initSocket();

    return () => {
      if (socket) {
        socket.disconnect();
      }
    };
  }, []);

  const handleSendMessage = (content: string) => {
    if (!userName) {
      alert('ユーザー名を入力してください');
      return;
    }
    socket.emit('send-message', { content, userName });
  };

  if (!isConnected) {
    return <div className="text-center p-4">接続中...</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      {!userName ? (
        <div className="mb-4">
          <form onSubmit={(e) => {
            e.preventDefault();
            const inputValue = e.currentTarget.querySelector('input')?.value.trim();
            if (inputValue && inputValue.length >= 2) {
              setUserName(inputValue);
            } else {
              alert('ユーザー名は2文字以上で入力してください');
            }
          }}>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="ユーザー名を入力（2文字以上）"
                className="flex-1 p-2 border rounded"
                defaultValue=""
              />
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                確定
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-4 text-sm text-gray-600">
          ユーザー名: {userName}
        </div>
      )}
      <div className="bg-white rounded-lg shadow">
        <MessageList messages={messages} currentUserName={userName} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
