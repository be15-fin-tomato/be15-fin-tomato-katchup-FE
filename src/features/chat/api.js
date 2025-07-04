import api from '@/plugin/axios.js';

export const fetchChatRoomList = async (keyword = '') => {
  const response = await api.get('/chats/list', {
    params: keyword ? { keyword } : {},
  })
  return response.data.data
};

export const fetchChatRoomDetail = async (chatId) => {
  const response = await api.get(`/chats/${chatId}`)
  return response.data.data
};
