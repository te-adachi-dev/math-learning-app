# 算数チャレンジ

小学生向け算数学習アプリケーション。

## 技術スタック

- **バックエンド**: Node.js + Express.js
- **フロントエンド**: React.js + Material-UI
- **データベース**: SQLite
- **AI**: OpenAI GPT-3.5 API
- **コンテナ化**: Docker, Docker Compose

## 起動方法

### 前提条件
- Docker & Docker Compose
- OpenAI API キー

### クイックスタート

```bash
# 1. リポジトリのクローン
git clone https://github.com/te-adachi-dev/math-learning-app.git
cd math-learning-app

# 2. .envファイルの作成
# .envファイルにOpenAI APIキーを設定する
# OPENAI_API_KEY=<ここにAPIキーを入力してください　例：sk-xxxxxxx >

# 3. アプリケーションの起動
docker-compose up --build
```

ブラウザで http://localhost:3000 にアクセスしてアプリケーションを使用できます。

## 環境変数設定

- `OPENAI_API_KEY`: OpenAI APIキー（必須）
- `REACT_APP_API_URL`: バックエンドAPIのURL（デフォルト: http://localhost:3001/api）

## ディレクトリ構造

```
math-learning-app/
├── backend/       # Express.jsバックエンド
├── frontend/      # Reactフロントエンド
├── data/          # SQLiteデータベース
└── docker-compose.yml
```