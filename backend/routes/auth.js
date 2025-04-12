const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// ユーザー登録（初回起動時）
router.post('/register',
  [
    body('birthYear').isInt({ min: 2000, max: new Date().getFullYear() }).withMessage('生まれた年は2000年以降で有効な値を入力してください'),
    body('grade').isInt({ min: 1, max: 6 }).withMessage('学年は1から6の間で入力してください')
  ],
  async (req, res) => {
    // バリデーションチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { birthYear, grade } = req.body;
      const user = await User.create(birthYear, grade);
      
      return res.status(201).json({ 
        success: true, 
        message: 'ユーザー登録が完了しました', 
        user 
      });
    } catch (error) {
      console.error('ユーザー登録エラー:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'サーバーエラーが発生しました' 
      });
    }
  }
);

// ユーザー情報取得
router.get('/user/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }
    
    return res.json({ 
      success: true, 
      user 
    });
  } catch (error) {
    console.error('ユーザー取得エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// 学年更新
router.put('/user/:id/grade',
  [
    body('grade').isInt({ min: 1, max: 6 }).withMessage('学年は1から6の間で入力してください')
  ],
  async (req, res) => {
    // バリデーションチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { grade } = req.body;
      const result = await User.updateGrade(req.params.id, grade);
      
      if (result.changes === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'ユーザーが見つかりません' 
        });
      }
      
      return res.json({ 
        success: true, 
        message: '学年を更新しました' 
      });
    } catch (error) {
      console.error('学年更新エラー:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'サーバーエラーが発生しました' 
      });
    }
  }
);

module.exports = router;