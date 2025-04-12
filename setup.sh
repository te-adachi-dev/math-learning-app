#!/bin/bash

# データディレクトリを作成
mkdir -p data
chmod 777 data

# ビルドして起動
docker-compose down
docker-compose up --build
