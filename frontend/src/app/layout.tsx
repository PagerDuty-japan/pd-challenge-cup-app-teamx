import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import newrelic from "newrelic";
import Script from "next/script";
import { useEffect } from "react";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "ペイジーチャット!!!",
  description: "Pagey Chat",
};




export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const browserTimingHeader = newrelic.getBrowserTimingHeader({
    hasToRemoveScriptWrapper: true,
  });

  useEffect(() => {
    // グローバルエラーハンドラーを設定
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // NewRelicにエラーを報告
      if (typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.noticeError(event.error, {
          errorType: 'uncaught_error',
          errorSource: event.filename,
          errorLine: event.lineno,
          errorColumn: event.colno,
          stack: event.error?.stack
        });
      }
    };

    // 未処理のプロミスエラーハンドラーを設定
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('Unhandled promise rejection:', event.reason);
      
      // NewRelicにエラーを報告
      if (typeof window !== 'undefined' && window.newrelic) {
        window.newrelic.noticeError(event.reason, {
          errorType: 'unhandled_promise_rejection',
          stack: event.reason?.stack
        });
      }
    };

    // イベントリスナーを追加
    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    // クリーンアップ関数
    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Script
            id="nr-browser-agent"
            strategy="beforeInteractive"
            dangerouslySetInnerHTML={{ __html: browserTimingHeader }}
        />
        <Script
            id="nr-error-handler"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                // NewRelicのブラウザエージェントが読み込まれた後に実行
                if (typeof window !== 'undefined' && window.newrelic) {
                  // カスタムエラーハンドラーを設定
                  window.newrelic.setErrorHandler(function(err) {
                    // すべてのエラーを報告（フィルタリングが必要な場合はここで条件を追加）
                    return true;
                  });
                  
                  // カスタムアトリビュートを追加
                  window.newrelic.setCustomAttribute('appVersion', '1.0.0');
                  window.newrelic.setCustomAttribute('environment', process.env.NODE_ENV || 'development');
                }
              `
            }}
        />
      </body>
    </html>
  );
}
