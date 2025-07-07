import api from '@/plugin/axios.js';

export const fetchCategoryList = () =>
  api.get('/influencer/category');
export const fetchInfluencerList = () =>
  api.get('/influencer');
