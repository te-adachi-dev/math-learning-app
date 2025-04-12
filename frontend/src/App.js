import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import Login from './components/Login';
import UnitList from './components/UnitList';
import ProblemSolver from './components/ProblemSolver';
import History from './components/History';
import AppHeader from './components/AppHeader';
import AppFooter from './components/AppFooter';
import PrepareStudy from './components/PrepareStudy';

// カスタムテーマ
const theme = createTheme({
  palette: {
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#ff9800',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: [
      'M PLUS Rounded 1c',
      'Roboto',
      'Arial',
      'sans-serif',
    ].join(','),
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 'bold',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
        },
      },
    },
  },
});

function App() {
  const [user, setUser] = useState(null);

  // ローカルストレージからユーザー情報を取得
  useEffect(() => {
    const storedUser = localStorage.getItem('mathAppUser');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // ユーザー情報を保存
  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem('mathAppUser', JSON.stringify(userData));
  };

  // ユーザー情報のクリア（デバッグ用）
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('mathAppUser');
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <AppHeader user={user} onLogout={handleLogout} />
          <main style={{ flex: 1, padding: '16px', paddingBottom: '76px' }}>
            <Routes>
              <Route 
                path="/" 
                element={user ? <Navigate to="/units" /> : <Login onLogin={handleLogin} />} 
              />
              <Route 
                path="/units" 
                element={user ? <UnitList user={user} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/prepare" 
                element={user ? <PrepareStudy /> : <Navigate to="/" />} 
              />
              <Route 
                path="/unit/:unitId/problem" 
                element={user ? <ProblemSolver user={user} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/history" 
                element={user ? <History user={user} /> : <Navigate to="/" />} 
              />
              <Route 
                path="/unit/:unitId/history" 
                element={user ? <History user={user} /> : <Navigate to="/" />} 
              />
            </Routes>
          </main>
          <AppFooter user={user} />
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;