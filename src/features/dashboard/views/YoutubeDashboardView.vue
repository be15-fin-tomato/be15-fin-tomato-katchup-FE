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

const route = useRoute()
const router = useRouter()
const toast = useToast()

const dashboard = ref(null)
const influencer = ref(null)
const satisfaction = ref(82.5)
const influencerId = route.query.id

onMounted(async () => {
  try {
    const [dashboardRes, influencerRes, instagramRes] = await Promise.all([
      fetch(`/api/v1/dashboard/youtube?id=${influencerId}`),
      fetch(`/api/v1/influencer/${influencerId}`),
      fetch(`/api/v1/dashboard/instagram?id=${influencerId}`)
    ])

    const dashboardData = await dashboardRes.json()
    const influencerData = await influencerRes.json()
    const instagramData = await instagramRes.json()

    if (!dashboardData.data) {
      if(instagramData.data){
        toast.success("인스타그램 대시보드로 이동")
        router.push(`/influencer/dashboard/instagram?id=${influencerId}`)
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
  if (!dashboard.value?.shortsSummary) {
    return { shorts: 0, views: '0만', comments: '0개', likes: '0만' }
  }
  return {
    shorts: dashboard.value.shortsSummary.count,
    views: `${(dashboard.value.shortsSummary.averageViewCount / 10000).toFixed(1)}만`,
    comments: `${dashboard.value.shortsSummary.commentCount}개`,
    likes: `${(dashboard.value.shortsSummary.likeCount / 10000).toFixed(1)}만`
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

      <DashboardHeader
        :name="dashboard.channel.title"
        :thumbnail="dashboard.channel.thumbnails.default.url"
        :tags="dashboard.tags"
        :subscribers="formatSubscribers(dashboard.channel.statistics.subscriberCount)"
        :influencer="influencer"
      />

      <DashboardBase
        platform="youtube"
        :summaryData="summaryData"
        :data="dashboard"
        :satisfaction="satisfaction"
        @switch="goToPlatform"
      />

      <PopularPosts :platform="'youtube'" :items="dashboard.popularVideos" />
      <PopularShortForms :platform="'youtube'" :items="dashboard.popularShorts" />
      <DashboardCampaignList />
    </div>

    <div v-else class="flex justify-center items-center w-full h-full">Loading...</div>
  </div>
</template>
