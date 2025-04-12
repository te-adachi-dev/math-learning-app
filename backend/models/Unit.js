const { db } = require('./db');

class Unit {
  // 全単元取得
  static getAll() {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM units ORDER BY grade, order_num', [], (err, units) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(units);
      });
    });
  }

  // 特定の単元を取得
  static findById(id) {
    return new Promise((resolve, reject) => {
      db.get('SELECT * FROM units WHERE id = ?', [id], (err, unit) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(unit);
      });
    });
  }

  // 特定の学年の単元を取得
  static getByGrade(grade) {
    return new Promise((resolve, reject) => {
      db.all('SELECT * FROM units WHERE grade = ? ORDER BY order_num', [grade], (err, units) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(units);
      });
    });
  }

  // 単元に関連する問題履歴を取得
  static getProblemHistory(unitId, userId) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM problem_history 
        WHERE unit_id = ? AND user_id = ? 
        ORDER BY created_at DESC
      `, [unitId, userId], (err, history) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(history);
      });
    });
  }
}

module.exports = Unit;