#!/bin/bash

# データディレクトリを作成
mkdir -p data
chmod 777 data || echo "データディレクトリのパーミッション変更ができませんでした"

# ホストIPアドレスを取得（デフォルトゲートウェイを使用しているインターフェース）
HOST_IP=$(ip route get 1 | awk '{print $7;exit}')
echo "検出されたホストIPアドレス: $HOST_IP"

# 既存のOPENAI_API_KEYを保持
if [ -f .env ]; then
  EXISTING_API_KEY=$(grep OPENAI_API_KEY .env | cut -d'=' -f2)
fi

# API KEYが空の場合は環境変数から取得
if [ -z "$EXISTING_API_KEY" ]; then
  EXISTING_API_KEY=${OPENAI_API_KEY}
fi

# .envファイルを作成（既存のAPIキーを保持）
cat > .env << EOF
HOST_IP=$HOST_IP
OPENAI_API_KEY=$EXISTING_API_KEY
EOF

# .envの内容を表示（APIキーは隠す）
echo "環境変数ファイルの内容:"
echo "HOST_IP=$HOST_IP"
echo "OPENAI_API_KEY=********（セキュリティのため非表示）"

# ビルドして起動
docker-compose down
docker-compose up --build