# ビルドステージ
FROM node:18-alpine AS builder

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# アプリケーションをビルド
RUN npm run build

# 実行ステージ
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 本番環境の依存関係のみをインストール
RUN npm install --production

# ビルドステージからビルド成果物をコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# ポート3001を公開
EXPOSE 3001

# 環境変数を設定
ENV PORT=3001

# ビルドされたアプリケーションを起動
CMD ["npm", "run", "start", "--", "-p", "3001"]
