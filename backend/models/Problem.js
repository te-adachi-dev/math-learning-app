// backend/models/Problem.js
const { db } = require('./db');

class Problem {
  // åé¡ã®åç­å±¥æ­´ãä¿å­ï¼SVGå¯¾å¿ï¼
  static saveHistory(userId, unitId, problem, answer, correctAnswer, explanation, isCorrect, svgData = null) {
    return new Promise((resolve, reject) => {
      db.run(`
        INSERT INTO problem_history 
        (user_id, unit_id, problem, answer, correct_answer, explanation, is_correct, svg_data) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [userId, unitId, problem, answer, correctAnswer, explanation, isCorrect ? 1 : 0, svgData], 
      function(err) {
        if (err) {
          reject(err);
          return;
        }
        resolve({ id: this.lastID });
      });
    });
  }

  // ã¦ã¼ã¶ã¼ã®ååãã¨ã®åé¡å±¥æ­´ãåå¾
  static getHistoryByUnit(userId, unitId, limit = 10) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT * FROM problem_history 
        WHERE user_id = ? AND unit_id = ? 
        ORDER BY created_at DESC 
        LIMIT ?
      `, [userId, unitId, limit], (err, history) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(history);
      });
    });
  }

  // ã¦ã¼ã¶ã¼ã®å¨åé¡å±¥æ­´ãåå¾
  static getAllHistory(userId, limit = 20) {
    return new Promise((resolve, reject) => {
      db.all(`
        SELECT ph.*, u.name as unit_name 
        FROM problem_history ph
        JOIN units u ON ph.unit_id = u.id
        WHERE ph.user_id = ? 
        ORDER BY ph.created_at DESC 
        LIMIT ?
      `, [userId, limit], (err, history) => {
        if (err) {
          reject(err);
          return;
        }
        resolve(history);
      });
    });
  }

  // ç¹å®ååã®æ­£è§£çãåå¾
  static getAccuracyRate(userId, unitId) {
    return new Promise((resolve, reject) => {
      db.get(`
        SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN is_correct = 1 THEN 1 ELSE 0 END) as correct
        FROM problem_history
        WHERE user_id = ? AND unit_id = ?
      `, [userId, unitId], (err, result) => {
        if (err) {
          reject(err);
          return;
        }
        
        const accuracy = result.total > 0 
          ? Math.round((result.correct / result.total) * 100) 
          : 0;
          
        resolve({ 
          total: result.total, 
          correct: result.correct,
          accuracy 
        });
      });
    });
  }
}

module.exports = Problem;
