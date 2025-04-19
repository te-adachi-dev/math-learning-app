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
# math-learning-app直下に、「.env」というファイルを作成し、OpenAI APIキーを設定する
#OPENAI_API_KEY=<ここにAPIキーを入力してください　例：sk-xxxxxxx >　
#次のように記述します
OPENAI_API_KEY=sk-xxxxxxx

# 3. アプリケーションの起動
#起動直後に　検出されたホストIPアドレス: <IPアドレス　例：192.xxx.xxx.xxx>　というログが表示されます。これがアクセス先となります。
./setup.sh
```

ブラウザで http://<上記で表示されたIPアドレス>:3000 にアクセスしてアプリケーションを使用できます。

## 環境変数設定

- `OPENAI_API_KEY`: OpenAI APIキー（必須）　→　上記の通り手入力が必要です。
- `REACT_APP_API_URL`: バックエンドAPIのURL（デフォルト: http://localhost:3001/api）　→　自動で書き込まれます。

## ディレクトリ構造

```
math-learning-app/
├── backend/       # Express.jsバックエンド
├── frontend/      # Reactフロントエンド
├── data/          # SQLiteデータベース
└── docker-compose.yml
```
