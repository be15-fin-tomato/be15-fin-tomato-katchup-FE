import api from '@/plugin/axios.js';

export const getCampaignResultList = async (params = {}) => {
  const response = await api.get('/campaign/resultlist', {
    params: params,
  });
  return response.data.data;
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

// 인플루언서 평균 만족도 조회
export const fetchSatisfaction = async (influencerId) => {
  return await api.get(`/satisfaction/average/${influencerId}`);
}

// 인플루언서 인기 동영상 조회
export const fetchTopVideos = async (influencerId) => {
  return await api.get(`/oauth2/youtube/top-videos`, {
    params: { influencerId },
  });
}

// 인플루언서 진행 완료 캠페인 조회
export const fetchCampaignListByInfluencer = async (influencerId) => {
  return await api.get(`/dashboard/campaign/${influencerId}`);
}

