import api from '@/plugin/axios.js';

export const changePassword = (form) => {
  return api.post('/user/change/password', {
    password: form.current,
    newPassword: form.new,
    confirmNewPassword: form.confirm
  });
};

/* 개인정보 조회 */
export const fetchMyAccount = () => {
  return api.get('/user/me/account');
};

/* 인플루언서 목록 조회 */
export const fetchMyInfluencers = () => {
  return api.get('/user/me/influencer');
};

/* 계정 정보 수정 */
export const updateMyAccount = (formData) => {
  return api.put('/user/change/me', formData);
};

/* 프로필 이미지 수정 */
export const updateMyProfileImage = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/user/change/profile', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/* 헤더에서 내 정보 */
export const fetchHeaderUserInfo = () => {
  return api.get('/user/simple/me');
};
