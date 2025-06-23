import InstagramDashboardView from '@/features/dashboard/views/InstagramDashboardView.vue';
import YoutubeDashboardView from '@/features/dashboard/views/YoutubeDashboardView.vue';
import CampaignResultDashboardView from '@/features/dashboard/views/CampaignResultDashboardView.vue';
import CampaignResultListView from '@/features/dashboard/views/CampaignResultListView.vue';

export const dashboardRoutes = [
    {
        path: '/influencer/dashboard/youtube',
        name: 'youtube',
        component: YoutubeDashboardView,
    },
    {
        path: '/influencer/dashboard/instagram',
        name: 'instagram',
        component: InstagramDashboardView,
    },
    {
        path: '/campaign/dashboard/:id',
        name: 'campaign-dashboard',
        component: CampaignResultDashboardView,
    },
    {
        path: '/campaign/dashboard',
        name: 'campaign-dashboard-list',
        component: CampaignResultListView,
    },
];
