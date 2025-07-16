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
const youtubeMeta = ref(null); // 이 youtubeMeta에 publishedAt과 viewCount가 중요합니다.
const naverSearchDataRows = ref([]);
const googleTrendsData = ref(null);

const activeMetric = ref('조회수');
const activePeriod = ref('주간'); // 주간으로 고정

const isLoading = ref(true);
const isError = ref(false);
const revenueSummaryData = ref(null);

// --- 모의 데이터 생성 함수 (상승세 패턴으로 다시 수정) ---

/**
 * 총 조회수와 게시일을 기반으로 가짜 주간 데이터를 생성합니다.
 * 영상 게시일로부터 정확히 7일간의 데이터를 현실적인 분포와 변동성을 반영하여 생성합니다.
 * 영상이 업로드된 지 7일이 채 안 되었다면, 현재까지의 일수만큼만 데이터를 생성합니다.
 *
 * @param {number} totalViews - 영상의 총 조회수 (전체 기간 조회수)
 * @param {string} publishedAt - 영상의 게시일 문자열 (예: "2025-05-18T00:00:00Z")
 * @returns {Array<Object>} 각 날짜별 조회수, 댓글, 좋아요, 클릭수를 포함하는 배열
 */
const generateMockWeeklyData = (totalViews, publishedAt) => {
  if (!publishedAt || totalViews === undefined || totalViews === null || totalViews === 0) {
    return [];
  }

  const publishedDate = new Date(publishedAt);
  publishedDate.setHours(0, 0, 0, 0); // 날짜 정확도를 위해 시간 초기화

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // 영상 업로드일로부터 현재까지 며칠이 지났는지 계산 (게시일 포함)
  const timeDiff = today.getTime() - publishedDate.getTime();
  const daysPassedIncludingToday = Math.floor(timeDiff / (1000 * 60 * 60 * 24)) + 1;

  // 차트에 표시할 데이터 길이: 영상 업로드 후 최대 7일, 또는 현재까지의 일수 중 작은 값
  const dataLength = Math.min(daysPassedIncludingToday, 7);

  if (dataLength <= 0) { // 게시일이 미래이거나 계산 오류 등으로 0일 이하가 되면 빈 배열 반환
    return [];
  }

  const rows = [];

  // 데이터 분배 로직 (상승세 후 완만한 변화, 랜덤 변동성 추가)
  // `totalViews`는 영상 전체 기간의 총 조회수이므로, 이 `dataLength` 기간에 해당하는
  // 조회수를 적절히 가정해야 합니다. (예: 총 조회수의 80%)
  // 여기서는 이 `totalViews`가 차트에 보여줄 '7일간의 예상 총 조회수'로 가정하고 분배합니다.
  const viewsForThisPeriod = totalViews; // 7일간의 총 조회수를 totalViews로 직접 사용

  // 7일치 가중치: [1일차, 2일차, ..., 7일차]
  // 첫날보다 둘째, 셋째 날이 더 높고, 이후 서서히 완만해지거나 소폭 상승하는 패턴
  // 합계가 1.0이 되도록 조정
  const baseDistributionPattern = [0.08, 0.12, 0.18, 0.17, 0.16, 0.15, 0.14]; // 합계: 1.0 (대략)

  // `dataLength`에 맞춰 가중치를 조정 (예: 4일치만 필요하면 앞의 4개 가중치만 사용하고 합이 1이 되도록 재조정)
  let actualPattern = baseDistributionPattern.slice(0, dataLength);
  const sumActualPattern = actualPattern.reduce((sum, weight) => sum + weight, 0);

  // 가중치 합이 0이거나 NaN이면 방어
  if (sumActualPattern === 0 || isNaN(sumActualPattern)) {
    // 이 경우, 최소한의 데이터를 균등하게라도 배분
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
  actualPattern = actualPattern.map(weight => weight / sumActualPattern); // 합이 1이 되도록 정규화

  let dailyViews = [];
  let currentViewsSum = 0;

  for (let i = 0; i < dataLength; i++) {
    const currentDay = new Date(publishedDate);
    currentDay.setDate(publishedDate.getDate() + i); // 게시일로부터 i일 후의 날짜

    let dayViewAmount = Math.floor(viewsForThisPeriod * actualPattern[i]);

    // 랜덤 변동성 추가 (±8% 범위로 더욱 축소하여 완만한 상승세를 명확히 표현)
    dayViewAmount = Math.floor(dayViewAmount * (1 + (Math.random() - 0.5) * 0.16)); // -8% ~ +8%
    if (dayViewAmount < 0) dayViewAmount = 0; // 음수 방지

    dailyViews.push({
      date: `${currentDay.getMonth() + 1}/${currentDay.getDate()}`,
      views: dayViewAmount
    });
    currentViewsSum += dayViewAmount;
  }

  // 총합 보존: 계산된 일별 조회수의 합이 viewsForThisPeriod와 정확히 일치하도록 마지막 날 조정
  const diff = viewsForThisPeriod - currentViewsSum;
  if (dataLength > 0) {
    dailyViews[dataLength - 1].views += diff;
    if (dailyViews[dataLength - 1].views < 0) dailyViews[dataLength - 1].views = 0;
  }

  // 최종 rows 배열 생성 (views와 함께 다른 지표들 추가)
  for (const dayData of dailyViews) {
    const views = dayData.views;
    rows.push({
      date: dayData.date,
      views: views,
      comments: Math.floor(views * (0.0001 + (Math.random() * 0.00005))), // 0.01% ~ 0.015%
      likes: Math.floor(views * (0.001 + (Math.random() * 0.0002))),     // 0.1% ~ 0.12%
      clicks: Math.floor(views * (0.05 + (Math.random() * 0.01))),       // 5% ~ 6%
    });
  }

  return rows;
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
        id: currentCampaign.influencerId,
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
            commentCount: youtubeContentApiData.metrics?.commentCount || 0,
            likeCount: youtubeContentApiData.metrics?.likeCount || 0,
            viewCount: youtubeContentApiData.metrics?.viewCount || 0, // 중요: 총 조회수
            clickCount: youtubeContentApiData.metrics?.clickCount || (100 + (parseInt(currentId) * 5))
          },
          title: youtubeContentApiData.videoTitle || "영상 제목 (API에 없음)",
          description: youtubeContentApiData.videoDescription || "영상 설명 (API에 없음)",
          publishedAt: youtubeContentApiData.publishedAt || "2025-05-18T00:00:00Z" // **예시: 2025년 5월 18일로 강제 설정 (실제 API 값 사용 권장)**
        };
      } else {
        youtubeMeta.value = null;
      }
    } catch (contentError) {
      youtubeMeta.value = null;
      console.error("Error fetching campaign content:", contentError);
    }

    try {
      const revenueApiResponse = await getCampaignRevenue(currentId);
      if (revenueApiResponse && revenueApiResponse.success && revenueApiResponse.data && revenueApiResponse.data.campaignGetRevenue && revenueApiResponse.data.campaignGetRevenue.length > 0) {
        revenueSummaryData.value = revenueApiResponse.data.campaignGetRevenue[0];
      } else {
        revenueSummaryData.value = null;
      }
    } catch (revenueError) {
      revenueSummaryData.value = null;
      console.error("Error fetching campaign revenue:", revenueError);
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
      console.error("Error fetching search data:", searchError);
    }

    // youtubeMeta가 설정된 후에 주간 데이터 생성
    if (youtubeMeta.value && youtubeMeta.value.statistics?.viewCount !== undefined) {
      youtubeAnalyticsRows.value = generateMockWeeklyData(
        youtubeMeta.value.statistics.viewCount,
        youtubeMeta.value.publishedAt
      );
    } else {
      youtubeAnalyticsRows.value = []; // 데이터가 없거나 조회수가 없으면 빈 배열
    }

  } catch (err) {
    isError.value = true;
    console.error("Error in fetchAll:", err);
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
