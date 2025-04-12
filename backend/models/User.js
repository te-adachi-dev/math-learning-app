const { db } = require('./db');

class User {
  // ユーザー登録
  static create(birthYear, grade) {
    return new Promise((resolve, reject) => {
      const stmt = db.prepare('INSERT INTO users (birth_year, grade) VALUES (?, ?)');
      stmt.run(birthYear, grade, function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID, birthYear, grade });
      });
      stmt.finalize();
    });
  }

  // ユーザー取得
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM users WHERE id = ?', [id], (err, user) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(user);
      });
    });
  }

  // 学年更新
  static updateGrade(id, grade) {
    return new Promise((resolve, reject) => {
      db.run('UPDATE users SET grade = ? WHERE id = ?', [grade, id], function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ changes: this.changes });
      });
    });
  }

  // ユーザーの全単元の理解度を取得
  static getComprehensionLevels(userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          u.id as unit_id, 
          u.name, 
          u.description, 
          u.grade, 
          COALESCE(c.level, 0) as comprehension_level 
        FROM 
          units u 
        LEFT JOIN 
          comprehension c ON u.id = c.unit_id AND c.user_id = ?
        ORDER BY 
          u.grade, u.order_num
      `, [userId], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(rows);
      });
    });
  }

  // ユーザーの特定単元に対する理解度を更新
  static updateComprehensionLevel(userId, unitId, isCorrect, isAdvanced) {
    return new Promise((resolve, reject) => {
      // まず現在の理解度情報を取得
      db.get(
        'SELECT * FROM comprehension WHERE user_id = ? AND unit_id = ?',
        [userId, unitId],
        (err, current) => {
          if (err) {
            reject(err);
            return;
          }

          if (!current) {
            // 理解度レコードがまだない場合は作成
            db.run(
              `INSERT INTO comprehension 
               (user_id, unit_id, level, consecutive_correct, advanced_correct) 
               VALUES (?, ?, ?, ?, ?)`,
              [userId, unitId, 0, isCorrect ? 1 : 0, isAdvanced && isCorrect ? 1 : 0],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve({ id: this.lastID, level: 0 });
              }
            );
          } else {
            // 既存レコードの更新
            let newLevel = current.level;
            let consecutiveCorrect = isCorrect ? current.consecutive_correct + 1 : 0;
            let advancedCorrect = current.advanced_correct;
            
            if (isAdvanced && isCorrect) {
              advancedCorrect += 1;
            }

            // 理解度の更新ロジック
            if (consecutiveCorrect >= 5 && newLevel < 60) {
              newLevel = 60;
              consecutiveCorrect = 0;
            }
            
            if (advancedCorrect >= 2 && newLevel < 100) {
              newLevel = 100;
              advancedCorrect = 0;
            }

            db.run(
              `UPDATE comprehension 
               SET level = ?, consecutive_correct = ?, advanced_correct = ?, updated_at = CURRENT_TIMESTAMP 
               WHERE user_id = ? AND unit_id = ?`,
              [newLevel, consecutiveCorrect, advancedCorrect, userId, unitId],
              function(err) {
                if (err) {
                  reject(err);
                  return;
                }
                resolve({ 
                  changes: this.changes, 
                  level: newLevel, 
                  consecutiveCorrect, 
                  advancedCorrect 
                });
              }
            );
          }
        }
      );
    });
  }
}

module.exports = User;