declare module 'newrelic/load-externals' {
  const nrExternals: (config: any) => void;
  export default nrExternals;
}

// NewRelicのブラウザエージェント型定義
interface NewRelicBrowser {
  noticeError: (error: Error | any, customAttributes?: Record<string, any>) => void;
  setErrorHandler: (callback: (error: Error | any) => boolean) => void;
  setCustomAttribute: (name: string, value: string | number | boolean) => void;
  setPageViewName: (name: string, host?: string) => void;
  addPageAction: (name: string, attributes?: Record<string, any>) => void;
  setCurrentRouteName: (name: string) => void;
  interaction: () => {
    end(): void;
    save(): void;
    ignore(): void;
    createTracer(name: string, callback: () => void): () => void;
  };
  addRelease: (releaseName: string, releaseId?: string) => void;
}

// グローバルwindowオブジェクトにNewRelicを追加
interface Window {
  newrelic: NewRelicBrowser;
}
