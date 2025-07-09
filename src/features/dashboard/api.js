import api from '@/plugin/axios.js';

export const getCampaignResultList = async (page, size, filters = {}) => {
    return await api.get('/campaign/dashboard', {
        params: { page, size, ...filters },
    });
};

// 인플루언서 개별 조회
export const fetchInfluencerDetail = async (influencerId) => {
  const res = await api.get(`/influencer/${influencerId}`)
  return res.data.data
}

// 인플루언서 유튜브 기본 정보 조회
export const fetchYoutubeInfo = async (influencerId) => {
  return await api.get('/oauth2/youtube/channel-info', {
    params: { influencerId },
  });
}




