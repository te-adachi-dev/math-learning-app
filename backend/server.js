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
const HOST = process.env.HOST || '0.0.0.0';

// ミドルウェア
app.use(cors());
app.use(express.json());

// データベース初期化
initDb();

// ルート設定
app.use('/api/auth', authRoutes);
app.use('/api/units', unitsRoutes);
app.use('/api/problems', problemsRoutes);

// 基本ルート
app.get('/', (req, res) => {
  res.send('算数学習アプリAPI - 稼働中');
});

// サーバー起動
app.listen(PORT, HOST, () => {
  console.log(`サーバーが起動しました: http://${HOST}:${PORT}`);
});