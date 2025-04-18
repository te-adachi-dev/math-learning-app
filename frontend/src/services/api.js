import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001/api';

console.log('API URL:', API_URL); // APIのURLをログ出力

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエスト時のインターセプター
api.interceptors.request.use(
  config => {
    console.log(`APIリクエスト: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  error => {
    console.error('APIリクエストエラー:', error);
    return Promise.reject(error);
  }
);

// レスポンス時のインターセプター
api.interceptors.response.use(
  response => {
    console.log(`APIレスポンス: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  error => {
    console.error('APIレスポンスエラー:', error);
    if (error.response) {
      console.error('レスポンスデータ:', error.response.data);
      console.error('レスポンスステータス:', error.response.status);
      console.error('レスポンスヘッダー:', error.response.headers);
    } else if (error.request) {
      console.error('リクエストデータ:', error.request);
    } else {
      console.error('エラーメッセージ:', error.message);
    }
    return Promise.reject(error);
  }
);

// 認証関連のAPI
export const authAPI = {
  // ユーザー登録
  register: async (birthYear, grade) => {
    try {
      console.log('ユーザー登録リクエスト:', { birthYear, grade });
      const response = await api.post('/auth/register', { birthYear, grade });
      console.log('ユーザー登録成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('ユーザー登録エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // ユーザー情報取得
  getUser: async (userId) => {
    try {
      console.log('ユーザー情報取得リクエスト:', { userId });
      const response = await api.get(`/auth/user/${userId}`);
      console.log('ユーザー情報取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('ユーザー情報取得エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 学年更新
  updateGrade: async (userId, grade) => {
    try {
      console.log('学年更新リクエスト:', { userId, grade });
      const response = await api.put(`/auth/user/${userId}/grade`, { grade });
      console.log('学年更新成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('学年更新エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  }
};

// 単元関連のAPI
export const unitsAPI = {
  // 全単元を取得
  getAll: async () => {
    try {
      console.log('全単元取得リクエスト');
      const response = await api.get('/units');
      console.log('全単元取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('全単元取得エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 特定の単元を取得
  getUnit: async (unitId) => {
    try {
      console.log('単元取得リクエスト:', { unitId });
      const response = await api.get(`/units/${unitId}`);
      console.log('単元取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('単元取得エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 特定の学年の単元を取得
  getByGrade: async (grade) => {
    try {
      console.log('学年別単元取得リクエスト:', { grade });
      const response = await api.get(`/units/grade/${grade}`);
      console.log('学年別単元取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('学年別単元取得エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // ユーザーの全単元の理解度を取得
  getComprehensionLevels: async (userId) => {
    try {
      console.log('理解度取得リクエスト:', { userId });
      const response = await api.get(`/units/user/${userId}/comprehension`);
      console.log('理解度取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('理解度取得エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 単元の問題履歴を取得
  getUnitHistory: async (unitId, userId) => {
    try {
      console.log('単元履歴取得リクエスト:', { unitId, userId });
      const response = await api.get(`/units/${unitId}/history/${userId}`);
      console.log('単元履歴取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('単元履歴取得エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  }
};

// 問題関連のAPI
export const problemsAPI = {
  // 問題を生成
  generateProblem: async (unitId, userId, isAdvanced = false) => {
    try {
      console.log('問題生成リクエスト:', { unitId, userId, isAdvanced });
      const response = await api.get(`/problems/generate/${unitId}`, {
        params: { userId, advanced: isAdvanced }
      });
      console.log('問題生成成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('問題生成エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 回答を評価
  evaluateAnswer: async (userId, unitId, problem, userAnswer, correctAnswer, isAdvanced) => {
    try {
      console.log('回答評価リクエスト:', { userId, unitId, problem, userAnswer, isAdvanced });
      const response = await api.post('/problems/evaluate', {
        userId,
        unitId,
        problem,
        userAnswer,
        correctAnswer,
        isAdvanced
      });
      console.log('回答評価成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('回答評価エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // チャットメッセージに応答
  sendChatMessage: async (userId, message, unitId = null) => {
    try {
      console.log('チャットメッセージ送信:', { userId, message, unitId });
      const response = await api.post('/problems/chat', {
        userId,
        message,
        unitId
      });
      console.log('チャットレスポンス成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('チャットメッセージエラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  },
  
  // 問題履歴を取得
  getHistory: async (userId, unitId = null, limit = 10) => {
    try {
      console.log('履歴取得リクエスト:', { userId, unitId, limit });
      const params = { limit };
      if (unitId) params.unitId = unitId;
      
      const response = await api.get(`/problems/history/${userId}`, { params });
      console.log('履歴取得成功:', response.data);
      return response.data;
    } catch (error) {
      console.error('履歴取得エラー:', error);
      throw error.response?.data || { message: 'サーバーに接続できませんでした' };
    }
  }
};

export default {
  auth: authAPI,
  units: unitsAPI,
  problems: problemsAPI
};