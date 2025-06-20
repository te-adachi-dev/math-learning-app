import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import { unitsAPI, problemsAPI } from '../services/api';

const History = ({ user }) => {
  const { unitId } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [unit, setUnit] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(false);
  const [units, setUnits] = useState([]);
  const [selectedUnitId, setSelectedUnitId] = useState(unitId || '');

  useEffect(() => {
    fetchUnits();
    fetchHistory();
  }, [unitId, user.id]);

  // 単元リストを取得
  const fetchUnits = async () => {
    try {
      const response = await unitsAPI.getComprehensionLevels(user.id);
      if (response.success) {
        setUnits(response.comprehensionLevels);
      }
    } catch (err) {
      console.error('単元リスト取得エラー:', err);
    }
  };

  // 履歴データを取得
  const fetchHistory = async () => {
    setLoading(true);
    try {
      if (unitId) {
        // 特定の単元の履歴
        const unitResponse = await unitsAPI.getUnit(unitId);
        if (unitResponse.success) {
          setUnit(unitResponse.unit);
        }
        
        const historyResponse = await problemsAPI.getHistory(user.id, unitId, 20);
        if (historyResponse.success) {
          setHistory(historyResponse.history);
        } else {
          setError(historyResponse.message || '履歴の取得に失敗しました');
        }
      } else {
        // 全単元の履歴
        const historyResponse = await problemsAPI.getHistory(user.id, null, 20);
        if (historyResponse.success) {
          setHistory(historyResponse.history);
        } else {
          setError(historyResponse.message || '履歴の取得に失敗しました');
        }
      }
    } catch (err) {
      setError(err.message || 'サーバーに接続できませんでした');
    } finally {
      setLoading(false);
    }
  };

  // 選択した単元が変更されたとき
  const handleUnitChange = (event) => {
    const newUnitId = event.target.value;
    setSelectedUnitId(newUnitId);
    
    if (newUnitId) {
      navigate(`/unit/${newUnitId}/history`);
    } else {
      navigate('/history');
    }
  };

  // アコーディオンの開閉を制御
  const handleAccordionChange = (panel) => (event, isExpanded) => {
    setExpanded(isExpanded ? panel : false);
  };

  // 日時をフォーマット
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日 ${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            履歴を読み込み中...
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
            onClick={fetchHistory}
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate(unitId ? `/units` : '/units')}
          sx={{ mb: 2 }}
        >
          単元一覧に戻る
        </Button>

        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          {unitId ? `${unit?.name}の回答履歴` : '回答履歴'}
        </Typography>
        
        {!unitId && (
          <FormControl fullWidth margin="normal" sx={{ mb: 3 }}>
            <InputLabel id="unit-select-label">単元を選択</InputLabel>
            <Select
              labelId="unit-select-label"
              value={selectedUnitId}
              label="単元を選択"
              onChange={handleUnitChange}
            >
              <MenuItem value="">すべての単元</MenuItem>
              {units.map((unit) => (
                <MenuItem key={unit.unit_id} value={unit.unit_id}>
                  {unit.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
        
        {history.length === 0 ? (
          <Card>
            <CardContent>
              <Typography variant="body1" align="center" color="text.secondary" sx={{ py: 4 }}>
                まだ履歴がありません。問題を解いてみましょう！
              </Typography>
              <Button
                variant="contained"
                fullWidth
                onClick={() => navigate(unitId ? `/unit/${unitId}/problem` : '/units')}
              >
                {unitId ? '問題に挑戦する' : '単元を選ぶ'}
              </Button>
            </CardContent>
          </Card>
        ) : (
          <List>
            {history.map((item, index) => (
              <React.Fragment key={item.id}>
                <Accordion 
                  expanded={expanded === `panel${index}`} 
                  onChange={handleAccordionChange(`panel${index}`)}
                  sx={{ 
                    mb: 1, 
                    border: '1px solid',
                    borderColor: 'divider',
                    borderRadius: 1,
                    '&:before': {
                      display: 'none',
                    }
                  }}
                >
                  <AccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    sx={{ 
                      borderLeft: item.is_correct ? '6px solid #4caf50' : '6px solid #f44336',
                      borderRadius: expanded === `panel${index}` ? '4px 4px 0 0' : 1
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                      {item.is_correct ? (
                        <CheckCircleIcon sx={{ color: 'success.main', mr: 1 }} />
                      ) : (
                        <CloseIcon sx={{ color: 'error.main', mr: 1 }} />
                      )}
                      
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" noWrap sx={{ maxWidth: '90%' }}>
                          {item.problem.length > 60 
                            ? `${item.problem.substring(0, 60)}...` 
                            : item.problem}
                        </Typography>
                        
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Typography variant="body2" color="text.secondary">
                            {formatDate(item.created_at)}
                          </Typography>
                          
                          {!unitId && item.unit_name && (
                            <Chip 
                              label={item.unit_name} 
                              size="small" 
                              sx={{ ml: 1, fontSize: '0.7rem' }}
                            />
                          )}
                        </Box>
                      </Box>
                    </Box>
                  </AccordionSummary>
                  
                  <AccordionDetails sx={{ pt: 0 }}>
                    <Divider sx={{ mt: 1, mb: 2 }} />
                    
                    <Typography variant="body1" gutterBottom>
                      <strong>問題:</strong>
                    </Typography>
                    <Typography 
                      variant="body1" 
                      paragraph
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {item.problem}
                    </Typography>
                    
                    {/* SVG図形表示 */}
                    {item.svg_data && (
                      <Box sx={{ textAlign: 'center', my: 2 }}>
                        <div dangerouslySetInnerHTML={{ __html: item.svg_data }} />
                      </Box>
                    )}
                    
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'flex-start',
                      mb: 2
                    }}>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body1" gutterBottom>
                          <strong>あなたの回答:</strong>
                        </Typography>
                        <Typography 
                          variant="body1" 
                          paragraph
                          color={item.is_correct ? 'text.primary' : 'error.main'}
                        >
                          {item.answer}
                        </Typography>
                      </Box>
                      
                      <Box sx={{ flex: 1, ml: 4 }}>
                        <Typography variant="body1" gutterBottom>
                          <strong>正解:</strong>
                        </Typography>
                        <Typography 
                          variant="body1" 
                          paragraph
                          color="primary"
                        >
                          {item.correct_answer}
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Typography variant="body1" gutterBottom>
                      <strong>解説:</strong>
                    </Typography>
                    <Typography 
                      variant="body1" 
                      sx={{ whiteSpace: 'pre-wrap' }}
                    >
                      {item.explanation}
                    </Typography>
                  </AccordionDetails>
                </Accordion>
              </React.Fragment>
            ))}
          </List>
        )}
      </Box>
    </Container>
  );
};

export default History;