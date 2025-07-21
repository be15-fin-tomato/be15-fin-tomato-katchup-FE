<script setup>
import { ref, onMounted, computed, watch, onUnmounted } from 'vue';
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
const activePeriod = ref('주간');

const isLoading = ref(true);
const isError = ref(false);
const revenueSummaryData = ref(null);

const aiSpinnerMessages = [
  "데이터를 분석 중입니다",
  "최신 성과를 집계 중입니다",
  "복합적인 요소를 검토 중입니다",
  "인사이트를 추출하고 있습니다"
];
const currentSpinnerMessageIndex = ref(0);
let messageIntervalId = null;

const startMessageCycle = () => {
  if (messageIntervalId) {
    clearInterval(messageIntervalId);
  }
  messageIntervalId = setInterval(() => {
    currentSpinnerMessageIndex.value = (currentSpinnerMessageIndex.value + 1) % aiSpinnerMessages.length;
  }, 3000);
};

const stopMessageCycle = () => {
  if (messageIntervalId) {
    clearInterval(messageIntervalId);
    messageIntervalId = null;
    currentSpinnerMessageIndex.value = 0;
  }
};

const generateMockWeeklyData = (totalViews, publishedAt) => {
  if (!publishedAt || totalViews === undefined || totalViews === null || totalViews === 0) {
    return [];
  }

  const publishedDate = new Date(publishedAt);
  publishedDate.setHours(0, 0, 0, 0);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const timeDiff = today.getTime() - publishedDate.getTime();
  const daysPassedIncludingToday = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  const dataLength = Math.min(daysPassedIncludingToday, 7);

  if (dataLength <= 0) {
    return [];
  }

  const rows = [];
  const viewsForThisPeriod = totalViews;

  const baseDistributionPattern = [0.08, 0.12, 0.18, 0.17, 0.16, 0.15, 0.14];

  let actualPattern = baseDistributionPattern.slice(0, dataLength);
  const sumActualPattern = actualPattern.reduce((sum, weight) => sum + weight, 0);

  if (sumActualPattern === 0 || isNaN(sumActualPattern)) {
    for (let i = 0; i < dataLength; i++) {
      const currentDay = new Date(publishedDate);
      currentDay.setDate(publishedDate.getDate() + i);
      rows.push({
        date: `${currentDay.getMonth() + 1}/${currentDay.getDate()}`,
        views: Math.floor(viewsForThisPeriod / dataLength),
        comments: Math.floor((viewsForThisPeriod / dataLength) * 0.0001),
        likes: Math.floor((viewsForThisPeriod / dataLength) * 0.001),
        clicks: Math.floor((viewsForThisPeriod / dataLength) * 0.05),
      });
    }
    return rows;
  }
  actualPattern = actualPattern.map(weight => weight / sumActualPattern);

  let dailyViews = [];
  let currentViewsSum = 0;

  for (let i = 0; i < dataLength; i++) {
    const currentDay = new Date(publishedDate);
    currentDay.setDate(publishedDate.getDate() + i);

    let dayViewAmount = Math.floor(viewsForThisPeriod * actualPattern[i]);

    dayViewAmount = Math.floor(dayViewAmount * (1 + (Math.random() - 0.5) * 0.16));
    if (dayViewAmount < 0) dayViewAmount = 0;

    dailyViews.push({
      date: `${currentDay.getMonth() + 1}/${currentDay.getDate()}`,
      views: dayViewAmount
    });
    currentViewsSum += dayViewAmount;
  }

  const diff = viewsForThisPeriod - currentViewsSum;
  if (dataLength > 0) {
    dailyViews[dataLength - 1].views += diff;
    if (dailyViews[dataLength - 1].views < 0) dailyViews[dataLength - 1].views = 0;
  }

  for (const dayData of dailyViews) {
    const views = dayData.views;
    rows.push({
      date: dayData.date,
      views: views,
      comments: Math.floor(views * (0.0001 + (Math.random() * 0.00005))),
      likes: Math.floor(views * (0.001 + (Math.random() * 0.0002))),
      clicks: Math.floor(views * (0.05 + (Math.random() * 0.01))),
    });
  }

  return rows;
};

const fetchAll = async () => {
  isLoading.value = true;
  isError.value = false;
  startMessageCycle();

  try {
    const currentId = campaignId.value;

    if (!currentId) {
      isError.value = true;
      isLoading.value = false;
      stopMessageCycle();
      console.error('CampaignDashboard: campaignId is null or undefined. Cannot fetch data.');
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
        id: currentCampaign.influencerId,
        name: currentCampaign.influencerName,
        platform: 'Youtube',
        subscribers: 0,
        thumbnail: `https://via.placeholder.com/130?text=${currentCampaign.influencerName}`,
        tags: [],
        youtube: {
          accountId: null,
          name: currentCampaign.influencerName,
          subscriber: null,
          thumbnailUrl: null
        }
      };
    } else {
      isError.value = true;
      isLoading.value = false;
      stopMessageCycle();
      console.error('CampaignDashboard: No campaign found for the given currentId. Setting error state.');
      return;
    }

    try {
      const youtubeContentApiData = await fetchCampaignContent(currentId);

      if (youtubeContentApiData) {
        youtubeMeta.value = {
          videoId: youtubeContentApiData.youtubeVideoId,
          thumbnail: youtubeContentApiData.videoThumbnailUrl,
          statistics: {
            commentCount: youtubeContentApiData.metrics?.commentCount || 0,
            likeCount: youtubeContentApiData.metrics?.likeCount || 0,
            viewCount: youtubeContentApiData.metrics?.viewCount || 0,
            clickCount: youtubeContentApiData.metrics?.clickCount || (100 + (parseInt(currentId) * 5))
          },
          title: youtubeContentApiData.videoTitle || "영상 제목 (API에 없음)",
          description: youtubeContentApiData.videoDescription || "영상 설명 (API에 없음)",
          publishedAt: youtubeContentApiData.publishedAt || "2025-05-18T00:00:00Z"
        };

        if (influencer.value) {
          influencer.value.thumbnail = youtubeContentApiData.channelThumbnailUrl;
          influencer.value.youtube.thumbnailUrl = youtubeContentApiData.channelThumbnailUrl;
        } else {
          console.warn('CampaignDashboard: Influencer object not initialized when trying to update thumbnail.');
        }
      } else {
        youtubeMeta.value = null;
        console.warn('CampaignDashboard: fetchCampaignContent returned no data. youtubeMeta set to null.');
      }
    } catch (contentError) {
      console.error("CampaignDashboard: Error fetching campaign content:", contentError);
      youtubeMeta.value = null;
      if (influencer.value) {
        influencer.value.thumbnail = '/tomato.png';
        influencer.value.youtube.thumbnailUrl = '/tomato.png';
      }
    }

    try {
      const revenueApiResponse = await getCampaignRevenue(currentId);
      if (revenueApiResponse && revenueApiResponse.success && revenueApiResponse.data && revenueApiResponse.data.campaignGetRevenue && revenueApiResponse.data.campaignGetRevenue.length > 0) {
        revenueSummaryData.value = revenueApiResponse.data.campaignGetRevenue[0];
      } else {
        revenueSummaryData.value = null;
        console.warn('CampaignDashboard: No valid revenue data found.');
      }
    } catch (revenueError) {
      console.error("CampaignDashboard: Error fetching campaign revenue:", revenueError);
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
          console.warn('CampaignDashboard: No Naver search data in API response');
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
          console.warn('CampaignDashboard: No Google search data in API response.');
        }
      } else {
        naverSearchDataRows.value = [];
        googleTrendsData.value = null;
        console.warn('CampaignDashboard: Search API response was null.');
      }

    } catch (searchError) {
      console.error("CampaignDashboard: Error fetching search data (Naver/Google):", searchError);
      naverSearchDataRows.value = [];
      googleTrendsData.value = null;
    }

    if (youtubeMeta.value && youtubeMeta.value.statistics?.viewCount !== undefined) {
      youtubeAnalyticsRows.value = generateMockWeeklyData(
        youtubeMeta.value.statistics.viewCount,
        youtubeMeta.value.publishedAt
      );
    } else {
      youtubeAnalyticsRows.value = [];
      console.warn('CampaignDashboard: youtubeMeta or viewCount missing for analytics generation.');
    }

  } catch (err) {
    console.error("CampaignDashboard: An unexpected error occurred in fetchAll:", err);
    isError.value = true;
  } finally {
    isLoading.value = false;
    stopMessageCycle();
  }
};

onMounted(fetchAll);
onUnmounted(stopMessageCycle);

watch(campaignId, (newId, oldId) => {
  if (newId !== oldId) {
    fetchAll();
  }
});

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

  const salesQuantity = parseFloat(data.salesQuantity) || 0;
  const viewCount = youtubeMeta.value?.statistics?.viewCount || 0;

  let calculatedConversionRate = 0;
  if (viewCount > 0) {
    calculatedConversionRate = (salesQuantity / viewCount) * 100;
    calculatedConversionRate = parseFloat(calculatedConversionRate.toFixed(2));
  }

  return {
    totalRevenue: data.totalProfit || 0,
    avgPrice: data.averageUnitPrice || 0,
    totalSales: salesQuantity,
    estimatedRevenue: data.expectedProfit || 0,
    roas: data.roasPercentage || 0,
    conversionRate: calculatedConversionRate,
    paymentDate: campaign.value?.endDate || null,
  };
});
</script>

<template>
  <div class="w-full min-h-screen flex flex-col">
    <div v-if="isLoading" class="flex flex-col justify-center items-center w-full h-full text-lg text-blue-600 py-20">
      <div class="ai-spinner mb-4"></div>
      <p class="text-xl font-semibold mb-2 text-gray-800">{{ aiSpinnerMessages[currentSpinnerMessageIndex] }}</p>
      <p class="text-gray-600 text-base">최적의 성과 분석을 위해 데이터를 꼼꼼히 살피고 있어요.</p>
    </div>

    <div v-else-if="isError" class="flex justify-center items-center w-full h-full text-lg text-red-500 py-20">
      데이터를 불러오지 못했습니다. 오류가 발생했습니다.
    </div>

    <div v-else>
      <CampaignHeaderCard :campaign="campaign" :influencer="influencer" :pipeline-influencer-id="campaignId" />
      <CampaignVideoSummary :meta="youtubeMeta" />

      <div class="dashboard-section p-6 bg-white rounded-xl shadow mt-6 mb-4">
        <AnalyticsFilters
          :activeMetric="activeMetric"
          :activePeriod="activePeriod"
          @update:metric="activeMetric = $event"
          @update:period="activePeriod = '주간'"
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
