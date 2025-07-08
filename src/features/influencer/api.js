import api from '@/plugin/axios.js';

/* 인플루언서 카테고리 목록 조회 */
export const fetchCategoryList = () =>
  api.get('/influencer/category');

/* 인플루언서 목록 조회 */
export const fetchInfluencerList = () =>
  api.get('/influencer');

/* 인플루언서 유튜브 연동 */
export const requestYoutubeAuthUrl = async (influencerId) => {
  try {
    const response = await api.get('/oauth2/youtube/auth-url', {
      params: {
        influencerId: influencerId
      }
    });
    return response.data.authUrl;
  } catch (error) {
    console.error('Failed to get Youtube auth URL:', error);
    throw error;
  }
};
