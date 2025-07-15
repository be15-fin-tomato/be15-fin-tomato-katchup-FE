import axios from 'axios';
import api from '@/plugin/axios.js';
import qs from 'qs';

export const fetchAICampaigns = async () => {
    const res = await axios.get('/api/v1/ai/campaigns');
    return res.data.data;
};

export const fetchListupDetail = async (id) => {
    return await api.get(`/campaign/listup/${id}`);
};

export const fetchCampaignList = async (params) => {
    // 빈 문자열 또는 null/undefined인 파라미터 제거
    const cleanedParams = Object.fromEntries(
        Object.entries(params).filter(([_, value]) => {
            if (Array.isArray(value)) return value.length > 0;
            return value !== null && value !== undefined && value !== '';
        }),
    );

    return api.get('/campaign/ai/search', {
        params: cleanedParams,
        paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' }); // tags=1&tags=2
        },
    });
};

export const fetchRecommendInfluencerList = async (campaignId, filters) => {
    return await api.get(`/campaign/ai/recommend`, {
        params: {
            campaignId,
            ...filters,
        },
    });
};
