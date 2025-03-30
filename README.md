# PagerDuty Challenge Cup チャットアプリケーション

このリポジトリは、PagerDuty on Tour Tokyo 2025で開催される障害対応コンテスト用のチャットアプリケーションです。参加者はこのアプリケーションを使用して、障害対応スキルを競い合います。

## アプリケーション概要

このアプリケーションは、リアルタイムチャット機能を提供するWebアプリケーションです。

- **フロントエンド**: Next.js + TypeScript + TailwindCSS
- **バックエンド**: Next.js + TypeScript + Prisma ORM
- **データベース**: MySQL
- **通信**: WebSocket (Socket.IO)
- **コンテナ化**: Docker
- **本番環境**: Kubernetes (EKS)

## アプリケーション構成

```
app/
├── frontend/           # フロントエンドアプリケーション (Next.js)
├── backend/            # バックエンドアプリケーション (Next.js + Prisma)
├── nginx/              # Nginxの設定ファイル
├── manifests/          # Kubernetesマニフェスト
└── terraform/          # アプリケーションインフラのTerraformコード
```

### 主な機能

- ユーザー名を入力してチャットに参加
- リアルタイムメッセージ送受信
- 過去のメッセージ履歴の表示（最新100件）

## 開発環境のセットアップ

### 前提条件

- Docker と Docker Compose がインストールされていること
- Node.js と npm がインストールされていること（ローカル開発の場合）

### Docker Composeを使用したセットアップ

1. リポジトリをクローンします：

```bash
git clone https://github.com/your-org/challenge-cup.git
cd challenge-cup/app
```

2. Docker Composeでコンテナを起動します：

```bash
docker compose up -d
```

これにより、以下のコンポーネントが起動します：
- Nginxロードバランサ（ポート8080）
- フロントエンドサーバー（内部ポート3001）
- バックエンドサーバー（内部ポート3000）
- MySQLデータベース（ポート3306）

3. ブラウザで http://localhost:8080 にアクセスして、アプリケーションを確認します。

### ローカル開発（コンテナなし）

フロントエンドとバックエンドを個別に開発する場合：

#### バックエンド

```bash
cd app/backend
npm install
npm run dev
```

バックエンドサーバーは http://localhost:3000 で起動します。

#### フロントエンド

```bash
cd app/frontend
npm install
npm run dev
```

フロントエンドサーバーは http://localhost:3001 で起動します。

## コンテストへの参加方法

### チーム登録

1. 主催者から提供されたチーム名とアクセス情報を確認します。
2. 提供されたKubernetesクラスタへのアクセス方法に従って、`kubectl`の設定を行います。

### アプリケーションのデプロイ

コンテスト環境では、各チームは独自のnamespaceを持ち、そこにアプリケーションをデプロイします。

1. チーム用のマニフェストを適用します：

```bash
# フロントエンドのデプロイ
kubectl apply -k app/manifests/frontend/overlays/[your-team-name]/

# バックエンドのデプロイ
kubectl apply -k app/manifests/backend/overlays/[your-team-name]/
```

2. デプロイ状況を確認します：

```bash
kubectl get pods -n [your-team-name]
```

3. アプリケーションにアクセスします：
   - 各チームのアプリケーションは `https://[your-team-name]-app.pdcc.paas.jp` でアクセスできます。

## 障害対応のヒント

コンテスト中に発生する可能性のある問題と、確認すべきポイント：

1. **接続エラー**:
   - Nginxの設定を確認
   - WebSocketの接続設定を確認
   - CORSの設定を確認

2. **データベース関連の問題**:
   - Prismaのスキーマと接続設定を確認
   - MySQLの接続情報を確認

3. **パフォーマンス問題**:
   - リソース使用量を確認
   - クエリの最適化を検討

4. **ログの確認方法**:
   - コンテナログ: `kubectl logs [pod-name] -n [your-team-name]`
   - アプリケーションログ: NewRelicダッシュボードを確認

## トラブルシューティング

### ローカル開発環境の問題

1. **コンテナが起動しない場合**:
   ```bash
   docker compose logs
   ```
   でエラーを確認してください。

2. **データベース接続エラー**:
   - 環境変数 `DATABASE_URL` が正しく設定されているか確認
   - MySQLコンテナが起動しているか確認

3. **WebSocket接続エラー**:
   - Nginxの設定を確認
   - バックエンドのSocket.IO設定を確認

### Kubernetes環境の問題

1. **Podが起動しない**:
   ```bash
   kubectl describe pod [pod-name] -n [your-team-name]
   ```
   でエラーを確認してください。

2. **サービスにアクセスできない**:
   ```bash
   kubectl get svc -n [your-team-name]
   ```
   でサービスの状態を確認してください。

3. **Ingressの問題**:
   ```bash
   kubectl describe ingress -n [your-team-name]
   ```
   でIngressの設定を確認してください。

## 参考リソース

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Prisma ドキュメント](https://www.prisma.io/docs)
- [Socket.IO ドキュメント](https://socket.io/docs/v4)
- [Kubernetes ドキュメント](https://kubernetes.io/docs/home/)
- [Kustomize ドキュメント](https://kubectl.docs.kubernetes.io/guides/introduction/kustomize/)

## サポート

コンテスト中の技術的な質問は、提供されたSlackチャンネルでサポートチームに連絡してください。
