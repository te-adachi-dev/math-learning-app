import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Divider,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Slide,
  Zoom,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SendIcon from '@mui/icons-material/Send';
import RefreshIcon from '@mui/icons-material/Refresh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ChatIcon from '@mui/icons-material/Chat';
import { unitsAPI, problemsAPI } from '../services/api';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const ProblemSolver = ({ user }) => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  const answerInputRef = useRef(null);
  const chatInputRef = useRef(null);

  const [unit, setUnit] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [evaluating, setEvaluating] = useState(false); // ②評価中フラグ追加
  const [error, setError] = useState('');
  const [problem, setProblem] = useState(null);
  const [answer, setAnswer] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState(null);
  const [comprehensionLevel, setComprehensionLevel] = useState(0);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [levelUpDialog, setLevelUpDialog] = useState(false);
  const [chatMode, setChatMode] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [sendingChat, setSendingChat] = useState(false);

  // 初回ロード時に単元情報を取得
  useEffect(() => {
    fetchUnitData();
  }, [unitId]);

  // ③自動進行タイマーを削除（コメントアウト）
  /*
  useEffect(() => {
    let timer;
    if (submitted && result) {
      timer = setTimeout(() => {
        if (comprehensionLevel >= 60 && comprehensionLevel < 100 && !isAdvanced) {
          setLevelUpDialog(true);
        } else {
          handleNewProblem();
        }
      }, 8000);
    }
    return () => clearTimeout(timer);
  }, [submitted, result]);
  */

  const fetchUnitData = async () => {
    setLoading(true);
    try {
      const unitResponse = await unitsAPI.getUnit(unitId);
      if (unitResponse.success) {
        setUnit(unitResponse.unit);
        
        const comprehensionResponse = await unitsAPI.getComprehensionLevels(user.id);
        if (comprehensionResponse.success) {
          const unitComprehension = comprehensionResponse.comprehensionLevels.find(
            u => u.unit_id === parseInt(unitId)
          );
          if (unitComprehension) {
            setComprehensionLevel(unitComprehension.comprehension_level || 0);
            
            if (unitComprehension.comprehension_level >= 60) {
              setIsAdvanced(true);
            }
          }
        }
        
        generateProblem();
      } else {
        setError(unitResponse.message || '単元情報の取得に失敗しました');
        setLoading(false);
      }
    } catch (err) {
      setError(err.message || 'サーバーに接続できませんでした');
      setLoading(false);
    }
  };

  const generateProblem = async () => {
    setGenerating(true);
    setSubmitted(false);
    setResult(null);
    setAnswer('');
    
    try {
      const response = await problemsAPI.generateProblem(unitId, user.id, isAdvanced);
      if (response.success) {
        setProblem(response.problem);
      } else {
        setError(response.message || '問題の生成に失敗しました');
      }
    } catch (err) {
      setError(err.message || 'サーバーに接続できませんでした');
    } finally {
      setGenerating(false);
      setLoading(false);
      
      setTimeout(() => {
        if (answerInputRef.current) {
          answerInputRef.current.focus();
        }
      }, 500);
    }
  };

  const handleNewProblem = () => {
    setLevelUpDialog(false);
    generateProblem();
  };

  // ②回答送信時の処理修正（SVGデータ送信対応）
  const handleSubmitAnswer = async (e) => {
    e.preventDefault();
    
    if (!answer.trim()) {
      return;
    }
    
    setEvaluating(true); // 評価開始フラグ
    
    try {
      const response = await problemsAPI.evaluateAnswer(
        user.id, 
        unitId, 
        problem.problem, 
        answer, 
        problem.answer,
        isAdvanced,
        problem.svg || null  // SVGデータを送信
      );
      
      if (response.success) {
        // ②評価完了後に一度に状態更新
        setResult(response.result);
        setComprehensionLevel(response.comprehensionLevel);
        setSubmitted(true);
        
        // ③レベルアップ判定（自動進行なし）
        if (response.comprehensionLevel >= 60 && response.comprehensionLevel < 100 && !isAdvanced) {
          setTimeout(() => setLevelUpDialog(true), 1000);
        }
      } else {
        setError(response.message || '回答の評価に失敗しました');
      }
    } catch (err) {
      setError(err.message || 'サーバーに接続できませんでした');
    } finally {
      setEvaluating(false); // 評価終了フラグ
    }
  };

  const handleDifficultyToggle = () => {
    setIsAdvanced(!isAdvanced);
    handleNewProblem();
  };

  const handleChatToggle = () => {
    setChatMode(!chatMode);
    
    if (!chatMode) {
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 300);
    }
  };

  const handleSendChatMessage = async (e) => {
    e.preventDefault();
    
    if (!chatInput.trim()) {
      return;
    }
    
    const userMessage = chatInput;
    setChatInput('');
    setSendingChat(true);
    
    setChatMessages(prev => [
      ...prev, 
      { sender: 'user', text: userMessage }
    ]);
    
    try {
      const response = await problemsAPI.sendChatMessage(user.id, userMessage, unitId);
      
      if (response.success) {
        setChatMessages(prev => [
          ...prev, 
          { sender: 'assistant', text: response.response }
        ]);
      } else {
        setError(response.message || 'メッセージの送信に失敗しました');
      }
    } catch (err) {
      setError(err.message || 'サーバーに接続できませんでした');
    } finally {
      setSendingChat(false);
      
      setTimeout(() => {
        if (chatInputRef.current) {
          chatInputRef.current.focus();
        }
      }, 300);
    }
  };

  if (loading && !problem) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            問題を準備中...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
          <Button 
            variant="contained" 
            onClick={fetchUnitData}
          >
            再試行
          </Button>
          <Button 
            sx={{ ml: 2 }}
            onClick={() => navigate('/units')}
          >
            単元一覧に戻る
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/units')}
          >
            単元一覧に戻る
          </Button>
          
          <Box>
            <Button
              variant={chatMode ? "contained" : "outlined"}
              color="secondary"
              startIcon={<ChatIcon />}
              onClick={handleChatToggle}
              size="small"
              sx={{ mr: 1 }}
            >
              先生に質問
            </Button>
            
            <Chip 
              label={isAdvanced ? "応用問題" : "基本問題"} 
              color={isAdvanced ? "secondary" : "primary"}
              onClick={handleDifficultyToggle}
              clickable
            />
          </Box>
        </Box>

        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          {unit?.name}
        </Typography>
        
        <Typography variant="body2" paragraph color="text.secondary">
          {unit?.description}
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Paper 
            elevation={3} 
            sx={{ 
              p: 2, 
              borderRadius: 2,
              bgcolor: isAdvanced ? '#fff8e1' : '#e8f5e9',
              position: 'relative'
            }}
          >
            {generating ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <CircularProgress size={40} />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  問題を作成中...
                </Typography>
              </Box>
            ) : (
              <>
                <Typography 
                  variant="h6" 
                  gutterBottom
                  sx={{ pr: 6 }}
                >
                  問題
                </Typography>
                <Typography 
                  variant="body1" 
                  paragraph
                  sx={{ 
                    whiteSpace: 'pre-wrap',
                    fontSize: '1.1rem',
                    lineHeight: 1.6
                  }}
                >
                  {problem?.problem}
                </Typography>
                
                {/* ①SVG図形表示 */}
                {problem?.svg && (
                  <Box sx={{ textAlign: 'center', my: 2 }}>
                    <div dangerouslySetInnerHTML={{ __html: problem.svg }} />
                  </Box>
                )}
                
                <Chip 
                  label={isAdvanced ? "応用問題" : "基本問題"} 
                  color={isAdvanced ? "secondary" : "primary"}
                  size="small"
                  sx={{ 
                    position: 'absolute',
                    top: 16,
                    right: 16
                  }}
                />
              </>
            )}
          </Paper>
        </Box>

        {!generating && !chatMode && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              {!submitted ? (
                <form onSubmit={handleSubmitAnswer}>
                  <Typography variant="h6" gutterBottom>
                    答えを入力してね
                  </Typography>
                  
                  <TextField
                    fullWidth
                    label="ここに答えを入力"
                    variant="outlined"
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    disabled={evaluating} // ②評価中は無効化
                    inputRef={answerInputRef}
                    sx={{ mb: 2 }}
                    autoComplete="off"
                  />
                  
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    size="large"
                    disabled={!answer.trim() || evaluating} // ②評価中は無効化
                  >
                    {evaluating ? (
                      <>
                        <CircularProgress size={20} sx={{ mr: 1 }} color="inherit" />
                        評価中...
                      </>
                    ) : (
                      '答えを送信'
                    )}
                  </Button>
                </form>
              ) : (
                <Zoom in={true}>
                  <Box>
                    <Box 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        mb: 2,
                        color: result?.isCorrect ? 'success.main' : 'error.main'
                      }}
                    >
                      {result?.isCorrect ? (
                        <CheckCircleIcon sx={{ mr: 1, fontSize: 30 }} />
                      ) : (
                        <CloseIcon sx={{ mr: 1, fontSize: 30 }} />
                      )}
                      <Typography 
                        variant="h6" 
                        component="div" 
                        fontWeight="bold"
                        color={result?.isCorrect ? 'success.main' : 'error.main'}
                      >
                        {result?.isCorrect ? 'せいかい！' : 'ざんねん...'}
                      </Typography>
                    </Box>
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" gutterBottom fontWeight="medium">
                        あなたの答え: 
                      </Typography>
                      <Typography variant="body1">
                        {answer}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" gutterBottom fontWeight="medium">
                        正しい答え: 
                      </Typography>
                      <Typography 
                        variant="body1" 
                        fontWeight={!result?.isCorrect ? 'bold' : 'normal'}
                        color={!result?.isCorrect ? 'primary.main' : 'text.primary'}
                      >
                        {problem?.answer}
                      </Typography>
                    </Box>
                    
                    <Divider sx={{ my: 2 }} />
                    
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="body1" gutterBottom fontWeight="medium">
                        解説: 
                      </Typography>
                      <Typography 
                        variant="body1" 
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {result?.explanation || problem?.explanation}
                      </Typography>
                    </Box>
                    
                    {/* ③手動で次に進むボタン */}
                    <Button
                      variant="contained"
                      color="primary"
                      fullWidth
                      size="large"
                      startIcon={<RefreshIcon />}
                      onClick={handleNewProblem}
                      sx={{ mt: 2 }}
                    >
                      次の問題に進む
                    </Button>
                  </Box>
                </Zoom>
              )}
            </CardContent>
          </Card>
        )}

        {chatMode && (
          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                先生に質問してみよう
              </Typography>
              
              <Box 
                sx={{ 
                  height: 300, 
                  overflowY: 'auto', 
                  bgcolor: '#f5f5f5', 
                  borderRadius: 2,
                  p: 2,
                  mb: 2
                }}
              >
                {chatMessages.length === 0 ? (
                  <Box sx={{ textAlign: 'center', color: 'text.secondary', mt: 10 }}>
                    <ChatIcon sx={{ fontSize: 40, opacity: 0.5, mb: 1 }} />
                    <Typography variant="body2">
                      先生に質問してみよう！
                    </Typography>
                  </Box>
                ) : (
                  chatMessages.map((msg, index) => (
                    <Box 
                      key={index} 
                      sx={{ 
                        display: 'flex',
                        justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                        mb: 2
                      }}
                    >
                      <Paper 
                        elevation={1}
                        sx={{ 
                          p: 1.5,
                          borderRadius: 2,
                          maxWidth: '80%',
                          bgcolor: msg.sender === 'user' ? 'primary.light' : 'white',
                          color: msg.sender === 'user' ? 'white' : 'text.primary'
                        }}
                      >
                        <Typography variant="body1">
                          {msg.text}
                        </Typography>
                      </Paper>
                    </Box>
                  ))
                )}
              </Box>
              
              <form onSubmit={handleSendChatMessage}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TextField
                    fullWidth
                    label="質問を入力"
                    variant="outlined"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={sendingChat}
                    inputRef={chatInputRef}
                    autoComplete="off"
                  />
                  <IconButton 
                    type="submit" 
                    color="primary" 
                    sx={{ ml: 1 }}
                    disabled={!chatInput.trim() || sendingChat}
                  >
                    {sendingChat ? <CircularProgress size={24} /> : <SendIcon />}
                  </IconButton>
                </Box>
              </form>
            </CardContent>
          </Card>
        )}

        <Box sx={{ mt: 4 }}>
          <Typography variant="body2" gutterBottom fontWeight="medium">
            理解度:
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ width: '100%', mr: 1 }}>
              <Stepper activeStep={comprehensionLevel >= 100 ? 2 : (comprehensionLevel >= 60 ? 1 : 0)}>
                <Step>
                  <StepLabel>はじめました</StepLabel>
                </Step>
                <Step>
                  <StepLabel>基本問題クリア</StepLabel>
                </Step>
                <Step>
                  <StepLabel>マスター</StepLabel>
                </Step>
              </Stepper>
            </Box>
            <Box sx={{ minWidth: 70 }}>
              <Typography variant="body2" fontWeight="bold" color="primary">
                {comprehensionLevel}%
              </Typography>
            </Box>
          </Box>
        </Box>
      </Box>
      
      <Dialog
        open={levelUpDialog}
        TransitionComponent={Transition}
        keepMounted
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <EmojiEventsIcon sx={{ color: 'gold', mr: 1, fontSize: 30 }} />
            基本問題をマスターしました！
          </Box>
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            おめでとう！基本問題を理解できました。
            次は応用問題に挑戦してみませんか？
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => {
            setIsAdvanced(false);
            handleNewProblem();
          }}>
            基本問題を続ける
          </Button>
          <Button 
            variant="contained" 
            onClick={() => {
              setIsAdvanced(true);
              handleNewProblem();
            }}
          >
            応用問題に挑戦する
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ProblemSolver;