<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useToast } from 'vue-toastification'

import DashboardBase from '@/features/dashboard/components/DashboardBase.vue'
import DashboardHeader from '@/features/dashboard/components/DashboardHeader.vue'
import PopularPosts from '@/features/dashboard/components/PopularPosts.vue'
import PopularShortForms from '@/features/dashboard/components/PopularShortForms.vue'
import DashboardCampaignList from '@/features/dashboard/components/DashboardCampaignList.vue'
import { fetchInfluencerDetail, fetchYoutubeInfo } from '@/features/dashboard/api.js';

const route = useRoute()
const router = useRouter()
const toast = useToast()

const dashboard = ref(null)
const influencer = ref(null)
const satisfaction = ref(82.5)
const influencerId = route.query.id

// 숫자를 만 단위로 포맷팅하는 함수
const formatNumber = (num) => {
  const parsedNum = parseFloat(num);
  if (isNaN(parsedNum)) return '0';

  if (parsedNum < 10000) {
    // 10,000 미만일 때는 숫자 그대로 표시 (소수점 제거)
    return Math.floor(parsedNum).toLocaleString();
  } else {
    // 10,000 이상일 때는 '만' 단위로 소수점 첫째 자리까지 표시
    const 만단위 = parsedNum / 10000;
    const fixedNum = 만단위.toFixed(1);

    // 소수점 첫째 자리가 0이면 .0을 제거
    if (fixedNum.endsWith('.0')) {
      return `${Math.floor(만단위)}만`;
    } else {
      return `${fixedNum}만`;
    }
  }
};

onMounted(async () => {
  try {
    const [youtubeRes, influencerRes] = await Promise.all([
      fetchYoutubeInfo(influencerId),    // YouTube 대시보드 데이터
      fetchInfluencerDetail(influencerId) // 인플루언서 프로필 정보
    ])

    const youtubeRawData = youtubeRes?.data?.data?.[0];
    const influencerData = influencerRes

    // YouTube 데이터가 없으면 경고 메시지를 띄우고 리스트 페이지로 이동
    if (!youtubeRawData) {
      toast.warning('YouTube 계정이 연결되어있지 않습니다.')
      router.replace('/influencer/list')
      return
    }

    dashboard.value = {
      totalVideos: youtubeRawData.totalVideos ?? 0,
      avgViews: youtubeRawData.avgViews ?? 0,
      avgLikes: youtubeRawData.avgLikes ?? 0,
      avgComments: youtubeRawData.avgComments ?? 0,
      dailyAvgViews: youtubeRawData.dailyAvgViews ?? 0, // 숫자 값으로 예상
      monthlyAvgViews: youtubeRawData.monthlyAvgViews ?? 0, // 숫자 값으로 예상
      age1824: youtubeRawData.age1824 ?? 0,
      age2534: youtubeRawData.age2534 ?? 0,
      age3544: youtubeRawData.age3544 ?? 0,
      age4554: youtubeRawData.age4554 ?? 0,
      genderMale: youtubeRawData.genderMale ?? 0,
      genderFemale: youtubeRawData.genderFemale ?? 0,
      subscribedRatio: youtubeRawData.subscribedRatio ?? 0,
      notSubscribedRatio: youtubeRawData.notSubscribedRatio ?? 0,

      // 백엔드 응답에 없는 데이터에 대한 기본값 설정 (⚠️ 이 필드들은 백엔드에서 제공되지 않으므로, 화면에 표시되지 않거나 차트가 빈 값으로 렌더링될 수 있습니다.)
      shortsSummary: { // DashboardBase의 summaryData가 필요로 할 수 있으므로 임시로 구성
        totalVideos: youtubeRawData.totalVideos ?? 0, // 총 비디오 수를 쇼츠 요약의 'count'로 사용
        averageViewCount: youtubeRawData.avgViews ?? 0,
        commentCount: youtubeRawData.avgComments ?? 0,
        likeCount: youtubeRawData.avgLikes ?? 0
      },
      popularVideos: [], // 백엔드에 없음
      popularShorts: [], // 백엔드에 없음
      subscribersTrend: [], // 백엔드에 없음
      reach: 0, // 백엔드에 없음
    };

    influencer.value = influencerData;
    console.log("Processed Dashboard Data:", dashboard.value);

  } catch (err) {
    toast.error('데이터를 불러오지 못했습니다.');
    console.error('💥 YouTube Dashboard Error:', err);
    dashboard.value = {}; // 오류 발생 시 빈 객체로 설정하여 템플릿 오류 방지
  }
});

const summaryData = computed(() => {
  if (!dashboard.value) return { totalVideos: '0개', views: '0만', comments: '0개', likes: '0만' };

  const totalVideos = formatNumber(dashboard.value.totalVideos ?? 0);
  const views = formatNumber(dashboard.value.avgViews ?? 0);
  const likes = formatNumber(dashboard.value.avgLikes ?? 0);
  const comments = formatNumber(dashboard.value.avgComments ?? 0);

  return {
    totalVideos: `${totalVideos}개`,
    views: `${views}회`,
    comments: `${comments}개`,
    likes: `${likes}개`
  };
});

const formatSubscribers = (num) => {
  const parsedNum = parseInt(num);
  return parsedNum >= 10000 ? `${Math.floor(parsedNum / 10000)}만명` : `${parsedNum}명`;
};

const goToPlatform = (platform) => {
  router.push(`/influencer/dashboard/${platform}?id=${influencerId}`);
};

const goToList = () => {
  router.push(`/influencer/list`);
}
</script>

<template>
  <div class="w-full min-h-screen flex items-center justify-center">
    <div v-if="dashboard" class="w-full">
      <div class="flex justify-end">
        <button
          @click="goToList"
          class="flex items-center gap-2 px-4 py-2 mb-5 bg-btn-blue text-white font-bold rounded-md"
        >
          나가기
          <Icon icon="tabler:door-exit" width="24" height="24" />
        </button>
      </div>

      <DashboardHeader :influencer="influencer" />

      <DashboardBase
        platform="youtube"
        :summaryData="summaryData"
        :data="dashboard"
        :satisfaction="satisfaction"
        @switch="goToPlatform"
      />

<!--      <PopularPosts :platform="'youtube'" :items="dashboard.popularVideos" />-->
<!--      <PopularShortForms :platform="'youtube'" :items="dashboard.popularShorts" />-->
<!--      <DashboardCampaignList />-->
    </div>

    <div v-else class="flex justify-center items-center w-full h-full">Loading...</div>
  </div>
</template>
