import { NextApiRequest, NextApiResponse } from 'next';
import newrelic from 'newrelic';
import prisma from '../../lib/prisma';

interface HealthCheckResponse {
  status: string;
  details: {
    application: string;
    database: string;
  };
  timestamp: string;
}

const HealthCheckHandler = async (req: NextApiRequest, res: NextApiResponse<HealthCheckResponse>) => {
  // NewRelicでトランザクションを開始
  return newrelic.startWebTransaction('/api/healthz', async () => {
    // CORSヘッダーを設定
    const origin = req.headers.origin || '';
    const allowedOrigins = ['http://localhost:3001', 'https://teamx-app.pdcc.paas.jp'];
    
    if (allowedOrigins.includes(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin);
    }
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
      res.status(200).end();
      return;
    }

    if (req.method !== 'GET') {
      res.status(405).json({
        status: 'NG',
        details: {
          application: 'OK',
          database: 'NG'
        },
        timestamp: new Date().toISOString()
      });
      return;
    }

    // アプリケーションの状態は常にOK（エンドポイントにアクセスできているため）
    const applicationStatus: string = 'OK';
    
    // データベース接続チェック
    let databaseStatus: string = 'NG';
    
    try {
      // データベース接続テスト（簡単なクエリを実行）
      await newrelic.startBackgroundTransaction('healthCheckDatabase', 'db', async () => {
        // 単純なクエリを実行してデータベース接続を確認
        await prisma.$queryRaw`SELECT 1`;
        databaseStatus = 'OK';
      });
    } catch (error) {
      console.error('Database health check failed:', error);
      newrelic.noticeError(error as Error, {
        operation: 'healthCheckDatabase',
      });
      databaseStatus = 'NG';
    }

    // 全体のステータスを決定（アプリケーションとデータベースの両方がOKならOK）
    let overallStatus: string;
    if (applicationStatus === 'OK' && databaseStatus === 'OK') {
      overallStatus = 'OK';
    } else {
      overallStatus = 'NG';
    }
    
    // ヘルスチェック結果をNewRelicに記録
    newrelic.recordCustomEvent('HealthCheck', {
      overallStatus,
      applicationStatus,
      databaseStatus,
      timestamp: new Date().toISOString(),
    });

    // レスポンスのHTTPステータスコードを設定（OKなら200、NGなら503）
    const statusCode = overallStatus === 'OK' ? 200 : 503;
    
    // レスポンスを返す
    res.status(statusCode).json({
      status: overallStatus,
      details: {
        application: applicationStatus,
        database: databaseStatus
      },
      timestamp: new Date().toISOString()
    });
  });
};

export default HealthCheckHandler;
