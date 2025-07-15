import EmailSystemView from '@/features/user/views/EmailSystemView.vue';
import SurveyListView from '@/features/user/views/SurveyListView.vue';
import InstagramOAuthCallback from '@/features/influencer/views/InstagramOAuthCallback.vue';
import YoutubeOAuthCallback from '@/features/influencer/views/YoutubeOAuthCallback.vue';
import InfluencerManagementView from '@/features/influencer/views/InfluencerManagementView.vue';

export const userRoutes = [
    {
        path: '/management/influencer',
        name: 'InfluencerManagement',
        component: InfluencerManagementView,
    },
    {
        path: '/login',
        name: 'login',
        component: () => import('@/features/user/views/LoginView.vue'),
        meta: {
            useLayout: 'none',
        },
    },
    {
        path: '/findPassword',
        name: 'findPassword',
        component: () => import('@/features/user/views/findPasswordView.vue'),
        meta: {
            useLayout: 'none',
        },
    },

    {
        path: '/management/email',
        name: 'emailSystem',
        component: EmailSystemView,
    },

    {
        path: '/management/survey',
        name: 'surveyList',
        component: SurveyListView,
    },
    {
        path: '/oauth2/youtube/callback',
        name: 'youtube-oauth-callback',
        component: YoutubeOAuthCallback,
        meta: { requiresAuth: false }
    },
    {
      path: '/oauth2/instagram/callback',
      name: 'instagram-oauth-callback',
      component: InstagramOAuthCallback,
      meta: { requiresAuth: false }
    },
];
