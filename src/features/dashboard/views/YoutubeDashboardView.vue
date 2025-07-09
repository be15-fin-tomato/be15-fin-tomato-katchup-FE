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

onMounted(async () => {
  try {
    const [youtubeRes, influencerRes] = await Promise.all([
      fetchYoutubeInfo(influencerId),    // YouTube 대시보드 데이터
      fetchInfluencerDetail(influencerId) // 인플루언서 프로필 정보
    ])

    const youtubeData = youtubeRes?.data?.data
    const influencerData = influencerRes

    if (!youtubeData) {
      toast.warning('YouTube 계정이 연결되어있지 않습니다.')
      router.replace('/influencer/list')
      return
    }

    dashboard.value = youtubeData
    influencer.value = influencerData

  } catch (err) {
    toast.error('데이터를 불러오지 못했습니다.')
    console.error('💥 YouTube Dashboard Error:', err)
  }
})

const summaryData = computed(() => {
  const summary = dashboard.value?.shortsSummary
  if (!summary) return { shorts: 0, views: '0만', comments: '0개', likes: '0만' }

  return {
    shorts: summary.count ?? 0,
    views: `${(summary.averageViewCount / 10000).toFixed(1)}만`,
    comments: `${summary.commentCount ?? 0}개`,
    likes: `${(summary.likeCount / 10000).toFixed(1)}만`
  }
})

const formatSubscribers = (num) => {
  const parsedNum = parseInt(num)
  return parsedNum >= 10000 ? `${Math.floor(parsedNum / 10000)}만명` : `${parsedNum}명`
}

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

<!--      <DashboardBase-->
<!--        platform="youtube"-->
<!--        :summaryData="summaryData"-->
<!--        :data="dashboard"-->
<!--        :satisfaction="satisfaction"-->
<!--        @switch="goToPlatform"-->
<!--      />-->

<!--      <PopularPosts :platform="'youtube'" :items="dashboard.popularVideos" />-->
<!--      <PopularShortForms :platform="'youtube'" :items="dashboard.popularShorts" />-->
<!--      <DashboardCampaignList />-->
    </div>

    <div v-else class="flex justify-center items-center w-full h-full">Loading...</div>
  </div>
</template>
