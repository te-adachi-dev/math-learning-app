import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Button,
  Stepper,
  Step,
  StepLabel,
  Paper,
  Divider,
  Checkbox
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreateIcon from '@mui/icons-material/Create';
import CalculateIcon from '@mui/icons-material/Calculate';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import TimerIcon from '@mui/icons-material/Timer';

const PrepareStudy = () => {
  const navigate = useNavigate();
  const [activeStep, setActiveStep] = useState(0);
  const [checkedItems, setCheckedItems] = useState({
    paper: false,
    pencil: false,
    eraser: false,
    quiet: false
  });

  const handleCheck = (item) => {
    setCheckedItems(prev => ({
      ...prev,
      [item]: !prev[item]
    }));
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleFinish = () => {
    navigate('/units');
  };

  const allChecked = Object.values(checkedItems).every(v => v);

  const steps = [
    '準備するもの',
    '勉強のコツ',
    'さあ、はじめよう！'
  ];

  return (
    <Container maxWidth="md">
      <Box sx={{ my: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/units')}
          sx={{ mb: 2 }}
        >
          単元一覧に戻る
        </Button>

        <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
          勉強の準備をしよう
        </Typography>

        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {activeStep === 0 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                まずは準備するものをチェックしよう！
              </Typography>

              <Paper elevation={0} sx={{ p: 2, bgcolor: '#f5f5f5', borderRadius: 2, mb: 2 }}>
                <List dense>
                  <ListItem>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checkedItems.paper}
                        onChange={() => handleCheck('paper')}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <MenuBookIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="計算用紙（ノートやルーズリーフでもOK）" 
                      secondary="問題を解くときに計算を書くよ"
                    />
                  </ListItem>
                  
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checkedItems.pencil}
                        onChange={() => handleCheck('pencil')}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <CreateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="えんぴつ" 
                      secondary="計算を書くために使うよ"
                    />
                  </ListItem>
                  
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checkedItems.eraser}
                        onChange={() => handleCheck('eraser')}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <CalculateIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="消しゴム" 
                      secondary="まちがえたときに消せるように"
                    />
                  </ListItem>
                  
                  <Divider component="li" />
                  
                  <ListItem>
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={checkedItems.quiet}
                        onChange={() => handleCheck('quiet')}
                        color="primary"
                      />
                    </ListItemIcon>
                    <ListItemIcon>
                      <TimerIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText 
                      primary="静かな場所" 
                      secondary="集中できる環境で勉強しよう"
                    />
                  </ListItem>
                </List>
              </Paper>

              <Typography variant="body2" paragraph color="text.secondary">
                これらを用意したら、「次へ」ボタンを押してね。
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  onClick={handleNext}
                  disabled={!allChecked}
                >
                  次へ
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeStep === 1 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                勉強のコツを覚えよう！
              </Typography>

              <List>
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="15分に集中しよう" 
                    secondary="短い時間でも、集中して取り組むと効果的だよ"
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="必ず紙に書いて計算しよう" 
                    secondary="頭の中だけで考えるより、書くと理解が深まるよ"
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="わからないときは、解説をよく読もう" 
                    secondary="解説を読んで、なぜそうなるのかを考えてみよう"
                  />
                </ListItem>
                
                <Divider component="li" />
                
                <ListItem>
                  <ListItemIcon>
                    <CheckCircleIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText 
                    primary="毎日続けることが大切" 
                    secondary="少しずつでも毎日続けると、どんどん力がつくよ"
                  />
                </ListItem>
              </List>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                <Button onClick={handleBack}>
                  戻る
                </Button>
                <Button
                  variant="contained"
                  onClick={handleNext}
                >
                  次へ
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}

        {activeStep === 2 && (
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom align="center">
                準備OK！さあ、勉強をはじめよう！
              </Typography>

              <Box sx={{ textAlign: 'center', my: 3 }}>
                <img 
                  src="/api/placeholder/200/200" 
                  alt="学習スタート" 
                  style={{ maxWidth: '150px', borderRadius: '50%' }}
                />
              </Box>

              <Typography variant="body1" paragraph align="center">
                単元を選んで、問題にチャレンジしてみよう！
              </Typography>

              <Typography variant="body2" paragraph color="text.secondary" align="center">
                わからないことがあれば、いつでも質問できるよ。
                がんばってね！
              </Typography>

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button onClick={handleBack}>
                  戻る
                </Button>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleFinish}
                >
                  単元一覧へ
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};

export default PrepareStudy;