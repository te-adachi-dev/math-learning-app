const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// データディレクトリを確認して作成
const dataDir = '/data';
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
  console.log(`データディレクトリを作成しました: ${dataDir}`);
}

// データベース接続
const dbPath = path.resolve(dataDir, 'math_app.db');
console.log(`データベースパス: ${dbPath}`);
const db = new sqlite3.Database(dbPath);

// SVGカラム追加関数
const addSvgColumn = () => {
  db.run(`
    ALTER TABLE problem_history 
    ADD COLUMN svg_data TEXT
  `, (err) => {
    if (err && !err.message.includes('duplicate column')) {
      console.log('SVGカラム追加エラー:', err.message);
    } else {
      console.log('SVGカラムが追加されました');
    }
  });
};

// データベースの初期化関数
const initDb = () => {
  db.serialize(() => {
    // ユーザーテーブル作成
    db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        birth_year INTEGER NOT NULL,
        grade INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 単元テーブル作成
    db.run(`
      CREATE TABLE IF NOT EXISTS units (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT,
        grade INTEGER NOT NULL,
        order_num INTEGER NOT NULL
      )
    `);

    // 問題履歴テーブル作成
    db.run(`
      CREATE TABLE IF NOT EXISTS problem_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        unit_id INTEGER NOT NULL,
        problem TEXT NOT NULL,
        answer TEXT,
        correct_answer TEXT NOT NULL,
        explanation TEXT,
        is_correct BOOLEAN NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (unit_id) REFERENCES units (id)
      )
    `);

    // 理解度テーブル作成
    db.run(`
      CREATE TABLE IF NOT EXISTS comprehension (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        unit_id INTEGER NOT NULL,
        level INTEGER DEFAULT 0,
        consecutive_correct INTEGER DEFAULT 0,
        advanced_correct INTEGER DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users (id),
        FOREIGN KEY (unit_id) REFERENCES units (id),
        UNIQUE(user_id, unit_id)
      )
    `);

    // SVGカラム追加（既存テーブルの場合）
    addSvgColumn();

    // 単元データがなければ初期データをロード
    db.get("SELECT COUNT(*) as count FROM units", (err, row) => {
      if (err) {
        console.error('単元データチェックエラー:', err);
        return;
      }
      
      if (row.count === 0) {
        console.log('単元初期データをロード中...');
        loadInitialUnits();
      }
    });
  });
};

// 単元の初期データロード
const loadInitialUnits = () => {
  const units = [
    // 1年生
    { name: '数と計算（10までの数）', description: '10までの数を数えたり表したりする', grade: 1, order_num: 1 },
    { name: '数と計算（たし算）', description: '1桁同士のたし算', grade: 1, order_num: 2 },
    { name: '数と計算（ひき算）', description: '1桁同士のひき算', grade: 1, order_num: 3 },
    { name: '図形（形）', description: '身の回りにあるものの形', grade: 1, order_num: 4 },
    { name: '測定（長さ、かさ）', description: '長さやかさの比較', grade: 1, order_num: 5 },
    
    // 2年生
    { name: '数と計算（100までの数）', description: '2桁の数の足し算引き算', grade: 2, order_num: 6 },
    { name: '数と計算（かけ算）', description: 'かけ算の意味と九九', grade: 2, order_num: 7 },
    { name: '図形（はこの形）', description: '箱の形や正方形、長方形、直角三角形', grade: 2, order_num: 8 },
    { name: '測定（長さ）', description: 'センチメートル、メートル', grade: 2, order_num: 9 },
    { name: '時刻と時間', description: '時計の読み方と時間の計算', grade: 2, order_num: 10 },
    
    // 3年生
    { name: '数と計算（1000までの数）', description: '3桁の数と計算', grade: 3, order_num: 11 },
    { name: '数と計算（わり算）', description: 'わり算の意味と計算', grade: 3, order_num: 12 },
    { name: '数と計算（小数）', description: '小数の意味と計算', grade: 3, order_num: 13 },
    { name: '数と計算（分数）', description: '分数の意味と表し方', grade: 3, order_num: 14 },
    { name: '図形（二等辺三角形と正三角形）', description: '二等辺三角形と正三角形の性質', grade: 3, order_num: 15 },
    { name: '測定（重さ）', description: 'グラム、キログラム', grade: 3, order_num: 16 },
    
    // 4年生
    { name: '数と計算（大きな数）', description: '億と兆の単位', grade: 4, order_num: 17 },
    { name: '数と計算（小数のかけ算・わり算）', description: '小数を使った計算', grade: 4, order_num: 18 },
    { name: '数と計算（分数のたし算・ひき算）', description: '分母が同じ分数の計算', grade: 4, order_num: 19 },
    { name: '図形（垂直と平行）', description: '垂直・平行の概念と作図', grade: 4, order_num: 20 },
    { name: '図形（四角形）', description: '平行四辺形、ひし形、台形', grade: 4, order_num: 21 },
    { name: '測定（面積）', description: '正方形・長方形の面積', grade: 4, order_num: 22 },
    { name: '角度', description: '角度の測定と分類', grade: 4, order_num: 23 },
    
    // 5年生
    { name: '数と計算（整数）', description: '偶数・奇数、倍数・約数', grade: 5, order_num: 24 },
    { name: '数と計算（小数の計算）', description: '小数のかけ算・わり算の筆算', grade: 5, order_num: 25 },
    { name: '数と計算（分数の計算）', description: '分母が違う分数の計算', grade: 5, order_num: 26 },
    { name: '図形（合同な図形）', description: '合同の意味と性質', grade: 5, order_num: 27 },
    { name: '図形（円と正多角形）', description: '円の性質と作図、正多角形', grade: 5, order_num: 28 },
    { name: '測定（体積）', description: '立方体・直方体の体積', grade: 5, order_num: 29 },
    { name: '割合', description: '割合の意味と百分率', grade: 5, order_num: 30 },
    
    // 6年生
    { name: '数と計算（分数の計算）', description: '分数のかけ算・わり算', grade: 6, order_num: 31 },
    { name: '数と計算（文字と式）', description: '文字を使った式の表し方', grade: 6, order_num: 32 },
    { name: '図形（拡大図と縮図）', description: '拡大・縮小の概念と作図', grade: 6, order_num: 33 },
    { name: '図形（対称な図形）', description: '線対称・点対称の図形', grade: 6, order_num: 34 },
    { name: '測定（円の面積）', description: '円の面積の計算', grade: 6, order_num: 35 },
    { name: '測定（角柱と円柱の体積）', description: '角柱・円柱の体積', grade: 6, order_num: 36 },
    { name: '比例と反比例', description: '比例・反比例の関係と表し方', grade: 6, order_num: 37 },
    { name: '資料の調べ方', description: '平均値・中央値・最頻値、グラフ', grade: 6, order_num: 38 }
  ];
  
  const stmt = db.prepare("INSERT INTO units (name, description, grade, order_num) VALUES (?, ?, ?, ?)");
  units.forEach(unit => {
    stmt.run(unit.name, unit.description, unit.grade, unit.order_num);
  });
  stmt.finalize();
  
  console.log('単元初期データをロードしました');
};

module.exports = {
  db,
  initDb
};