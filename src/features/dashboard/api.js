import api from '@/plugin/axios.js';

/* 성과 리스트 조회 */
export const getCampaignResultList = async (params = {}) => {
  const response = await api.get('/campaign/resultlist', {
    params: params,
  });
  return response.data.data;
};

/* 인플루언서 개별 조회 */
export const fetchInfluencerDetail = async (influencerId) => {
  const res = await api.get(`/influencer/${influencerId}`)
  return res.data.data
}

/* 인플루언서 평균 만족도 조회 */
export const fetchSatisfaction = async (influencerId) => {
  return await api.get(`/satisfaction/average/${influencerId}`);
}

/* 인플루언서 유튜브 기본 정보 조회 */
export const fetchYoutubeInfo = async (influencerId) => {
  return await api.get('/oauth2/youtube/channel-info', {
    params: { influencerId },
  });
}

/* 인플루언서 유튜브 인기 동영상 조회 */
export const fetchTopVideos = async (influencerId) => {
  return await api.get(`/oauth2/youtube/top-videos`, {
    params: { influencerId },
  });
}

/* 인플루언서 진행 완료 캠페인 조회 */
export const fetchCampaignListByInfluencer = async (influencerId) => {
  return await api.get(`/dashboard/campaign/${influencerId}`);
}

/* 인스타그램 계정 정보 조회 (인기 게시물 포함) */
export const fetchInstagramInfo = async (influencerId) => {
  return await api.get(`/oauth2/instagram/account-info`, {
    params: { influencerId },
  });
}

/* 유튜브 댓글 요약 */
export const fetchAiCommentSummary = async (pipelineInfluencerId) => {
  try {
    const response = await api.get(`/youtube/commentssummary/${pipelineInfluencerId}`);

    if (response.data && response.data.success) {
      return response.data.data;
    } else {
      const errorMessage = response.data?.message || 'Failed to fetch AI comment summary: Unexpected response structure.';
      throw new Error(errorMessage);
    }
  } catch (error) {
    console.error('Error fetching AI comment summary:', error);
    throw error;
  }
};

/* 네이버 검색 비율 */
export async function fetchNaverSearchRatio(pipelineInfluencerId) {
  try {
    const response = await api.get(`/dashboard/search-ratio/pipeline-influencer/${pipelineInfluencerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Naver search ratio:', error);
    throw error;
  }
}

/* 수익 요약 조회 */
export const getCampaignRevenue = async (pipelineInfluencerId) => {
  try {
    const response = await api.get(`/dashboard/get/revenue/${pipelineInfluencerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching campaign revenue:', error);
    throw error;
  }
}

/* 컨텐츠 정보 조회 */
export const fetchCampaignContent = async (pipelineInfluencerId) => {
  const response = await api.get(`/dashboard/content/${pipelineInfluencerId}`);
  return response.data.data;
}

