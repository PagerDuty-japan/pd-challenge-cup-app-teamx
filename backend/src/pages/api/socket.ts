import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import newrelic from 'newrelic';
import prisma from '../../lib/prisma';

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // NewRelicでトランザクションを開始
  return newrelic.startWebTransaction('/api/socket', async () => {
    // CORSヘッダーを設定
    const origin = req.headers.origin || '';
    const allowedOrigins = ['http://localhost:3001', 'https://teamx-app.pdcc.paas.jp'];
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    res.setHeader('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (res.socket.server.io) {
      console.log('Socket.IO server already running');
      res.status(200).json({ message: 'Socket.IO server already running' });
      return;
    }

    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' });
      return;
    }

    try {
      const io = new SocketIOServer(res.socket.server, {
        path: '/api/socket',
        cors: {
          origin: ['http://localhost:3001', 'https://teamx-app.pdcc.paas.jp'],
          methods: ['GET', 'POST', 'OPTIONS'],
          credentials: true,
          allowedHeaders: ['Content-Type', 'Access-Control-Allow-Origin'],
        },
        transports: ['polling', 'websocket'],
        pingTimeout: 60000,
        pingInterval: 25000,
        allowEIO3: true,
        connectTimeout: 45000,
        serveClient: false,
        upgradeTimeout: 30000,
        allowUpgrades: true
      });

      res.socket.server.io = io;

      io.on('connection', async (socket) => {
        console.log('Client connected');
        newrelic.recordCustomEvent('SocketConnection', {
          socketId: socket.id,
          timestamp: new Date().toISOString(),
        });

        // 過去のメッセージを取得して送信（最新100件）
        try {
          const messages = await newrelic.startBackgroundTransaction(
            'getMessages',
            'db',
            async () => {
              return await prisma.message.findMany({
                take: 100,
                orderBy: {
                  createdAt: 'desc',
                },
              });
            }
          );
          socket.emit('load-messages', messages.reverse());
          newrelic.recordCustomEvent('MessagesLoaded', {
            socketId: socket.id,
            count: messages.length,
            timestamp: new Date().toISOString(),
          });
        } catch (error) {
          console.error('Error loading messages:', error);
          newrelic.noticeError(error as Error, {
            operation: 'loadMessages',
            socketId: socket.id,
          });
        }

        // 新規メッセージの受信と保存
        socket.on('send-message', async (data: { content: string; userName: string }) => {
          try {
            const message = await newrelic.startBackgroundTransaction(
              'createMessage',
              'db',
              async () => {
                return await prisma.message.create({
                  data: {
                    content: data.content,
                    userName: data.userName,
                  },
                });
              }
            );
            io.emit('new-message', message);
            newrelic.recordCustomEvent('MessageCreated', {
              messageId: message.id,
              userName: message.userName,
              timestamp: new Date().toISOString(),
            });
          } catch (error) {
            console.error('Error creating message:', error);
            newrelic.noticeError(error as Error, {
              operation: 'createMessage',
              socketId: socket.id,
              userName: data.userName,
            });
          }
        });

        socket.on('disconnect', () => {
          console.log('Client disconnected');
          newrelic.recordCustomEvent('SocketDisconnection', {
            socketId: socket.id,
            timestamp: new Date().toISOString(),
          });
        });
      });

      console.log('Socket.IO server started');
      res.status(200).json({ message: 'Socket.IO server started' });
    } catch (error) {
      console.error('Socket initialization error:', error);
      newrelic.noticeError(error as Error, {
        operation: 'socketInitialization',
      });
      res.status(500).json({ error: 'Failed to initialize socket server' });
    }
  });
};

export default SocketHandler;
