import { setupWorker } from 'msw/browser';
import CampaignHandler from '@/mocks/api/handler/CampaignHandler.js';
import InfluencerHandler from '@/mocks/api/handler/InfluencerHandler.js';
import ContractHandler from '@/mocks/api/handler/ContractHandler.js';
import { InstagramDashboardHandler } from '@/mocks/api/handler/InstagramDashboardHandler.js';
import { YouTubeDashboardHandler } from '@/mocks/api/handler/YoutubeDashboardHandler.js';
import ChatHandler from '@/mocks/api/handler/ChatHandler.js';
import { YoutubeMockHandler } from '@/mocks/api/handler/YoutubeAnalyticsHandler.js';
import { YoutubeTrafficSourcesHandler } from '@/mocks/api/handler/YoutubeTrafficSourcesHandler.js';
import { SearchDataHandler } from '@/mocks/api/handler/SearchDataHandler.js';

export const worker = setupWorker(
    ...CampaignHandler,
    ...InfluencerHandler,
    ...ContractHandler,
    ...InstagramDashboardHandler,
    ...ChatHandler,
    ...YouTubeDashboardHandler,
    ...YoutubeMockHandler,
    ...YoutubeTrafficSourcesHandler,
    ...SearchDataHandler
);
