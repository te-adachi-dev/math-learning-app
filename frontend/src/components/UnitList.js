import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  LinearProgress,
  Chip,
  Divider,
  Button,
  CircularProgress,
  Alert,
  Tabs,
  Tab
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import HistoryIcon from '@mui/icons-material/History';
import SchoolIcon from '@mui/icons-material/School';
import { unitsAPI } from '../services/api';

// 学年ごとの色
const gradeColors = {
  1: '#4FC3F7', // ライトブルー
  2: '#AED581', // ライトグリーン
  3: '#FFD54F', // ライトイエロー
  4: '#FF8A65', // ライトオレンジ
  5: '#7986CB', // ライトパープル
  6: '#4DB6AC'  // ライトティール
};

const UnitList = ({ user }) => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedGrade, setSelectedGrade] = useState(user.grade);
  
  useEffect(() => {
    fetchUnits();
  }, [user.id]);

  const fetchUnits = async () => {
    setLoading(true);
    try {
      const response = await unitsAPI.getComprehensionLevels(user.id);
      if (response.success) {
        setUnits(response.comprehensionLevels);
      } else {
        setError(response.message || '単元情報の取得に失敗しました');
      }
    } catch (err) {
      setError(err.message || 'サーバーに接続できませんでした');
    } finally {
      setLoading(false);
    }
  };

  const handleUnitClick = (unitId) => {
    navigate(`/unit/${unitId}/problem`);
  };

  const handleHistoryClick = (unitId, event) => {
    event.stopPropagation();
    navigate(`/unit/${unitId}/history`);
  };

  const handleTabChange = (event, newValue) => {
    setSelectedGrade(newValue);
  };

  const filteredUnits = units.filter(unit => unit.grade === selectedGrade);

  if (loading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4, textAlign: 'center' }}>
          <CircularProgress />
          <Typography variant="body1" sx={{ mt: 2 }}>
            単元情報を読み込み中...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md">
        <Box sx={{ my: 4 }}>
          <Alert severity="error">{error}</Alert>
          <Button 
            variant="contained" 
            sx={{ mt: 2 }}
            onClick={fetchUnits}
          >
            再試行
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2 }}>
        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          算数の単元一覧
        </Typography>
        
        <Typography variant="body1" paragraph color="text.secondary">
          勉強したい単元を選んでタップしてね！
        </Typography>

        <Box sx={{ mb: 3 }}>
          <Button 
            variant="contained" 
            color="secondary"
            startIcon={<SchoolIcon />}
            onClick={() => navigate('/prepare')}
            fullWidth
            sx={{ mb: 1 }}
          >
            勉強の準備をする
          </Button>
        </Box>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs 
            value={selectedGrade} 
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
          >
            {[1, 2, 3, 4, 5, 6].map(grade => (
              <Tab 
                key={grade} 
                label={`${grade}年生`} 
                value={grade} 
                sx={{ 
                  fontWeight: 'bold',
                  color: gradeColors[grade]
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Grid container spacing={2}>
          {filteredUnits.length > 0 ? (
            filteredUnits.map((unit) => (
              <Grid item xs={12} key={unit.unit_id}>
                <Card 
                  sx={{ 
                    borderLeft: `6px solid ${gradeColors[unit.grade]}`,
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'translateY(-3px)',
                    }
                  }}
                >
                  <CardActionArea onClick={() => handleUnitClick(unit.unit_id)}>
                    <CardContent>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                        <Typography variant="h6" component="div" fontWeight="medium">
                          {unit.name}
                        </Typography>
                        <Chip 
                          label={`${unit.grade}年生`} 
                          size="small"
                          sx={{ 
                            bgcolor: gradeColors[unit.grade],
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        />
                      </Box>
                      
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        {unit.description}
                      </Typography>
                      
                      <Box sx={{ mt: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                          <Typography variant="body2" fontWeight="medium">
                            理解度
                          </Typography>
                          <Typography variant="body2" fontWeight="bold">
                            {unit.comprehension_level}%
                          </Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={unit.comprehension_level} 
                          sx={{ 
                            height: 8, 
                            borderRadius: 4,
                            bgcolor: '#e0e0e0',
                            '& .MuiLinearProgress-bar': {
                              bgcolor: unit.comprehension_level >= 100 ? '#4caf50' : (unit.comprehension_level >= 60 ? '#ff9800' : '#29b6f6')
                            }
                          }}
                        />
                      </Box>
                      
                      <Divider sx={{ my: 1.5 }} />
                      
                      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                        <Button 
                          size="small" 
                          startIcon={<PlayArrowIcon />}
                          color="primary"
                        >
                          問題に挑戦する
                        </Button>
                        
                        <Button 
                          size="small"
                          startIcon={<HistoryIcon />}
                          color="secondary"
                          onClick={(e) => handleHistoryClick(unit.unit_id, e)}
                        >
                          回答履歴
                        </Button>
                      </Box>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Alert severity="info">
                この学年の単元はまだありません。他の学年を選んでください。
              </Alert>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default UnitList;