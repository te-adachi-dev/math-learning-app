import React, { useState } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Slide,
  CircularProgress
} from '@mui/material';
import { authAPI } from '../services/api';

const currentYear = new Date().getFullYear();
const birthYears = Array.from({ length: 15 }, (_, i) => currentYear - 5 - i);

const Login = ({ onLogin }) => {
  const [birthYear, setBirthYear] = useState('');
  const [grade, setGrade] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!birthYear || !grade) {
      setError('うまれた年と学年を入力してください');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const response = await authAPI.register(birthYear, grade);
      if (response.success) {
        onLogin(response.user);
      } else {
        setError(response.message || 'ログインに失敗しました');
      }
    } catch (err) {
      setError(err.message || 'サーバーに接続できませんでした');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm">
      <Slide direction="up" in={true} mountOnEnter unmountOnExit>
        <Box sx={{ my: 4 }}>
          <Typography
            variant="h4"
            align="center"
            gutterBottom
            fontWeight="bold"
            color="primary"
          >
            算数チャレンジ
          </Typography>
          
          <Typography 
            variant="subtitle1" 
            align="center" 
            gutterBottom
            color="text.secondary"
          >
            楽しく算数を学ぼう！
          </Typography>
          
          <Card sx={{ mt: 4 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                はじめまして！
              </Typography>
              
              <Typography variant="body2" paragraph color="text.secondary">
                算数チャレンジへようこそ！
                あなたに合わせた問題を用意するために、
                生まれた年と今の学年を教えてください。
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}
              
              <form onSubmit={handleSubmit}>
                <FormControl fullWidth margin="normal">
                  <InputLabel id="birth-year-label">うまれた年</InputLabel>
                  <Select
                    labelId="birth-year-label"
                    value={birthYear}
                    label="うまれた年"
                    onChange={(e) => setBirthYear(e.target.value)}
                    disabled={loading}
                  >
                    {birthYears.map(year => (
                      <MenuItem key={year} value={year}>{year}年</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <FormControl fullWidth margin="normal">
                  <InputLabel id="grade-label">学年</InputLabel>
                  <Select
                    labelId="grade-label"
                    value={grade}
                    label="学年"
                    onChange={(e) => setGrade(e.target.value)}
                    disabled={loading}
                  >
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <MenuItem key={g} value={g}>{g}年生</MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                <Button
                  type="submit"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3 }}
                  disabled={loading}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    'スタート！'
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </Box>
      </Slide>
    </Container>
  );
};

export default Login;