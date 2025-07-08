import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const api = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL,
    baseURL: 'https://3.35.216.224:8080/api/v1',
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const authStore = useAuthStore();
    if (authStore.accessToken) {
        config.headers.Authorization = `Bearer ${authStore.accessToken}`;
    }
    return config;
});

export default api;
