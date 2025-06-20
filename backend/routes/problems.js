const express = require('express');
const { body, validationResult } = require('express-validator');
const Unit = require('../models/Unit');
const User = require('../models/User');
const Problem = require('../models/Problem');
const GPTService = require('../services/gptService');

const router = express.Router();

// 単元の問題を生成
router.get('/generate/:unitId', async (req, res) => {
  try {
    const unitId = req.params.unitId;
    const userId = req.query.userId;
    const isAdvanced = req.query.advanced === 'true';
    
    // 単元情報を取得
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ 
        success: false, 
        message: '単元が見つかりません' 
      });
    }
    
    // ユーザー情報を取得
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }
    
    // GPTで問題を生成
    const problemData = await GPTService.generateProblem(unit, user.grade, isAdvanced);
    
    return res.json({ 
      success: true, 
      problem: problemData 
    });
  } catch (error) {
    console.error('問題生成エラー:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'サーバーエラーが発生しました' 
    });
  }
});

// 問題の回答を評価
// backend/routes/problems.js の evaluate部分を更新

// 問題の回答を評価（SVG対応部分のみ抜粋）
router.post('/evaluate',
  [
    body('userId').notEmpty().withMessage('ユーザーIDは必須です'),
    body('unitId').notEmpty().withMessage('単元IDは必須です'),
    body('problem').notEmpty().withMessage('問題文は必須です'),
    body('userAnswer').notEmpty().withMessage('回答は必須です'),
    body('correctAnswer').notEmpty().withMessage('正解は必須です'),
    body('isAdvanced').isBoolean().withMessage('難易度指定は必須です')
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, unitId, problem, userAnswer, correctAnswer, isAdvanced, svgData } = req.body;
      
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
      
      const evaluation = await GPTService.evaluateAnswer(
        problem, 
        userAnswer, 
        correctAnswer, 
        unit,
        user.grade
      );
      
      // SVGデータも含めて履歴を保存
      await Problem.saveHistory(
        userId,
        unitId,
        problem,
        userAnswer,
        correctAnswer,
        evaluation.explanation,
        evaluation.isCorrect,
        svgData || null  // SVGデータを保存
      );
      
      const comprehensionUpdate = await User.updateComprehensionLevel(
        userId,
        unitId,
        evaluation.isCorrect,
        isAdvanced
      );
      
      return res.json({ 
        success: true, 
        result: evaluation,
        comprehensionLevel: comprehensionUpdate.level
      });
    } catch (error) {
      console.error('回答評価エラー:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'サーバーエラーが発生しました' 
      });
    }
  }
);

// チャットメッセージに応答
router.post('/chat',
  [
    body('userId').notEmpty().withMessage('ユーザーIDは必須です'),
    body('message').notEmpty().withMessage('メッセージは必須です')
  ],
  async (req, res) => {
    // バリデーションチェック
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, message, unitId } = req.body;
      
      // ユーザー情報を取得
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'ユーザーが見つかりません' 
        });
      }
      
      // 単元情報を取得（指定されている場合）
      let unit = null;
      if (unitId) {
        unit = await Unit.findById(unitId);
      }
      
      // GPTでチャット応答を生成
      const response = await GPTService.generateChatResponse(message, user, unit);
      
      return res.json({ 
        success: true, 
        response 
      });
    } catch (error) {
      console.error('チャット応答エラー:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'サーバーエラーが発生しました' 
      });
    }
  }
);

// 問題履歴を取得
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const unitId = req.query.unitId;
    const limit = parseInt(req.query.limit) || 10;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ユーザーが見つかりません' 
      });
    }
    
    let history;
    if (unitId) {
      // 特定単元の履歴
      const unit = await Unit.findById(unitId);
      if (!unit) {
        return res.status(404).json({ 
          success: false, 
          message: '単元が見つかりません' 
        });
      }
      history = await Problem.getHistoryByUnit(userId, unitId, limit);
    } else {
      // 全単元の履歴
      history = await Problem.getAllHistory(userId, limit);
    }
    
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