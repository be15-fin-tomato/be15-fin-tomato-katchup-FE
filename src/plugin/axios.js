import { useAuthStore } from '@/stores/auth';
import axios from 'axios';

const api = axios.create({
    // baseURL: import.meta.env.VITE_API_BASE_URL,
    baseURL: 'http://13.125.4.11:8080/api/v1',
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
