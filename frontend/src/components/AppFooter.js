import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Paper,
  BottomNavigation,
  BottomNavigationAction,
  Box
} from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import SchoolIcon from '@mui/icons-material/School';
import HistoryIcon from '@mui/icons-material/History';

const AppFooter = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // 現在のパスに基づいてナビゲーション値を設定
  const getCurrentValue = () => {
    const path = location.pathname;
    
    if (path === '/units') return 0;
    if (path === '/prepare') return 1;
    if (path === '/history' || (path.includes('/unit/') && path.includes('/history'))) return 2;
    
    return 0;
  };

  // ユーザーがログインしていない場合はフッターを表示しない
  if (!user) {
    return null;
  }

  return (
    <Box sx={{ width: '100%', position: 'fixed', bottom: 0, left: 0, zIndex: 1000 }}>
      <Paper elevation={3} sx={{ borderRadius: '16px 16px 0 0' }}>
        <BottomNavigation
          showLabels
          value={getCurrentValue()}
          sx={{ height: 60 }}
        >
          <BottomNavigationAction 
            label="単元一覧" 
            icon={<HomeIcon />} 
            onClick={() => navigate('/units')}
          />
          <BottomNavigationAction 
            label="準備" 
            icon={<SchoolIcon />} 
            onClick={() => navigate('/prepare')}
          />
          <BottomNavigationAction 
            label="履歴" 
            icon={<HistoryIcon />} 
            onClick={() => navigate('/history')}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
};

export default AppFooter;