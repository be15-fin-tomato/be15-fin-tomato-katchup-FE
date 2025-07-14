import { useAuthStore } from '@/stores/auth';
import axios from 'axios';
import { refreshToken } from '@/features/user/api.js';
import qs from 'qs';

const api = axios.create({
    baseURL:
        import.meta.env.MODE === 'development'
            ? import.meta.env.VITE_API_BASE_URL
            : 'https://api.tomato-katchup.xyz/api/v1',
    withCredentials: true,
    paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
});

/* 헤더에 AccessToken을 자동으로 붙이는 interceptor*/
api.interceptors.request.use((config) => {
    const authStore = useAuthStore();

    const skipAuthHeaderUrls = ['/auth/login', '/auth/reissue'];

    const shouldSkip = skipAuthHeaderUrls.some((url) => config.url?.includes(url));

    if (authStore.accessToken && !shouldSkip) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }

    return config;
});
/* 만료된 Access Token으로 요청을 한 경우 토큰 재발급 요청 */
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            const errorCode = error.response.data?.errorCode;
            const originalRequest = error.config;
            const authStore = useAuthStore();

            // 엑세스 토큰 만료 에러 코드 11004
            if (errorCode === '11004' && !originalRequest._retry) {
                originalRequest._retry = true;

                try {
                    const response = await refreshToken();
                    const newToken = response.data.data.accessToken;

                    authStore.setAccessToken(newToken);
                    originalRequest.headers.Authorization = `Bearer ${newToken}`;
                    return api(originalRequest);
                } catch (e) {
                    authStore.clearAccessToken();
                    window.location.href = '/login';
                    return Promise.reject(e);
                }
            }
        }

        return Promise.reject(error);
    },
);
export default api;
