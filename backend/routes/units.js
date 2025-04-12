const express = require('express');
const Unit = require('../models/Unit');
const User = require('../models/User');

const router = express.Router();

// 全単元を取得
router.get('/', async (req, res) => {
  try {
    const units = await Unit.getAll();
    return res.json({ 
      success: true, 
      units 
    });
  } catch (error) {
    console.error('単元取得エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// 特定の単元を取得
router.get('/:id', async (req, res) => {
  try {
    const unit = await Unit.findById(req.params.id);
    
    if (!unit) {
      return res.status(404).json({ 
        success: false, 
        message: '単元が見つかりません' 
      });
    }
    
    return res.json({ 
      success: true, 
      unit 
    });
  } catch (error) {
    console.error('単元取得エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// 特定の学年の単元を取得
router.get('/grade/:grade', async (req, res) => {
  try {
    const grade = parseInt(req.params.grade);
    if (isNaN(grade) || grade < 1 || grade > 6) {
      return res.status(400).json({ 
        success: false, 
        message: '有効な学年を指定してください（1-6）' 
      });
    }
    
    const units = await Unit.getByGrade(grade);
    return res.json({ 
      success: true, 
      units 
    });
  } catch (error) {
    console.error('単元取得エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// ユーザーの全単元の理解度を取得
router.get('/user/:userId/comprehension', async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }
    
    const comprehensionLevels = await User.getComprehensionLevels(userId);
    return res.json({ 
      success: true, 
      comprehensionLevels 
    });
  } catch (error) {
    console.error('理解度取得エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// 単元の問題履歴を取得
router.get('/:unitId/history/:userId', async (req, res) => {
  try {
    const { unitId, userId } = req.params;
    
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ 
        success: false, 
        message: '単元が見つかりません' 
      });
    }
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }
    
    const history = await Unit.getProblemHistory(unitId, userId);
    return res.json({ 
      success: true, 
      history 
    });
  } catch (error) {
    console.error('履歴取得エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

module.exports = router;