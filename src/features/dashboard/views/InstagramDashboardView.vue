<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue'
import { useToast } from 'vue-toastification'

import DashboardBase from '@/features/dashboard/components/DashboardBase.vue'
import DashboardHeader from '@/features/dashboard/components/DashboardHeader.vue'
import PopularPosts from '@/features/dashboard/components/PopularPosts.vue'
import PopularShortForms from '@/features/dashboard/components/PopularShortForms.vue'
import DashboardCampaignList from '@/features/dashboard/components/DashboardCampaignList.vue'

const route = useRoute()
const router = useRouter()
const toast = useToast()

const dashboard = ref(null)
const influencer = ref(null)
const satisfaction = ref(92.5)
const influencerId = route.query.id

onMounted(async () => {
  try {
    const [dashboardRes, youtubeRes, influencerRes] = await Promise.all([
      fetch(`/api/v1/dashboard/instagram?id=${influencerId}`),
      fetch(`/api/v1/influencer/${influencerId}`),
      fetch(`/api/v1/dashboard/youtube?id=${influencerId}`)
    ])

    const dashboardData = await dashboardRes.json()
    const influencerData = await influencerRes.json()
    const youtubeData = await youtubeRes.json()

    if (!dashboardData.data) {
      if(youtubeData.data){
        toast.success("유튜브 대시보드로 이동")
        router.push(`/influencer/dashboard/youtube?id=${influencerId}`)
      } else {
        toast.warning('계정이 모두 연결되어있지 않습니다.')
        router.replace(`/influencer/list`)
      }
      return
    }

    dashboard.value = dashboardData.data
    influencer.value = influencerData.data

  } catch (err) {
    toast.error('데이터를 불러오지 못했습니다.')
  }
})

const summaryData = computed(() => {
  if (!dashboard.value?.reelsSummary) {
    return { shorts: 0, views: '0만', comments: '0개', likes: '0만' }
  }
  return {
    shorts: dashboard.value.reelsSummary.count,
    views: `${(dashboard.value.reelsSummary.avgViews / 10000).toFixed(1)}만`,
    comments: `${dashboard.value.reelsSummary.avgComments}개`,
    likes: `${(dashboard.value.reelsSummary.avgLikes / 10000).toFixed(1)}만`
  }
})

const formatFollowers = (num) => {
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

      <DashboardHeader
        :name="dashboard.title"
        :thumbnail="dashboard.thumbnail"
        :tags="dashboard.tags"
        :instaFollowers="formatFollowers(dashboard.instagram.followers)"
        :influencer="influencer"
      />

      <DashboardBase
        platform="instagram"
        :summaryData="summaryData"
        :data="dashboard"
        :satisfaction="satisfaction"
        @switch="goToPlatform"
      />

      <PopularPosts :platform="'instagram'" :items="dashboard.popularPosts" />
      <PopularShortForms :platform="'instagram'" :items="dashboard.popularReels" />
      <DashboardCampaignList />
    </div>

    <div v-else class="flex justify-center items-center w-full h-full">Loading...</div>
  </div>
</template>
