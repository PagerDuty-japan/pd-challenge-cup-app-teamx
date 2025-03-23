# Node.jsの公式イメージをベースとして使用
FROM node:18-alpine

# 作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコピー
COPY package*.json ./

# 依存関係をインストール
RUN npm install

# ソースコードをコピー
COPY . .

# Prismaクライアントを生成
RUN npx prisma generate

# ポート3000を公開
EXPOSE 3000

# 環境変数を設定
ENV PORT=3000

# アプリケーションを起動（ホストバインディングを設定）
CMD ["npm", "run", "start", "--", "--hostname", "0.0.0.0"]
