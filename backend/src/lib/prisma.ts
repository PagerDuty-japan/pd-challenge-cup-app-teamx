import { PrismaClient } from '@prisma/client';
import newrelic from 'newrelic';

// グローバル型の拡張
declare global {
  // eslint-disable-next-line no-var
  var prisma: PrismaClient | undefined;
}

// Prismaクライアントのシングルトンインスタンス
let prisma: PrismaClient;

// NewRelicでトラッキングするPrismaクライアントを作成する関数
function createPrismaClient(): PrismaClient {
  const client = new PrismaClient({
    log: [
      {
        emit: 'event',
        level: 'query',
      },
      {
        emit: 'event',
        level: 'error',
      },
      {
        emit: 'event',
        level: 'info',
      },
      {
        emit: 'event',
        level: 'warn',
      },
    ],
  });

  // クエリイベントをNewRelicに記録
  client.$on('query', (e) => {
    newrelic.recordCustomEvent('PrismaQuery', {
      query: e.query,
      params: e.params,
      duration: e.duration,
      timestamp: new Date().toISOString(),
    });
  });

  // エラーイベントをNewRelicに記録
  client.$on('error', (e) => {
    newrelic.noticeError(new Error(`Prisma Error: ${e.message}`), {
      target: e.target,
      message: e.message,
      timestamp: new Date().toISOString(),
    });
  });

  // 情報イベントをNewRelicに記録
  client.$on('info', (e) => {
    newrelic.recordCustomEvent('PrismaInfo', {
      message: e.message,
      timestamp: new Date().toISOString(),
    });
  });

  // 警告イベントをNewRelicに記録
  client.$on('warn', (e) => {
    newrelic.recordCustomEvent('PrismaWarn', {
      message: e.message,
      timestamp: new Date().toISOString(),
    });
  });

  return client;
}

// グローバルスコープでPrismaクライアントを初期化
if (process.env.NODE_ENV === 'production') {
  prisma = createPrismaClient();
} else {
  // 開発環境では、ホットリロード時に複数のPrismaClientインスタンスが作成されるのを防ぐ
  if (!global.prisma) {
    global.prisma = createPrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
