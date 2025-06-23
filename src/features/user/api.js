import axios from 'axios';
import api from '@/plugin/axios.js';

export const getMockInfluencers = async () => {
    const response = await axios.get('/api/v1/influencer');
    return response;
};

export const connectYoutube = async () => {
    return await api.get('/oauth2/authorize/youtube');
};

export const postToken = async (code) => {
    return await api.post('/oauth2/youtube/code', { code: code });
};
