const express = require('express');
const { body, validationResult } = require('express-validator');
const Unit = require('../models/Unit');
const User = require('../models/User');
const Problem = require('../models/Problem');
const GPTService = require('../services/gptService');

const router = express.Router();

// ååã®åé¡ãçæ
router.get('/generate/:unitId', async (req, res) => {
  try {
    const unitId = req.params.unitId;
    const userId = req.query.userId;
    const isAdvanced = req.query.advanced === 'true';
    
    // ååæå ±ãåå¾
    const unit = await Unit.findById(unitId);
    if (!unit) {
      return res.status(404).json({ 
        success: false, 
        message: 'ååãè¦ã¤ããã¾ãã' 
      });
    }
    
    // ã¦ã¼ã¶ã¼æå ±ãåå¾
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ã¦ã¼ã¶ã¼ãè¦ã¤ããã¾ãã' 
      });
    }
    
    // å­¦å¹´ã¨ååã®æ´åæ§ãã§ãã¯
    if (!GPTService.isUnitAppropriateForGrade(unit.name, user.grade)) {
      console.warn(`è­¦å: ${unit.name}ã¯${user.grade}å¹´çã«ã¯ä¸é©åãªååã§ã`);
    }
    
    // GPTã§åé¡ãçæ
    const problemData = await GPTService.generateProblem(unit, user.grade, isAdvanced);
    
    return res.json({ 
      success: true, 
      problem: problemData 
    });
  } catch (error) {
    console.error('åé¡çæã¨ã©ã¼:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'ãµã¼ãã¼ã¨ã©ã¼ãçºçãã¾ãã' 
    });
  }
});

// åé¡ã®åç­ãè©ä¾¡
router.post('/evaluate',
  [
    body('userId').notEmpty().withMessage('ã¦ã¼ã¶ã¼IDã¯å¿é ã§ã'),
    body('unitId').notEmpty().withMessage('ååIDã¯å¿é ã§ã'),
    body('problem').notEmpty().withMessage('åé¡æã¯å¿é ã§ã'),
    body('userAnswer').notEmpty().withMessage('åç­ã¯å¿é ã§ã'),
    body('correctAnswer').notEmpty().withMessage('æ­£è§£ã¯å¿é ã§ã'),
    body('isAdvanced').isBoolean().withMessage('é£æåº¦æå®ã¯å¿é ã§ã')
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
          message: 'ååãè¦ã¤ããã¾ãã' 
        });
      }
      
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'ã¦ã¼ã¶ã¼ãè¦ã¤ããã¾ãã' 
        });
      }
      
      const evaluation = await GPTService.evaluateAnswer(
        problem, 
        userAnswer, 
        correctAnswer, 
        unit,
        user.grade
      );
      
      // SVGãã¼ã¿ãå«ãã¦å±¥æ­´ãä¿å­ï¼svgDataãundefinedã®å ´åã¯nullï¼
      await Problem.saveHistory(
        userId,
        unitId,
        problem,
        userAnswer,
        correctAnswer,
        evaluation.explanation,
        evaluation.isCorrect,
        svgData || null  // SVGãã¼ã¿ãä¿å­ï¼ãªããã°nullï¼
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
      console.error('åç­è©ä¾¡ã¨ã©ã¼:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'ãµã¼ãã¼ã¨ã©ã¼ãçºçãã¾ãã' 
      });
    }
  }
);

// ãã£ããã¡ãã»ã¼ã¸ã«å¿ç­
router.post('/chat',
  [
    body('userId').notEmpty().withMessage('ã¦ã¼ã¶ã¼IDã¯å¿é ã§ã'),
    body('message').notEmpty().withMessage('ã¡ãã»ã¼ã¸ã¯å¿é ã§ã')
  ],
  async (req, res) => {
    // ããªãã¼ã·ã§ã³ãã§ãã¯
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { userId, message, unitId } = req.body;
      
      // ã¦ã¼ã¶ã¼æå ±ãåå¾
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ 
          success: false, 
          message: 'ã¦ã¼ã¶ã¼ãè¦ã¤ããã¾ãã' 
        });
      }
      
      // ååæå ±ãåå¾ï¼æå®ããã¦ããå ´åï¼
      let unit = null;
      if (unitId) {
        unit = await Unit.findById(unitId);
      }
      
      // GPTã§ãã£ããå¿ç­ãçæ
      const response = await GPTService.generateChatResponse(message, user, unit);
      
      return res.json({ 
        success: true, 
        response 
      });
    } catch (error) {
      console.error('ãã£ããå¿ç­ã¨ã©ã¼:', error);
      return res.status(500).json({ 
        success: false, 
        message: 'ãµã¼ãã¼ã¨ã©ã¼ãçºçãã¾ãã' 
      });
    }
  }
);

// åé¡å±¥æ­´ãåå¾
router.get('/history/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const unitId = req.query.unitId;
    const limit = parseInt(req.query.limit) || 10;
    
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'ã¦ã¼ã¶ã¼ãè¦ã¤ããã¾ãã' 
      });
    }
    
    let history;
    if (unitId) {
      // ç¹å®ååã®å±¥æ­´
      const unit = await Unit.findById(unitId);
      if (!unit) {
        return res.status(404).json({ 
          success: false, 
          message: 'ååãè¦ã¤ããã¾ãã' 
        });
      }
      history = await Problem.getHistoryByUnit(userId, unitId, limit);
    } else {
      // å¨ååã®å±¥æ­´
      history = await Problem.getAllHistory(userId, limit);
    }
    
    return res.json({ 
      success: true, 
      history 
    });
  } catch (error) {
    console.error('å±¥æ­´åå¾ã¨ã©ã¼:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'ãµã¼ãã¼ã¨ã©ã¼ãçºçãã¾ãã' 
    });
  }
});

module.exports = router;
