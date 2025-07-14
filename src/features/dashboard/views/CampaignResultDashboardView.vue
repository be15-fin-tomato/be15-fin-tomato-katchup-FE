<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';

import YoutubeAnalyticsChart from '@/features/dashboard/components/chart/YoutubeAnalyticsChart.vue';
import AnalyticsFilters from '@/features/dashboard/components/AnalyticsFilters.vue';
import TrafficSourcesChart from '@/features/dashboard/components/chart/TrafficSourcesChart.vue';
import RevenueSummary from '@/features/dashboard/components/chart/RevenueSummary.vue';
import CampaignVideoSummary from '@/features/dashboard/components/chart/CampaignVideoSummary.vue';
import CampaignHeaderCard from '@/features/dashboard/components/CampaignHeaderCard.vue';
import NaverSearchData from '@/features/dashboard/components/NaverSearchData.vue';
import GoogleSearchData from '@/features/dashboard/components/GoogleSearchData.vue';

import {
  fetchNaverSearchRatio,
  getCampaignRevenue,
  fetchCampaignContent,
  getCampaignResultList
} from '@/features/dashboard/api';


const route = useRoute();
const campaignId = computed(() => route.params.id || '1');

const campaign = ref(null);
const influencer = ref(null);
const youtubeAnalyticsRows = ref([]);
const youtubeMeta = ref(null);
const naverSearchDataRows = ref([]);
const googleTrendsData = ref(null);

const activeMetric = ref('조회수');
const activePeriod = ref('일간');
const isLoading = ref(true);
const isError = ref(false);

const revenueSummaryData = ref(null);

const periodKeyMap = {
  '일간': 'daily',
  '주간': 'weekly',
  '월간': 'monthly'
};

const getMockYoutubeAnalyticsRows = (campaignId, periodType) => {
  const idNum = parseInt(campaignId);
  return {
    rows: [
      { date: '2023-01-01', views: 1000 + (idNum * 10), comments: 5, likes: 50, clicks: 20 },
      { date: '2023-01-02', views: 1200 + (idNum * 10), comments: 7, likes: 60, clicks: 25 },
      { date: '2023-01-03', views: 1500 + (idNum * 10), comments: 8, likes: 75, clicks: 30 },
      { date: '2023-01-04', views: 1100 + (idNum * 10), comments: 6, likes: 55, clicks: 22 },
      { date: '2023-01-05', views: 1300 + (idNum * 10), comments: 7, likes: 65, clicks: 28 },
      { date: '2023-01-06', views: 1400 + (idNum * 10), comments: 9, likes: 70, clicks: 32 },
      { date: '2023-01-07', views: 1600 + (idNum * 10), comments: 10, likes: 80, clicks: 35 },
    ],
  };
};

const fetchAll = async () => {
  isLoading.value = true;
  isError.value = false;
  try {
    const currentId = campaignId.value;

    if (!currentId) {
      isError.value = true;
      isLoading.value = false;
      return;
    }

    let allCampaigns = [];
    let currentPage = 1;
    let totalCount = 0;
    const pageSize = 10;

    do {
      const responseData = await getCampaignResultList({ page: currentPage, size: pageSize });

      if (responseData && responseData.campaignList && responseData.campaignList.length > 0) {
        allCampaigns = allCampaigns.concat(responseData.campaignList);
        totalCount = responseData.pagination.totalCount;
        currentPage++;
      } else {
        break;
      }
    } while (allCampaigns.length < totalCount);

    const idToFind = parseInt(currentId);
    const currentCampaign = allCampaigns.find(c => c.pipelineInfluencerId === idToFind);

    if (currentCampaign) {
      campaign.value = {
        campaignId: currentCampaign.pipelineId,
        campaignName: currentCampaign.name,
        influencerId: currentCampaign.pipelineInfluencerId,
        productName: currentCampaign.productName,
        expectedRevenue: currentCampaign.expectedRevenue || 0,
        productPrice: 0,
        startDate: currentCampaign.startedAt || '2023-01-01',
        endDate: currentCampaign.endedAt || '2023-01-31',
        name: currentCampaign.name,
        clientCompanyName: currentCampaign.clientCompanyName,
        registrationDate: currentCampaign.registrationDate,
      };

      influencer.value = {
        id: currentCampaign.pipelineInfluencerId,
        name: currentCampaign.influencerName,
        platform: 'Youtube',
        subscribers: 0,
        thumbnail: `https://via.placeholder.com/130?text=${currentCampaign.influencerName}`,
        tags: [],
      };

    } else {
      isError.value = true;
      isLoading.value = false;
      return;
    }

    try {
      const youtubeContentApiData = await fetchCampaignContent(currentId);
      if (youtubeContentApiData) {
        youtubeMeta.value = {
          videoId: youtubeContentApiData.youtubeVideoId,
          thumbnail: youtubeContentApiData.videoThumbnailUrl,
          statistics: {
            commentCount: youtubeContentApiData.metrics?.commentCount,
            likeCount: youtubeContentApiData.metrics?.likeCount,
            viewCount: youtubeContentApiData.metrics?.viewCount,
            clickCount: 100 + (parseInt(currentId) * 5)
          },
          title: youtubeContentApiData.videoTitle || "영상 제목 (API에 없음)",
          description: youtubeContentApiData.videoDescription || "영상 설명 (API에 없음)",
          publishedAt: youtubeContentApiData.publishedAt || "2023-01-01T00:00:00Z"
        };
      } else {
        youtubeMeta.value = null;
      }
    } catch (contentError) {
      youtubeMeta.value = null;
    }

    try {
      const revenueApiResponse = await getCampaignRevenue(currentId);
      if (revenueApiResponse && revenueApiResponse.success && revenueApiResponse.data) {
        revenueSummaryData.value = revenueApiResponse.data;
      } else {
        revenueSummaryData.value = null;
      }
    } catch (revenueError) {
      revenueSummaryData.value = null;
    }

    try {
      const searchApiResponse = await fetchNaverSearchRatio(currentId);
      if (searchApiResponse) {
        if (searchApiResponse.naver) {
          const naverRawData = searchApiResponse.naver;
          const transformedNaverData = Object.keys(naverRawData).map(date => ({
            period: date,
            ratio: naverRawData[date]
          }));
          transformedNaverData.sort((a, b) => new Date(a.period) - new Date(b.period));
          naverSearchDataRows.value = transformedNaverData;
        } else {
          naverSearchDataRows.value = [];
        }

        if (searchApiResponse.google) {
          const googleRawData = searchApiResponse.google;
          const transformedGoogleTimelineData = Object.keys(googleRawData).map(date => ({
            time: new Date(date).getTime() / 1000,
            value: [googleRawData[date]]
          }));
          transformedGoogleTimelineData.sort((a, b) => a.time - b.time);

          googleTrendsData.value = {
            default: {
              averages: [],
              timelineData: transformedGoogleTimelineData,
            },
          };
        } else {
          googleTrendsData.value = null;
        }
      } else {
        naverSearchDataRows.value = [];
        googleTrendsData.value = null;
      }

    } catch (searchError) {
      naverSearchDataRows.value = [];
      googleTrendsData.value = null;
    }

    youtubeAnalyticsRows.value = getMockYoutubeAnalyticsRows(currentId, periodKeyMap[activePeriod.value]).rows;

  } catch (err) {
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAll);

watch(campaignId, (newId, oldId) => {
  if (newId !== oldId) {
    fetchAll();
  }
});

const onPeriodChange = async (period) => {
  activePeriod.value = period;
  youtubeAnalyticsRows.value = getMockYoutubeAnalyticsRows(campaignId.value, periodKeyMap[activePeriod.value]).rows;
};

const summary = computed(() => {
  if (!revenueSummaryData.value) {
    return {
      totalRevenue: 0,
      avgPrice: 0,
      totalSales: 0,
      estimatedRevenue: 0,
      roas: 0,
      conversionRate: 0,
      paymentDate: null,
    };
  }

  const data = revenueSummaryData.value;
  return {
    totalRevenue: data.totalProfit || 0,
    avgPrice: data.averageUnitPrice || 0,
    totalSales: data.salesQuantity || 0,
    estimatedRevenue: data.expectedProfit || 0,
    roas: data.roasPercentage || 0,
    conversionRate: data.conversionRatePercent || 0,
    paymentDate: campaign.value?.endDate || null,
  };
});
</script>

<template>
  <div class="w-full min-h-screen flex flex-col">
    <div v-if="isLoading" class="flex justify-center items-center w-full h-full text-lg text-blue-600 py-20">데이터를 불러오는 중입니다...</div>

    <div v-else-if="isError" class="flex justify-center items-center w-full h-full text-lg text-red-500 py-20">
      데이터를 불러오지 못했습니다. 오류가 발생했습니다.
    </div>

    <div v-else>
      <CampaignHeaderCard :campaign="campaign" :influencer="influencer" />
      <CampaignVideoSummary :meta="youtubeMeta" />

      <div class="dashboard-section p-6 bg-white rounded-xl shadow mt-6 mb-4">
        <AnalyticsFilters
          :activeMetric="activeMetric"
          :activePeriod="activePeriod"
          @update:metric="activeMetric = $event"
          @update:period="onPeriodChange"
        />
        <YoutubeAnalyticsChart :rows="youtubeAnalyticsRows" :activeMetric="activeMetric" />
      </div>

      <div class="flex gap-8">
        <div class="w-[65%] dashboard-section p-6 bg-white rounded-xl shadow mt-6">
          <TrafficSourcesChart :pipeline-influencer-id="campaignId" />
        </div>
        <div class="w-[35%] dashboard-section p-6 bg-white rounded-xl shadow mt-6">
          <RevenueSummary :summary="summary" />
        </div>
      </div>

      <div class="flex flex-col w-full mt-6">
        <NaverSearchData
          :rows="naverSearchDataRows"
          :title="campaign?.productName"
          :publishedAt="youtubeMeta?.publishedAt"
        />
        <GoogleSearchData
          v-if="googleTrendsData"
          :data="googleTrendsData"
          :title="campaign?.productName"
          :publishedAt="youtubeMeta?.publishedAt"
        />
      </div>
    </div>
  </div>
</template>
