import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Chip,
  Menu,
  MenuItem,
  ListItemIcon,
  Tooltip
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import HistoryIcon from '@mui/icons-material/History';
import LogoutIcon from '@mui/icons-material/Logout';
import SchoolIcon from '@mui/icons-material/School';

const AppHeader = ({ user, onLogout }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleMenuClose = () => {
    setAnchorEl(null);
  };
  
  const handleNavigation = (path) => {
    navigate(path);
    handleMenuClose();
  };

  const handleLogout = () => {
    handleMenuClose();
    onLogout();
  };

  return (
    <AppBar position="static" color="primary" sx={{ mb: 2 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component="div" 
          sx={{ 
            flexGrow: 1, 
            fontWeight: 'bold',
            cursor: 'pointer' 
          }}
          onClick={() => navigate('/units')}
        >
          算数チャレンジ
        </Typography>
        
        {user && (
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box sx={{ mr: 2, display: { xs: 'none', sm: 'block' } }}>
              <Chip 
                label={`${user.grade}年生`}
                color="secondary"
                size="small"
                sx={{ fontWeight: 'bold' }}
              />
            </Box>
            
            <Box sx={{ display: { xs: 'none', sm: 'flex' } }}>
              <Button 
                color="inherit" 
                startIcon={<HomeIcon />}
                onClick={() => navigate('/units')}
              >
                単元一覧
              </Button>
              
              <Button 
                color="inherit" 
                startIcon={<SchoolIcon />}
                onClick={() => navigate('/prepare')}
              >
                準備
              </Button>
              
              <Button 
                color="inherit" 
                startIcon={<HistoryIcon />}
                onClick={() => navigate('/history')}
              >
                履歴
              </Button>
            </Box>
            
            <Box sx={{ display: { xs: 'block', sm: 'none' } }}>
              <Tooltip title="メニュー">
                <IconButton
                  color="inherit"
                  onClick={handleMenuClick}
                  size="large"
                  edge="end"
                >
                  <MenuIcon />
                </IconButton>
              </Tooltip>
              
              <Menu
                anchorEl={anchorEl}
                open={open}
                onClose={handleMenuClose}
                MenuListProps={{
                  'aria-labelledby': 'menu-button',
                }}
              >
                <MenuItem onClick={() => handleNavigation('/units')}>
                  <ListItemIcon>
                    <HomeIcon fontSize="small" />
                  </ListItemIcon>
                  単元一覧
                </MenuItem>
                
                <MenuItem onClick={() => handleNavigation('/prepare')}>
                  <ListItemIcon>
                    <SchoolIcon fontSize="small" />
                  </ListItemIcon>
                  勉強の準備
                </MenuItem>
                
                <MenuItem onClick={() => handleNavigation('/history')}>
                  <ListItemIcon>
                    <HistoryIcon fontSize="small" />
                  </ListItemIcon>
                  回答履歴
                </MenuItem>
                
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  ログアウト
                </MenuItem>
              </Menu>
            </Box>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default AppHeader;
