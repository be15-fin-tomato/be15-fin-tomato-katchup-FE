import axios from 'axios';
import api from '@/plugin/axios.js';
import qs from 'qs';

export const fetchAICampaigns = async () => {
    const res = await axios.get('/api/v1/ai/campaigns');
    return res.data.data;
};

export const fetchListupDetail = async (id) => {
    try {
        const res = await axios.get(`/api/v1/listup/${id}`);
        return res.data.data;
    } catch (error) {
        console.error('리스트업 상세 조회 실패:', error);
        throw error;
    }
};

export const fetchCampaignList = async (params) => {
    return api.get('/campaign/ai/search', {
        params,
        paramsSerializer: (params) => {
            return qs.stringify(params, { arrayFormat: 'repeat' }); // tags=1&tags=2
        },
    });
};
