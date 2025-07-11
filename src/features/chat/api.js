import api from '@/plugin/axios.js';

/* 채팅방 목록 */
export const fetchChatRoomList = async (keyword = '') => {
  const response = await api.get('/chats/list', {
    params: keyword ? { keyword } : {},
  })
  return response.data.data
};

/* 채팅방 들어간 상황 */
export const fetchChatRoomDetail = async (chatId) => {
  const response = await api.get(`/chats/${chatId}`)
  return response.data.data
};

/* 초대 기능 */
export const inviteChatMembers = async (chatRoomId, invitedUserIds) => {
  const response = await api.post(`/chat/${chatRoomId}/invite`, {
    invitedUserIds
  })
  return response.data
};

/* 초대가능한 사람 불러오기 */
export const searchUser = async (keyword) => {
  const response = await api.get('/user/search', { params: { keyword } })
  return response.data.data
};

/* 채팅방 나가기 */
export const exitChatRoom = async (chatId, userId) => {
  try {
    const response = await api.patch('/chat/exit', { chatId, userId });
    return response.data.data;
  } catch (error) {
    console.error('채팅방 나가기 API 호출 실패:', error);
    throw error;
  }
};

/* 채팅방 생성 */
export const createChatRoom = async (chatName, userIds) => {
  try {
    const response = await api.post('/chat/create', {
      chatName,
      userIds,
    });
    return response.data.data;
  } catch (error) {
    console.error('채팅방 생성 API 호출 실패:', error);
    throw error;
  }
};
