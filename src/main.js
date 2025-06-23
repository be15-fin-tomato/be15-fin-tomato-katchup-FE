import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './router';
import Toast from 'vue-toastification';
import vDrag from 'v-drag';
import 'vue-toastification/dist/index.css';
import './assets/styles/tailwind.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

async function bootstrap() {
    const app = createApp(App);

    app.use(createPinia());
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
