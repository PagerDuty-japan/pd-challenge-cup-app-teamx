"use client";

import { Geist, Geist_Mono } from "next/font/google";
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

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  useEffect(() => {
    // グローバルエラーハンドラーを設定
    const handleError = (event: ErrorEvent) => {
      console.error('Global error caught:', event.error);
      
      // NewRelicにエラーを報告（開発環境ではスキップ）
      if (process.env.NODE_ENV === 'production' && typeof window !== 'undefined' && window.newrelic) {
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
    <html lang="ja" className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <body>
        {children}
        {process.env.NODE_ENV === 'production' && (
          <>
            <Script
              src="https://js-agent.newrelic.com/nr-spa-1337.min.js"
              strategy="beforeInteractive"
            />
            <Script id="nr-browser-agent" strategy="afterInteractive">
              {`
                window.NREUM = window.NREUM || {};
                NREUM.init = {
                  distributed_tracing: { enabled: true },
                  ajax: { deny_list: ['bam.nr-data.net'] },
                  privacy: { cookies_enabled: true }
                };
                NREUM.loader_config = {
                  accountID: "${process.env.NEXT_PUBLIC_NEW_RELIC_ACCOUNT_ID || ''}",
                  trustKey: "${process.env.NEXT_PUBLIC_NEW_RELIC_TRUST_KEY || ''}",
                  agentID: "${process.env.NEXT_PUBLIC_NEW_RELIC_AGENT_ID || ''}",
                  licenseKey: "${process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY || ''}",
                  applicationID: "${process.env.NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID || ''}"
                };
                NREUM.info = {
                  beacon: "bam.nr-data.net",
                  errorBeacon: "bam.nr-data.net",
                  licenseKey: "${process.env.NEXT_PUBLIC_NEW_RELIC_LICENSE_KEY || ''}",
                  applicationID: "${process.env.NEXT_PUBLIC_NEW_RELIC_APPLICATION_ID || ''}",
                  sa: 1
                };
              `}
            </Script>
          </>
        )}
      </body>
    </html>
  );
} 