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

# New Relic設定ファイルをコピー
COPY newrelic.js ./

# Prismaクライアントを生成
RUN npx prisma generate

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

# Prismaスキーマとマイグレーションをコピー
COPY --from=builder /app/prisma ./prisma

# Prismaクライアントを生成
RUN npx prisma generate

# ビルドステージからビルド成果物をコピー
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public

# ポート3000を公開
EXPOSE 3000

# 環境変数を設定
ENV PORT=3000
ENV NODE_ENV=production
# New Relic環境変数はKubernetesマニフェストで設定されます

# New Relic設定ファイルをコピー
COPY --from=builder /app/newrelic.js ./

# ビルドされたアプリケーションを起動
CMD ["npm", "run", "start", "--", "-p", "3000"]
