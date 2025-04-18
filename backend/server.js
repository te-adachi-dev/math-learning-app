require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initDb } = require('./models/db');

// ルートのインポート
const authRoutes = require('./routes/auth');
const unitsRoutes = require('./routes/units');
const problemsRoutes = require('./routes/problems');

const app = express();
const PORT = process.env.PORT || 3001;

// デバッグ用ミドルウェア - リクエスト情報をログに出力
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  console.log('リクエストヘッダー:', req.headers);
  if (req.body && Object.keys(req.body).length > 0) {
    console.log('リクエストボディ:', req.body);
  }
  next();
});

// ミドルウェア
app.use(cors({
  origin: ['http://localhost:3000', 'http://192.168.0.197:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));
app.use(express.json());

// データベース初期化
initDb();

// APIキーの確認
if (!process.env.OPENAI_API_KEY) {
  console.error('警告: OPENAI_API_KEYが設定されていません。');
  console.error('APIキーを.envファイルに設定してください。');
}

// ルート設定
app.use('/api/auth', authRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/problems', problemsRoutes);

// 基本ルート
app.get('/', (req, res) => {
  res.send('算数学習アプリAPI - 稼働中');
});

// エラーハンドリングミドルウェア
app.use((err, req, res, next) => {
  console.error('エラー発生:', err);
  res.status(500).json({
    success: false,
    message: '内部サーバーエラーが発生しました',
    error: err.message
  });
});

// サーバー起動
app.listen(PORT, '0.0.0.0', () => {
  console.log(`サーバーが起動しました: http://0.0.0.0:${PORT}`);
  console.log(`環境変数: NODE_ENV=${process.env.NODE_ENV}`);
  console.log(`OpenAI APIキー: ${process.env.OPENAI_API_KEY ? '設定済み' : '未設定'}`);
});