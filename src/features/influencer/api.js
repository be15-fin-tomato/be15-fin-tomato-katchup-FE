import api from '@/plugin/axios.js';

/* 인플루언서 카테고리 목록 조회 */
export const fetchCategoryList = () =>
  api.get('/influencer/category');

/* 인플루언서 목록 조회 */
export const fetchInfluencerList = (params = {}) =>
  api.get('/influencer', { params });
