# `Dockerfile`

# ベースイメージの指定
FROM node:20-alpine

# コンテナ内の作業ディレクトリを設定
WORKDIR /app

# package.jsonとpackage-lock.jsonをコンテナにコピー
COPY ./app/package*.json ./

# すべての依存関係を一度にインストール
RUN npm install

# アプリケーションのコードをコンテナにコピー
COPY ./app .

# ポートを公開
EXPOSE 5173

# アプリケーションの起動コマンド
CMD ["npm", "run", "dev", "--", "--host"]