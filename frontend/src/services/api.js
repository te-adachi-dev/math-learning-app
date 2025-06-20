import axios from 'axios';

// ãã¹ãIPãç°å¢å¤æ°ããåå¾ããæªè¨­å®ãªã0.0.0.0ãããã©ã«ãã¨ãã
const HOST_IP = process.env.REACT_APP_HOST_IP || '0.0.0.0';
const API_URL = process.env.REACT_APP_API_URL || `http://${HOST_IP}:3001/api`;

console.log('API URL:', API_URL); // APIã®URLãã­ã°åºå

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ãªã¯ã¨ã¹ãæã®ã¤ã³ã¿ã¼ã»ãã¿ã¼
api.interceptors.request.use(
  config => {
    console.log(`APIãªã¯ã¨ã¹ã: ${config.method.toUpperCase()} ${config.url}`, config);
    return config;
  },
  error => {
    console.error('APIãªã¯ã¨ã¹ãã¨ã©ã¼:', error);
    return Promise.reject(error);
  }
);

// ã¬ã¹ãã³ã¹æã®ã¤ã³ã¿ã¼ã»ãã¿ã¼
api.interceptors.response.use(
  response => {
    console.log(`APIã¬ã¹ãã³ã¹: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  error => {
    console.error('APIã¬ã¹ãã³ã¹ã¨ã©ã¼:', error);
    if (error.response) {
      console.error('ã¬ã¹ãã³ã¹ãã¼ã¿:', error.response.data);
      console.error('ã¬ã¹ãã³ã¹ã¹ãã¼ã¿ã¹:', error.response.status);
      console.error('ã¬ã¹ãã³ã¹ãããã¼:', error.response.headers);
    } else if (error.request) {
      console.error('ãªã¯ã¨ã¹ããã¼ã¿:', error.request);
    } else {
      console.error('ã¨ã©ã¼ã¡ãã»ã¼ã¸:', error.message);
    }
    return Promise.reject(error);
  }
);

// èªè¨¼é¢é£ã®API
export const authAPI = {
  // ã¦ã¼ã¶ã¼ç»é²
  register: async (birthYear, grade) => {
    try {
      console.log('ã¦ã¼ã¶ã¼ç»é²ãªã¯ã¨ã¹ã:', { birthYear, grade });
      const response = await api.post('/auth/register', { birthYear, grade });
      console.log('ã¦ã¼ã¶ã¼ç»é²æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('ã¦ã¼ã¶ã¼ç»é²ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // ã¦ã¼ã¶ã¼æå ±åå¾
  getUser: async (userId) => {
    try {
      console.log('ã¦ã¼ã¶ã¼æå ±åå¾ãªã¯ã¨ã¹ã:', { userId });
      const response = await api.get(`/auth/user/${userId}`);
      console.log('ã¦ã¼ã¶ã¼æå ±åå¾æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('ã¦ã¼ã¶ã¼æå ±åå¾ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // å­¦å¹´æ´æ°
  updateGrade: async (userId, grade) => {
    try {
      console.log('å­¦å¹´æ´æ°ãªã¯ã¨ã¹ã:', { userId, grade });
      const response = await api.put(`/auth/user/${userId}/grade`, { grade });
      console.log('å­¦å¹´æ´æ°æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('å­¦å¹´æ´æ°ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  }
};

// ååé¢é£ã®API
export const unitsAPI = {
  // å¨ååãåå¾
  getAll: async () => {
    try {
      console.log('å¨åååå¾ãªã¯ã¨ã¹ã');
      const response = await api.get('/units');
      console.log('å¨åååå¾æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('å¨åååå¾ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // ç¹å®ã®ååãåå¾
  getUnit: async (unitId) => {
    try {
      console.log('åååå¾ãªã¯ã¨ã¹ã:', { unitId });
      const response = await api.get(`/units/${unitId}`);
      console.log('åååå¾æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('åååå¾ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // ç¹å®ã®å­¦å¹´ã®ååãåå¾
  getByGrade: async (grade) => {
    try {
      console.log('å­¦å¹´å¥åååå¾ãªã¯ã¨ã¹ã:', { grade });
      const response = await api.get(`/units/grade/${grade}`);
      console.log('å­¦å¹´å¥åååå¾æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('å­¦å¹´å¥åååå¾ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // ã¦ã¼ã¶ã¼ã®å¨ååã®çè§£åº¦ãåå¾
  getComprehensionLevels: async (userId) => {
    try {
      console.log('çè§£åº¦åå¾ãªã¯ã¨ã¹ã:', { userId });
      const response = await api.get(`/units/user/${userId}/comprehension`);
      console.log('çè§£åº¦åå¾æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('çè§£åº¦åå¾ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // ååã®åé¡å±¥æ­´ãåå¾
  getUnitHistory: async (unitId, userId) => {
    try {
      console.log('ååå±¥æ­´åå¾ãªã¯ã¨ã¹ã:', { unitId, userId });
      const response = await api.get(`/units/${unitId}/history/${userId}`);
      console.log('ååå±¥æ­´åå¾æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('ååå±¥æ­´åå¾ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  }
};

// åé¡é¢é£ã®API
export const problemsAPI = {
  // åé¡ãçæ
  generateProblem: async (unitId, userId, isAdvanced = false) => {
    try {
      console.log('åé¡çæãªã¯ã¨ã¹ã:', { unitId, userId, isAdvanced });
      const response = await api.get(`/problems/generate/${unitId}`, {
        params: { userId, advanced: isAdvanced }
      });
      console.log('åé¡çææå:', response.data);
      return response.data;
    } catch (error) {
      console.error('åé¡çæã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // åç­ãè©ä¾¡ï¼SVGå¯¾å¿çï¼
  evaluateAnswer: async (userId, unitId, problem, userAnswer, correctAnswer, isAdvanced, svgData = null) => {
    try {
      console.log('åç­è©ä¾¡ãªã¯ã¨ã¹ã:', { userId, unitId, problem, userAnswer, isAdvanced, svgData: svgData ? 'ãã' : 'ãªã' });
      const response = await api.post('/problems/evaluate', {
        userId,
        unitId,
        problem,
        userAnswer,
        correctAnswer,
        isAdvanced,
        svgData  // SVGãã¼ã¿ãå«ãã
      });
      console.log('åç­è©ä¾¡æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('åç­è©ä¾¡ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // ãã£ããã¡ãã»ã¼ã¸ã«å¿ç­
  sendChatMessage: async (userId, message, unitId = null) => {
    try {
      console.log('ãã£ããã¡ãã»ã¼ã¸éä¿¡:', { userId, message, unitId });
      const response = await api.post('/problems/chat', {
        userId,
        message,
        unitId
      });
      console.log('ãã£ããã¬ã¹ãã³ã¹æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('ãã£ããã¡ãã»ã¼ã¸ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  },
  
  // åé¡å±¥æ­´ãåå¾
  getHistory: async (userId, unitId = null, limit = 10) => {
    try {
      console.log('å±¥æ­´åå¾ãªã¯ã¨ã¹ã:', { userId, unitId, limit });
      const params = { limit };
      if (unitId) params.unitId = unitId;
      
      const response = await api.get(`/problems/history/${userId}`, { params });
      console.log('å±¥æ­´åå¾æå:', response.data);
      return response.data;
    } catch (error) {
      console.error('å±¥æ­´åå¾ã¨ã©ã¼:', error);
      throw error.response?.data || { message: 'ãµã¼ãã¼ã«æ¥ç¶ã§ãã¾ããã§ãã' };
    }
  }
};

const apiService = {
  auth: authAPI,
  units: unitsAPI,
  problems: problemsAPI
};

export default apiService;
