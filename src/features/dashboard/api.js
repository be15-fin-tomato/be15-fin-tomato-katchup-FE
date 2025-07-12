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

export async function fetchNaverSearchRatio(pipelineInfluencerId) {
  try {
    const response = await api.get(`/dashboard/search-ratio/pipeline-influencer/${pipelineInfluencerId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching Naver search ratio:', error);
    throw error;
  }
}

export const getCampaignRevenue = async (pipelineInfluencerId) => {
  try {
    const response = await api.get(`/dashboard/get/revenue/${pipelineInfluencerId}`);
    return response.data; // ApiResponse 객체 전체를 반환 (success, data, errorCode, message 포함)
  } catch (error) {
    console.error('Error fetching campaign revenue:', error);
    // 에러 처리 로직 (예: 에러 메시지 반환 또는 특정 에러 객체 throw)
    throw error;
  }
};


