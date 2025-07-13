<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue'
import { useToast } from 'vue-toastification'

import DashboardBase from '@/features/dashboard/components/DashboardBase.vue'
import DashboardHeader from '@/features/dashboard/components/DashboardHeader.vue'
import PopularPosts from '@/features/dashboard/components/PopularPosts.vue'
import {
  fetchInfluencerDetail,
  fetchInstagramInfo,
  fetchSatisfaction,
} from '@/features/dashboard/api.js';
import { formatNumber } from '@/utils/fomatters.js';
import PopularShortForms from '@/features/dashboard/components/PopularShortForms.vue';
import DashboardCampaignList from '@/features/dashboard/components/DashboardCampaignList.vue';

const route = useRoute()
const router = useRouter()
const toast = useToast()

const dashboard = ref(null)
const influencer = ref(null)
const satisfaction = ref(0)
const influencerId = route.query.id

onMounted(async () => {
  try {
    const [instagramRes, influencerRes, satisfactionRes] = await Promise.all([
      fetchInstagramInfo(influencerId),
      fetchInfluencerDetail(influencerId),
      fetchSatisfaction(influencerId),
    ])
    console.log(instagramRes)

    const dashboardData = instagramRes?.data?.data;
    const influencerData = influencerRes
    const satisfactionData = satisfactionRes?.data?.data;

    if (!dashboardData) {
      if(influencerData?.youtube){
        toast.success("인스타그램 데이터가 없어 유튜브 대시보드로 이동합니다.")
        router.push(`/influencer/dashboard/youtube?id=${influencerId}`)
      } else {
        toast.warning('계정이 모두 연결되어 있지 않습니다.')
        router.replace(`/influencer/list`)
      }
      return;
    }

    dashboard.value = dashboardData;
    influencer.value = influencerData;
    satisfaction.value = satisfactionData ?? 0;

  } catch (err) {
    toast.error('데이터를 불러오지 못했습니다.');
    console.error('💥 Instagram Dashboard Error:', err);
    dashboard.value = null;
    satisfaction.value = 0;
  }
});

const summaryData = computed(() => {
  if (!dashboard.value) {
    return {
      totalPosts: '0개', avgViews: '0만', avgComments: '0개', avgLikes: '0만'
    }
  }

  const totalPosts = formatNumber(dashboard.value.totalPosts ?? 0);
  const avgViews = formatNumber(dashboard.value.avgViews ?? 0);
  const avgComments = formatNumber(dashboard.value.avgComments ?? 0);
  const avgLikes = formatNumber(dashboard.value.avgLikes ?? 0);

  return {
    totalPosts: `${totalPosts}개`,
    avgViews: `${avgViews}회`,
    avgComments: `${avgComments}개`,
    avgLikes: `${avgLikes}개`
  }
})

const goToPlatform = (platform) => {
  router.push(`/influencer/dashboard/${platform}?id=${influencerId}`)
}

const goToList = () => {
  router.push(`/influencer/list`)
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
        platform="instagram"
        :summaryData="summaryData"
        :data="dashboard"
        :satisfaction="satisfaction"
        @switch="goToPlatform"
      />

      <PopularPosts :platform="'instagram'" :items="dashboard.mediaSnapshots" />
      <PopularShortForms :platform="'instagram'" :items="dashboard.mediaSnapshots" />
      <DashboardCampaignList :influencer-id="influencerId" />
    </div>

    <div v-else class="flex justify-center items-center w-full h-full">Loading...</div>
  </div>
</template>
