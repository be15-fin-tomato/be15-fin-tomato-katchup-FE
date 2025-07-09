import api from '@/plugin/axios.js';

export const getCampaignResultList = async (params = {}) => {
  const response = await api.get('/campaign/resultlist', {
    params: params,
  });
  return response.data.data;
};
