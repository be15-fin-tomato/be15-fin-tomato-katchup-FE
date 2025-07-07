import api from '@/plugin/axios.js';
import qs from 'qs';

// 고객사 목록 조회 API (필터링, 페이징 포함)
export const getClientCompanyList = async (page, size, filters = {}) => {
  return await api.get('/client-companies', {
    params: { page, size, ...filters },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: 'repeat' }),
  });
};

// 고객사 등록 API
export const createClientCompany = async (data) => {
  return await api.post('/client-companies', data);
};
