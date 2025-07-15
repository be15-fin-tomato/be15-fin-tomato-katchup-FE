<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { Icon } from '@iconify/vue'
import { useToast } from 'vue-toastification'

import DashboardBase from '@/features/dashboard/components/DashboardBase.vue'
import DashboardHeader from '@/features/dashboard/components/DashboardHeader.vue'
import PopularPosts from '@/features/dashboard/components/PopularPosts.vue'
import DashboardCampaignList from '@/features/dashboard/components/DashboardCampaignList.vue'
import {
  fetchInfluencerDetail,
  fetchYoutubeInfo,
  fetchSatisfaction,
  fetchTopVideos, fetchInstagramInfo
} from '@/features/dashboard/api.js';
import { formatNumber } from '@/utils/fomatters.js';

const route = useRoute()
const router = useRouter()
const toast = useToast()

const dashboard = ref(null)
const influencer = ref(null)
const satisfaction = ref(null)
const topVideos = ref([])
const influencerId = route.query.id

onMounted(async () => {
  try {
    const [youtubeRes, instagramRes, influencerRes, satisfactionRes, topVideoRes] = await Promise.all([
      fetchYoutubeInfo(influencerId),
      fetchInstagramInfo(influencerId),
      fetchInfluencerDetail(influencerId),
      fetchSatisfaction(influencerId),
      fetchTopVideos(influencerId),
    ])

    const youtubeRawData = youtubeRes?.data?.data?.[0];
    const instagramRawData = instagramRes?.data?.data?.[0];
    const influencerData = influencerRes
    const satisfactionData = satisfactionRes?.data?.data;
    const topVideoListData = topVideoRes.data?.data || [];

    if (!youtubeRawData) {
      if(instagramRawData){
        toast.success("유튜브 데이터가 없어 유튜브 대시보드로 이동합니다.")
        router.replace(`/influencer/dashboard/instagram?id=${influencerId}`)
      } else {
        toast.warning('계정이 모두 연결되어 있지 않습니다.')
        router.replace(`/influencer/list`)
      }
      return;
    }

    dashboard.value = {
      totalVideos: youtubeRawData.totalVideos ?? 0,
      avgViews: youtubeRawData.avgViews ?? 0,
      avgLikes: youtubeRawData.avgLikes ?? 0,
      avgComments: youtubeRawData.avgComments ?? 0,
      dailyAvgViews: youtubeRawData.dailyAvgViews ?? 0,
      monthlyAvgViews: youtubeRawData.monthlyAvgViews ?? 0,

      age1317: youtubeRawData.age1317 ?? 0,
      age1824: youtubeRawData.age1824 ?? 0,
      age2534: youtubeRawData.age2534 ?? 0,
      age3544: youtubeRawData.age3544 ?? 0,
      age4554: youtubeRawData.age4554 ?? 0,
      age5564: youtubeRawData.age5564 ?? 0,
      age65plus: youtubeRawData.age65plus ?? 0,

      genderMale: youtubeRawData.genderMale ?? 0,
      genderFemale: youtubeRawData.genderFemale ?? 0,

      subscriberChangeDaily: youtubeRawData.subscriberChangeDaily ?? 0,
      subscriberChangeWeekly: youtubeRawData.subscriberChangeWeekly ?? 0,
      subscriberChangeMonthly: youtubeRawData.subscriberChangeMonthly ?? 0,

      subscribedRatio: youtubeRawData.subscribedRatio ?? 0,
      notSubscribedRatio: youtubeRawData.notSubscribedRatio ?? 0,

      shortsSummary: {
        totalVideos: youtubeRawData.totalVideos ?? 0,
        averageViewCount: youtubeRawData.avgViews ?? 0,
        commentCount: youtubeRawData.avgComments ?? 0,
        likeCount: youtubeRawData.avgLikes ?? 0
      },
    };

    influencer.value = influencerData;
    satisfaction.value = satisfactionData;
    topVideos.value = topVideoListData;
    console.info(satisfaction.value);

  } catch (err) {
    toast.error('데이터를 불러오지 못했습니다.');
    console.error('💥 YouTube Dashboard Error:', err);
    dashboard.value = null;
    satisfaction.value = null;
    topVideos.value = [];
  }
});

const summaryData = computed(() => {
  if (!dashboard.value) {
    return {
      totalVideos: '0개', avgViews: '0만', avgComments: '0개', avgLikes: '0만'
    }
  }

  const totalVideos = formatNumber(dashboard.value.totalVideos ?? 0);
  const avgViews = formatNumber(dashboard.value.avgViews ?? 0);
  const avgLikes = formatNumber(dashboard.value.avgLikes ?? 0);
  const avgComments = formatNumber(dashboard.value.avgComments ?? 0);

  return {
    totalVideos: `${totalVideos}개`,
    avgViews: `${avgViews}회`,
    avgComments: `${avgComments}개`,
    avgLikes: `${avgLikes}개`
  };
});

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

      <PopularPosts :platform="'youtube'" :items="topVideos" />
      <DashboardCampaignList :influencer-id="influencerId" />
    </div>

    <div v-else class="flex justify-center items-center w-full h-full">Loading...</div>
  </div>
</template>
