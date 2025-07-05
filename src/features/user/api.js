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

/* 로그인 */
export const login = async (data) => {
    return await api.post('/auth/login', data);
};

/* 로그아웃 */
export const logout = async () => {
    return api.post('/auth/logout');
};

/* AccessToken 재발급 */
export const refreshToken = async () => {
    return api.post('/auth/reissue');
};

/* 비밀번호 찾기 */
export const findPassword = (loginId, email) => {
  return api.get('/auth/find/password', {
    params: {
      loginId,
      email,
    },
  });
};

/* FCM 토큰 등록 */
export const registerFcmToken = (token) => {
  return api.post('/fcm/token', {
    fcmToken: token,
  });
};

/* 알림 조회 */
export const fetchAllNotifications = async () => {
  const res = await api.get('/notification/all');
  const rawList = res.data.data.notifications;

  return rawList.map((n) => ({
    id: n.notificationId,
    content: n.notificationContent,
    typeId: n.notificationTypeId,
    targetId: n.targetId,
    isRead: n.isRead === 'Y',
    createdAt: n.getTime
  }));
};


/* 안읽은 수 조회 */
export const fetchUnreadNotificationCount = async () => {
  const res = await api.get('/notification/unread-count');
  return res.data.data;
};

/* 알림 읽기 */
export const markNotificationAsRead = async (notificationId) => {
  await api.patch(`/notification/read/${notificationId}`);
};

/* 알림 삭제 */
export const deleteNotification = async (notificationId) => {
  await api.delete(`/notification/${notificationId}`);
};

/* 전체 삭제 */
export const deleteAllNotifications = async () => {
  await api.delete('/notification/all');
};


/* 알림 SSE 구독 */
export const subscribeNotificationSse = ({ onMessage, onConnect, onError }) => {
  const eventSource = new EventSource(`${import.meta.env.VITE_API_BASE_URL}/sse/subscribe`, {
    withCredentials: true
  });

  eventSource.onopen = (event) => {
    console.log('✅ SSE 연결됨:', event);
    if (typeof onConnect === 'function') onConnect(event);
  };

  eventSource.addEventListener('new-notification', (event) => {
    try {
      const data = JSON.parse(event.data);
      console.log('📨 새 알림 수신:', data);
      if (typeof onMessage === 'function') onMessage(data);
    } catch (e) {
      console.error('❌ 알림 파싱 실패:', e);
    }
  });

  eventSource.addEventListener('connect', (event) => {
    if (typeof onConnect === 'function') onConnect(event.data);
  });

  eventSource.onerror = (error) => {
    console.error('🚨 SSE 오류:', error);
    eventSource.close();
    if (typeof onError === 'function') onError(error);
  };

  return eventSource;
};


