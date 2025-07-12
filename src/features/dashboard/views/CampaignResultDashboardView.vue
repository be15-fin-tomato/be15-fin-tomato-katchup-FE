<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
// import axios from 'axios'; // api.js에서 사용하므로 여기서는 주석 처리

// 하위 컴포넌트 임포트
import YoutubeAnalyticsChart from '@/features/dashboard/components/chart/YoutubeAnalyticsChart.vue';
import AnalyticsFilters from '@/features/dashboard/components/AnalyticsFilters.vue';
import TrafficSourcesChart from '@/features/dashboard/components/chart/TrafficSourcesChart.vue';
import RevenueSummary from '@/features/dashboard/components/chart/RevenueSummary.vue'; // 임포트 유지
import CampaignVideoSummary from '@/features/dashboard/components/chart/CampaignVideoSummary.vue';
import CampaignHeaderCard from '@/features/dashboard/components/CampaignHeaderCard.vue';
import NaverSearchData from '@/features/dashboard/components/NaverSearchData.vue';
import GoogleSearchData from '@/features/dashboard/components/GoogleSearchData.vue';

// API 호출 함수 임포트
import { fetchNaverSearchRatio, getCampaignRevenue } from '@/features/dashboard/api'; // getCampaignRevenue 추가 임포트


const route = useRoute();

// campaignId는 사실상 pipelineInfluencerId 역할을 합니다.
const campaignId = computed(() => route.params.id || '1'); // 기본값 '1'

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

// API 응답으로부터 받을 수익 요약 데이터 상태
const revenueSummaryData = ref(null);

const periodKeyMap = {
  '일간': 'daily',
  '주간': 'weekly',
  '월간': 'monthly'
};

// --- 목 데이터 정의 (컴포넌트 내부에 직접) ---
// ... (이 부분은 기존과 동일하게 유지하거나 실제 API로 대체) ...
const getMockCampaignData = (id) => ({
  data: {
    campaignId: id,
    campaignName: `모의 캠페인 ${id}`,
    influencerId: `influencer_${id}`,
    productName: `모의 제품명 ${id}`,
    expectedRevenue: 1500000 + (parseInt(id) * 100000), // 이 값은 이제 백엔드 totalProfit으로 대체될 수 있음
    productPrice: 50000 + (parseInt(id) * 100),
    startDate: '2023-01-01',
    endDate: '2023-01-31',
  },
});

const getMockInfluencerData = (influencerIdFromCampaign) => {
  const idNum = parseInt(influencerIdFromCampaign.replace('influencer_', ''));

  let name = `인플루언서 ${idNum}`;
  let subscribers = 100000 + (idNum * 100);
  let tags = ['일상', '먹방'];

  if (idNum === 15103) {
    name = "윤채영";
    subscribers = 750000;
    tags = ['뷰티', '여행'];
  } else if (idNum === 15104) {
    name = "권원진";
    subscribers = 520000;
    tags = ['게임', 'IT'];
  } else if (idNum === 15092) {
    name = "윤채영";
    subscribers = 700000;
    tags = ['일상', 'Vlog'];
  }

  return {
    data: {
      id: influencerIdFromCampaign,
      name: name,
      platform: 'Youtube',
      subscribers: subscribers,
      thumbnail: `https://via.placeholder.com/130?text=Influencer+${idNum}`,
      tags: tags,
    },
  };
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

const getMockYoutubeMeta = (campaignId) => {
  const idNum = parseInt(campaignId);
  return {
    title: `모의 캠페인 영상 제목 ${idNum}`,
    description: `이것은 모의 캠페인 영상 ${idNum}에 대한 설명입니다.`,
    publishedAt: '2023-01-01T10:00:00Z',
    thumbnail: `https://via.placeholder.com/200?text=Video+${idNum}`,
    statistics: {
      commentCount: 50 + (idNum * 2),
      likeCount: 500 + (idNum * 10),
      clickCount: 1500 + (idNum * 20),
      viewCount: 10000 + (idNum * 100),
    },
  };
};
// ---------------------------------------------


const fetchAll = async () => {
  isLoading.value = true;
  isError.value = false;
  try {
    const currentId = campaignId.value;

    // 1. 캠페인 및 인플루언서 데이터 (목 데이터 유지 또는 실제 API로 대체)
    campaign.value = getMockCampaignData(currentId).data;
    influencer.value = getMockInfluencerData(campaign.value.influencerId).data;

    // 2. 유튜브 애널리틱스 및 메타 데이터 (목 데이터 유지 또는 실제 API로 대체)
    youtubeAnalyticsRows.value = getMockYoutubeAnalyticsRows(currentId, periodKeyMap[activePeriod.value]).rows;
    youtubeMeta.value = getMockYoutubeMeta(currentId);

    // 3. 수익 요약 데이터 호출 (API 연동!)
    try {
      const revenueApiResponse = await getCampaignRevenue(currentId);
      console.log("수익 요약 API 응답 원본:", revenueApiResponse); // 응답 원본 로그 추가

      if (revenueApiResponse.success && revenueApiResponse.data && revenueApiResponse.data.campaignGetRevenue) {
        // 백엔드에서 배열로 오므로 첫 번째 항목을 사용
        revenueSummaryData.value = revenueApiResponse.data.campaignGetRevenue[0];
      } else {
        revenueSummaryData.value = null;
        console.warn("수익 요약 데이터를 가져오는데 실패했거나 형식이 예상과 다릅니다:", revenueApiResponse);
      }
    } catch (revenueError) {
      console.error('수익 요약 데이터 로딩 실패:', revenueError);
      revenueSummaryData.value = null; // 에러 시 null로 초기화
    }


    // 4. 네이버 및 구글 검색 데이터 (기존 API 호출 및 가공 로직 유지)
    try {
      const searchApiResponse = await fetchNaverSearchRatio(currentId);
      console.log("통합 검색 API 응답 원본:", searchApiResponse);

      if (searchApiResponse && searchApiResponse.naver) {
        const naverRawData = searchApiResponse.naver;
        const transformedNaverData = Object.keys(naverRawData).map(date => ({
          period: date,
          ratio: naverRawData[date]
        }));
        transformedNaverData.sort((a, b) => new Date(a.period) - new Date(b.period));
        naverSearchDataRows.value = transformedNaverData;
      } else {
        naverSearchDataRows.value = [];
        console.warn("네이버 검색 데이터에 'naver' 키가 없거나 형식이 예상과 다릅니다:", searchApiResponse);
      }

      if (searchApiResponse && searchApiResponse.google) {
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
        console.warn("구글 검색 데이터에 'google' 키가 없거나 형식이 예상과 다릅니다:", searchApiResponse);
      }

    } catch (searchError) {
      console.error('검색 트렌드 데이터 로딩 실패:', searchError);
      naverSearchDataRows.value = [];
      googleTrendsData.value = null;
    }

    console.log('대시보드 데이터 로드 완료:', {
      campaign: campaign.value,
      influencer: influencer.value,
      youtubeAnalyticsRows: youtubeAnalyticsRows.value,
      youtubeMeta: youtubeMeta.value,
      revenueSummary: revenueSummaryData.value, // 추가된 로그
      naverSearchDataRows: naverSearchDataRows.value,
      googleTrendsData: googleTrendsData.value,
    });
  } catch (err) {
    isError.value = true;
    console.error('대시보드 메인 데이터 로딩 실패:', err);
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


// summary computed 속성을 API 응답 데이터에 기반하도록 수정
const summary = computed(() => {
  // revenueSummaryData가 null이거나 유효하지 않으면 기본값 반환
  if (!revenueSummaryData.value) {
    return {
      totalRevenue: 0,
      avgPrice: 0,
      totalSales: 0,
      estimatedRevenue: 0,
      roas: 0,
      conversionRate: 0,
      // paymentDate는 campaign 객체에서 가져오거나 백엔드 응답에 포함시켜야 합니다.
      paymentDate: null,
    };
  }

  // API 응답 데이터를 직접 매핑
  const data = revenueSummaryData.value;
  return {
    // salesQuantity는 totalSales에 매핑되므로, totalRevenue에 salesQuantity를 사용하지 않음
    totalRevenue: data.totalProfit || 0, // 백엔드의 totalProfit -> 프론트의 총 이익
    avgPrice: data.averageUnitPrice || 0,
    totalSales: parseInt(data.salesQuantity) || 0, // salesQuantity는 문자열이므로 숫자로 변환
    estimatedRevenue: data.totalProfit || 0, // 예상 수익도 총 이익과 동일하게 매핑
    roas: data.roasPercentage || 0,
    conversionRate: data.conversionRatePercent || 0,
    paymentDate: campaign.value?.endDate || null, // 캠페인 종료일을 결제일로 임시 사용
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
          <RevenueSummary :summary="summary" /> </div>
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
