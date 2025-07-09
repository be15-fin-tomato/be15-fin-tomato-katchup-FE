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
import { formatNumber } from 'chart.js/helpers';

const route = useRoute()
const router = useRouter()
const toast = useToast()

const dashboard = ref(null)
const influencer = ref(null)
const satisfaction = ref(82.5)
const influencerId = route.query.id

onMounted(async () => {
  try {
    const [youtubeRes, influencerRes] = await Promise.all([
      fetchYoutubeInfo(influencerId),    // YouTube 대시보드 데이터
      fetchInfluencerDetail(influencerId) // 인플루언서 프로필 정보
    ])

    const youtubeRawData = youtubeRes?.data?.data?.[0];
    const influencerData = influencerRes

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
      dailyAvgViews: youtubeRawData.dailyAvgViews ?? 0,
      monthlyAvgViews: youtubeRawData.monthlyAvgViews ?? 0,
      age1824: youtubeRawData.age1824 ?? 0,
      age2534: youtubeRawData.age2534 ?? 0,
      age3544: youtubeRawData.age3544 ?? 0,
      age4554: youtubeRawData.age4554 ?? 0,
      genderMale: youtubeRawData.genderMale ?? 0,
      genderFemale: youtubeRawData.genderFemale ?? 0,
      subscribedRatio: youtubeRawData.subscribedRatio ?? 0,
      notSubscribedRatio: youtubeRawData.notSubscribedRatio ?? 0,

      shortsSummary: {
        totalVideos: youtubeRawData.totalVideos ?? 0,
        averageViewCount: youtubeRawData.avgViews ?? 0,
        commentCount: youtubeRawData.avgComments ?? 0,
        likeCount: youtubeRawData.avgLikes ?? 0
      },
      popularVideos: [],
      popularShorts: [],
      subscribersTrend: [],
      reach: 0,
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
