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

# ポート3001を公開
EXPOSE 3001

# 環境変数を設定
ENV PORT=3001
ENV NEXT_PUBLIC_BACKEND_URL=http://localhost:3000

# アプリケーションを起動（ホストバインディングを設定）
CMD ["npm", "run", "dev", "--", "--hostname", "0.0.0.0"]
