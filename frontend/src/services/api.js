import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 認証関連のAPI
export const authAPI = {
  // ユーザー登録
  register: async (birthYear, grade) => {
    try {
      const response = await api.post('/auth/register', { birthYear, grade });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // ユーザー情報取得
  getUser: async (userId) => {
    try {
      const response = await api.get(`/auth/user/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 学年更新
  updateGrade: async (userId, grade) => {
    try {
      const response = await api.put(`/auth/user/${userId}/grade`, { grade });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  }
};

// 単元関連のAPI
export const unitsAPI = {
  // 全単元を取得
  getAll: async () => {
    try {
      const response = await api.get('/units');
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 特定の単元を取得
  getUnit: async (unitId) => {
    try {
      const response = await api.get(`/units/${unitId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 特定の学年の単元を取得
  getByGrade: async (grade) => {
    try {
      const response = await api.get(`/units/grade/${grade}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // ユーザーの全単元の理解度を取得
  getComprehensionLevels: async (userId) => {
    try {
      const response = await api.get(`/units/user/${userId}/comprehension`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 単元の問題履歴を取得
  getUnitHistory: async (unitId, userId) => {
    try {
      const response = await api.get(`/units/${unitId}/history/${userId}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  }
};

// 問題関連のAPI
export const problemsAPI = {
  // 問題を生成
  generateProblem: async (unitId, userId, isAdvanced = false) => {
    try {
      const response = await api.get(`/problems/generate/${unitId}`, {
        params: { userId, advanced: isAdvanced }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 回答を評価
  evaluateAnswer: async (userId, unitId, problem, userAnswer, correctAnswer, isAdvanced) => {
    try {
      const response = await api.post('/problems/evaluate', {
        userId,
        unitId,
        problem,
        userAnswer,
        correctAnswer,
        isAdvanced
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // チャットメッセージに応答
  sendChatMessage: async (userId, message, unitId = null) => {
    try {
      const response = await api.post('/problems/chat', {
        userId,
        message,
        unitId
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 問題履歴を取得
  getHistory: async (userId, unitId = null, limit = 10) => {
    try {
      const params = { limit };
      if (unitId) params.unitId = unitId;
      
      const response = await api.get(`/problems/history/${userId}`, { params });
      return response.data;
    } catch (error) {
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  }
};

export default {
  auth: authAPI,
  units: unitsAPI,
  problems: problemsAPI
};