declare module 'newrelic/load-externals' {
  const nrExternals: (config: unknown) => void;
  export default nrExternals;
}

declare module 'newrelic' {
  interface NewRelic {
    /**
     * トランザクションを開始する
     */
    startWebTransaction<T>(url: string, handle: () => Promise<T>): Promise<T>;
    
    /**
     * バックグラウンドトランザクションを開始する
     */
    startBackgroundTransaction<T>(name: string, group: string, handle: () => Promise<T>): Promise<T>;
    
    /**
     * セグメントを作成する
     */
    createTracer<T>(name: string, callback: () => T): T;
    
    /**
     * エラーを記録する
     */
    noticeError(error: Error, customAttributes?: Record<string, unknown>): void;
    
    /**
     * カスタムイベントを記録する
     */
    recordCustomEvent(eventType: string, attributes: Record<string, unknown>): void;
    
    /**
     * カスタムメトリクスを記録する
     */
    recordMetric(name: string, value: number): void;
    
    /**
     * カスタム属性を追加する
     */
    addCustomAttribute(name: string, value: string | number | boolean): void;
    
    /**
     * 複数のカスタム属性を追加する
     */
    addCustomAttributes(attributes: Record<string, string | number | boolean>): void;
    
    /**
     * インクリメンタルアトリビュートを追加する
     */
    incrementAttribute(name: string, value?: number): void;
    
    /**
     * 現在のトランザクション名を設定する
     */
    setTransactionName(name: string): void;
  }
  
  const newrelic: NewRelic;
  export = newrelic;
}
