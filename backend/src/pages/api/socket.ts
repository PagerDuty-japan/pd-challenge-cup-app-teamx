import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export type NextApiResponseWithSocket = NextApiResponse & {
  socket: {
    server: NetServer & {
      io?: SocketIOServer;
    };
  };
};

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseWithSocket) => {
  // CORSヘッダーを設定
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3001');
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
        origin: 'http://localhost:3001',
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

      // 過去のメッセージを取得して送信（最新100件）
      const messages = await prisma.message.findMany({
        take: 100,
        orderBy: {
          createdAt: 'desc',
        },
      });
      socket.emit('load-messages', messages.reverse());

      // 新規メッセージの受信と保存
      socket.on('send-message', async (data: { content: string; userName: string }) => {
        const message = await prisma.message.create({
          data: {
            content: data.content,
            userName: data.userName,
          },
        });
        io.emit('new-message', message);
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected');
      });
    });

    console.log('Socket.IO server started');
    res.status(200).json({ message: 'Socket.IO server started' });
  } catch (error) {
    console.error('Socket initialization error:', error);
    res.status(500).json({ error: 'Failed to initialize socket server' });
  }
};

export default SocketHandler;
