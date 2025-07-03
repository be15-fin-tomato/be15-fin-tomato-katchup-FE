import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification';
import vDrag from 'v-drag';
import 'vue-toastification/dist/index.css';
import './assets/styles/tailwind.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import { useAuthStore } from './stores/auth';
import { refreshToken } from './features/user/api';

async function bootstrap() {
    const app = createApp(App);

    app.use(createPinia());

    const authStore = useAuthStore();
    console.log('isA in main', authStore.isAuthenticated);
    if (!authStore.isAuthenticated) {
        try {
            const response = await refreshToken();
            console.log(response.data.data.accessToken);
            authStore.setAccessToken(response.data.data.accessToken);
        } catch (e) {
            console.log('엑세스 토큰 지우기..');
            authStore.clearAccessToken();
        }
    }

    app.use(router);
    app.use(Toast);
    app.use(vDrag);
    // if (import.meta.env.DEV) {
    //     const { worker } = await import('@/mocks/api/browser.js');
    //     await worker.start();
    // }

    app.mount('#app');
}

(async () => {
    await bootstrap();
})();
