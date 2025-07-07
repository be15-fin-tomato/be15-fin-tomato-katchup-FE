import api from '@/plugin/axios.js';
import qs from 'qs';

export const getClientCompanyList = async (page, size, filters = {}) => {
  return await api.get('/client-companies', {
    params: { page, size, ...filters },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: 'repeat' }),
  });
};
