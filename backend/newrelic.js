'use strict'

/**
 * New Relic agent configuration.
 *
 * See lib/config/default.js in the agent distribution for a more complete
 * description of configuration variables and their potential values.
 */
exports.config = {
  /**
   * アプリケーション名
   */
  app_name: [process.env.NEW_RELIC_APP_NAME_BACKEND || 'Challenge Cup Backend'],
  
  /**
   * ライセンスキー
   */
  license_key: process.env.NEW_RELIC_LICENSE_KEY,
  
  /**
   * ログレベル
   */
  logging: {
    level: 'info'
  },
  
  /**
   * 分散トレーシングの有効化
   */
  distributed_tracing: {
    enabled: true
  },
  
  /**
   * トランザクショントレーサーの設定
   */
  transaction_tracer: {
    enabled: true,
    record_sql: 'obfuscated',
    explain_threshold: 500,
    top_n: 20
  },
  
  /**
   * エラートレーサーの設定
   */
  error_collector: {
    enabled: true,
    ignore_status_codes: [404, 401]
  },
  
  /**
   * トランザクションイベントの設定
   */
  transaction_events: {
    enabled: true
  },
  
  /**
   * カスタムインサイトイベントの設定
   */
  custom_insights_events: {
    enabled: true
  },
  
  /**
   * スロークエリの設定
   */
  slow_sql: {
    enabled: true
  },
  
  /**
   * データベースモニタリングの設定
   */
  datastore_tracer: {
    record_sql: 'obfuscated',
    explain_threshold: 500,
    explain_enabled: true
  }
}
