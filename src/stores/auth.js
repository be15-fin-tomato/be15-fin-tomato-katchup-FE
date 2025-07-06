import { ref, computed } from 'vue';
import { defineStore } from 'pinia';
import { jwtDecode } from 'jwt-decode';
export const useAuthStore = defineStore('auth', () => {
    const accessToken = ref(null);
    const userId = ref(null);
    const userName = ref(null);
    const expirationTime = ref(null);

    const isAuthenticated = computed(() => {
        console.log('엑세스토큰 : ', accessToken.value);
        return !!accessToken.value && Date.now() < (expirationTime.value || 0);
    });

    function setAccessToken(token) {
        accessToken.value = token;
        try {
            const payload = jwtDecode(token);
            userId.value = payload.userId;
            userName.value = payload.name;
            console.log(userName.value);
            expirationTime.value = payload.exp * 1000;
        } catch (e) {
            console.log('엑세스 토큰 파싱 에러', e);
            accessToken.value = null;
            userId.value = null;
            expirationTime.value = null;
        }
    }

    function clearAccessToken() {
        accessToken.value = null;
        userId.value = null;
        expirationTime.value = null;
    }

    function logout() {
        clearAccessToken();
        router.push({ name: 'login' });
    }

    return {
        userId,
        userName,
        expirationTime,
        accessToken,
        isAuthenticated,
        setAccessToken,
        clearAccessToken,
        logout,
    };
});
