import api from '@/plugin/axios.js';

/* 인플루언서 카테고리 목록 조회 */
export const fetchCategoryList = () =>
  api.get('/influencer/category');

/* 인플루언서 목록 조회 */
export const fetchInfluencerList = (params = {}) =>
  api.get('/influencer', { params });

/* 인플루언서 유튜브 연동 */
export const requestYoutubeAuthUrl = async (influencerId) => {
  try {
    const response = await api.get(`/oauth2/youtube/auth-url/${influencerId}`)
    return response.data.data;
  } catch (error) {
    console.error('Failed to get Youtube auth URL:', error);
    throw error;
  }
}

/* 인플루언서 유튜브 연동 해제 */
export const disconnectYoutube = async (influencerId) => {
  try {
    const response = await api.delete(`/oauth2/youtube/${influencerId}/disconnect`);
    return response.data.data;
  } catch (error) {
    console.error('유튜브 연동 해제 실패 :', error);
    throw error;
  }
}

/* 인플루언서 인스타그램 연동 */
export const requestInstagramAuthUrl = async (influencerId) => {
  try {
    const response = await api.get(`/oauth2/instagram/auth-url/${influencerId}`)
    return response.data.data;
  } catch (error) {
    console.error('Failed to get Instagram auth URL:', error);
    throw error;
  }
}

/* 인플루언서 인스타그램 연동 해제 */
export const disconnectInstagram = async (influencerId) => {
  try {
    const response = await api.delete(`/oauth2/instagram/${influencerId}/disconnect`);
    return response.data.data;
  } catch (error) {
    console.error('유튜브 연동 해제 실패 :', error);
    throw error;
  }
}
