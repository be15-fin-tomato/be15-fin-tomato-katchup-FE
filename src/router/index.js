import { createRouter, createWebHistory } from 'vue-router';
import { mainRoutes } from '@/features/main/router.js';
import { advertisementRoutes } from '@/features/advertisement/router';
import { calendarRoutes } from '@/features/calendar/router';
import { campaignRoutes } from '@/features/campaign/router';
import { chatRoutes } from '@/features/chat/router';
import { contractRoutes } from '@/features/contract/router';
import { userRoutes } from '@/features/user/router';
import { influencerRoutes } from '@/features/influencer/router.js';
import { myPageRoutes } from '@/features/mypage/router.js';
import { aiRoutes } from '@/features/ai/router.js';
import { dashboardRoutes } from '@/features/dashboard/router.js';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
    history: createWebHistory(),
    routes: [
        ...mainRoutes,
        ...advertisementRoutes,
        ...calendarRoutes,
        ...campaignRoutes,
        ...chatRoutes,
        ...contractRoutes,
        ...userRoutes,
        ...influencerRoutes,
        ...myPageRoutes,
        ...aiRoutes,
        ...dashboardRoutes,
    ],
    scrollBehavior() {
        return { left: 0, top: 0 };
    },
});

router.beforeEach((to) => {
    const authStore = useAuthStore();
    const nonAuthRequirePages = ['login', 'findPassword', 'changePassword'];

    const isNonAuthPage = nonAuthRequirePages.includes(to.name);

    // 인증이 필요한 페이지인데 인증되지 않은 경우
    if (!isNonAuthPage && !authStore.isAuthenticated) {
        return { name: 'login' };
    }

    // 인증된 사용자가 로그인, 회원가입 등의 비인증 페이지로 이동 시도
    if (isNonAuthPage && authStore.isAuthenticated) {
        return { name: 'main' };
    }
});

export default router;
