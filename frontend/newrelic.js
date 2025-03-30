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
  app_name: [process.env.NEW_RELIC_APP_NAME_FRONTEND || 'Challenge Cup Frontend'],
  
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
    ignore_status_codes: [404, 401],
    capture_attributes: true,
    capture_events: true,
    max_event_samples_stored: 100,
    expected_status_codes: [],
    ignore_classes: [],
    ignore_messages: []
  },
  
  /**
   * ブラウザモニタリングの設定
   */
  browser_monitoring: {
    auto_instrument: true,
    browser_key: process.env.NEW_RELIC_BROWSER_KEY,
    debug: true,
    capture_attributes: true,
    capture_source: true,
    capture_ajax: true,
    capture_page_view: true,
    capture_error: true,
    capture_spa: true
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
  }
}
