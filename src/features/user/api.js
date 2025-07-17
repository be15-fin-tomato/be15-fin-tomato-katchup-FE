import api from '@/plugin/axios.js';
import qs from 'qs';
import { EventSourcePolyfill } from 'event-source-polyfill';

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
export const subscribeNotificationSse = ({ onMessage, onConnect }) => {
  const baseURL =
    import.meta.env.MODE === 'development'
      ? import.meta.env.VITE_API_BASE_URL
      : 'https://api.tomato-katchup.xyz/api/v1';

  const eventSource = new EventSourcePolyfill(`${baseURL}/sse/subscribe`, {
    withCredentials: true,
  });

  eventSource.onopen = (event) => {
    if (typeof onConnect === 'function') onConnect(event);
  };

  eventSource.addEventListener('connect', (event) => {
    if (typeof onConnect === 'function') onConnect(event.data);
  });

  eventSource.addEventListener('new-notification', (event) => {
    try {
      const data = JSON.parse(event.data);
      if (typeof onMessage === 'function') onMessage(data);
    } catch (e) {
      console.error('알림 파싱 실패:', e, event.data);
    }
  });

  return eventSource;
};

/* 만족도 조사 페이지 목록 조회 */
export const fetchSatisfactionList = (params) => {
  return api.get('/satisfaction/list', { params });
};

/* 만족도 조사 요청하기 */
export const sendSatisfactionRequest = (satisfactionId) => {
  return api.post(`/satisfaction/send/${satisfactionId}`);
};

/* 만족도 결과 조회하기 */
export const fetchSatisfactionScore = (satisfactionId) =>
  api.get(`/satisfaction/list/score/${satisfactionId}`);

/* 만족도 총점 db에 저장하기 */
export const saveSatisfactionResult = (satisfactionId) =>
  api.post(`/satisfaction/save/${satisfactionId}`);

/* 전체 만족도 조사 응답률 */
export const fetchSatisfactionResponseRate = () => {
  return api.get('/satisfaction/response');
};

/* 전체 만족도 평균 점수 */
export const fetchSatisfactionAverage = () => {
  return api.get('/satisfaction/average');
};

export const getInfluencers = async (params) => {
  const response = await api.get('/influencer', {
    params,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
  });
  return response.data;
};

/* 인플루언서 등록 */
export const registerInfluencer = async (influencerData) => {
  const response = await api.post('/influencer/regist', influencerData);
  return response.data;
};

/* 인플루언서 수정*/
export const updateInfluencer = async (params) => {
  const { influencerId, ...requestDTO } = params;
  try {
    const response = await api.patch(`/influencer/${influencerId}`, requestDTO);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteInfluencerApi = async (params) => {
  const { influencerId, ...requestDTO } = params;
  try {
    const response = await api.delete(`/influencer/delete/${influencerId}`, { data: requestDTO });
    return response.data;
  } catch (error) {
    throw error;
  }
};
