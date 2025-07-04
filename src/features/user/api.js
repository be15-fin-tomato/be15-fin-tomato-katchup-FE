import axios from 'axios';
import api from '@/plugin/axios.js';

export const getMockInfluencers = async () => {
    const response = await axios.get('/api/v1/influencer');
    return response;
};

export const connectYoutube = async () => {
    return await api.get('/oauth2/authorize/youtube');
};

export const postToken = async (code) => {
    return await api.post('/oauth2/youtube/code', { code: code });
};

/* 로그인 */
export const login = async (data) => {
    return await api.post('/auth/login', data);
};

/* 로그아웃 */
export const logout = async () => {
    return api.post('/auth/logout');
};

/* AccessToken 재발급 */
export const refreshToken = async () => {
    return api.post('/auth/reissue');
};

/* 비밀번호 찾기 */
export const findPassword = (loginId, email) => {
  return api.get('/auth/find/password', {
    params: {
      loginId,
      email,
    },
  });
};

/* FCM 토큰 등록 */
export const registerFcmToken = (token) => {
  return api.post('/fcm/token', {
    fcmToken: token,
  });
};
