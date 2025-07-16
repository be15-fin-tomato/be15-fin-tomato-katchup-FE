import api from '@/plugin/axios.js';

/* 성과 리스트 조회 */
export const getCampaignResultList = async (params = {}) => {
  try {
    const response = await api.get('/campaign/resultlist', {
      params: params,
    });

    if (response.data && response.data.success) {
      if (response.data.data && Array.isArray(response.data.data.data) && typeof response.data.data.total === 'number') {
        return {
          campaignList: response.data.data.data,
          pagination: {
            currentPage: params.page || 1,
            size: params.size || 10,
            totalCount: response.data.data.total, // 전체 개수
            totalPage: Math.ceil(response.data.data.total / (params.size || 10))
          }
        };
      } else {
        console.error('API 응답 구조 오류 (내부 data):', response.data);
        throw new Error(errorMessage);
      }
    } else {
      const errorMessage = response.data?.message || 'API 응답이 성공적이지 않거나 최상위 data 필드가 없습니다.';
      console.error('API 응답 실패:', response.data);
      throw new Error(errorMessage);
    }
  } catch (error) {
    return {
      campaignList: [],
      pagination: {
        currentPage: params.page || 1,
        size: params.size || 10,
        totalCount: 0,
        totalPage: 0
      }
    };
  }
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

/* 유입 분석 조회 */
export const fetchCampaignTraffic = async (pipelineInfluencerId) => {
  try {
    const response = await api.get(`/dashboard/traffic/${pipelineInfluencerId}`);

    if (response.data.success) {
      return response.data.data.map(item => ({
        id: item.trafficId,
        source: item.trafficName,
        views: item.percentage
      }));
    } else {
      throw new Error(response.data.message || '캠페인 트래픽 데이터 조회 실패');
    }
  } catch (error) {
    console.error(`Error fetching campaign traffic for ID ${pipelineInfluencerId}:`, error);
    throw new Error(error.response?.data?.message || '캠페인 트래픽 데이터를 불러오는 중 오류 발생');
  }
};



