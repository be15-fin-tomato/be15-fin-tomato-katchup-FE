<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'

import YoutubeAnalyticsChart from '@/features/dashboard/components/chart/YoutubeAnalyticsChart.vue'
import AnalyticsFilters from '@/features/dashboard/components/AnalyticsFilters.vue'
import TrafficSourcesChart from '@/features/dashboard/components/chart/TrafficSourcesChart.vue'
import RevenueSummary from '@/features/dashboard/components/chart/RevenueSummary.vue'
import CampaignVideoSummary from '@/features/dashboard/components/chart/CampaignVideoSummary.vue'
import CampaignHeaderCard from '@/features/dashboard/components/CampaignHeaderCard.vue'
import NaverSearchData from '@/features/dashboard/components/NaverSearchData.vue'
import GoogleSearchData from '@/features/dashboard/components/GoogleSearchData.vue'

const route = useRoute()

const campaignId = computed(() => route.query.id || '1')

const campaign = ref(null)
const influencer = ref(null)
const rows = ref([])
const meta = ref(null)
const searchDataRows = ref([])
const googleTrendsData = ref(null)

const activeMetric = ref('조회수')
const activePeriod = ref('일간')
const isLoading = ref(true)
const isError = ref(false)

const periodKeyMap = {
  '일간': 'daily',
  '주간': 'weekly',
  '월간': 'monthly'
}

const fetchCampaignAndInfluencer = async () => {
  const res = await fetch(`/api/v1/campaign/${campaignId.value}`)
  const data = await res.json()
  campaign.value = data.data

  const influencerRes = await fetch(`/api/v1/influencer/${data.data.influencerId}`)
  const influencerData = await influencerRes.json()
  influencer.value = influencerData.data
}

const fetchYoutubeAnalytics = async () => {
  const groupType = periodKeyMap[activePeriod.value]
  const res = await fetch(`/api/v1/youtube/analytics?campaignId=${campaignId.value}&groupType=${groupType}`)
  const data = await res.json()
  rows.value = data.rows
}

const fetchYoutubeMeta = async () => {
  const res = await fetch(`/api/v1/youtube/video?campaignId=${campaignId.value}`)
  const data = await res.json()
  meta.value = data
}

const fetchNaverSearch = async () => {
  const res = await fetch(`/api/v1/dashboard/naver?id=${campaignId.value}`)
  const data = await res.json()
  searchDataRows.value = data.results[0]?.data || []
}

const fetchGoogleTrends = async () => {
  const res = await fetch(`/api/v1/dashboard/google/trends`)
  const data = await res.json()
  googleTrendsData.value = data
}

const fetchAll = async () => {
  isLoading.value = true
  isError.value = false
  try {
    await Promise.all([
      fetchCampaignAndInfluencer(),
      fetchYoutubeAnalytics(),
      fetchYoutubeMeta(),
      fetchNaverSearch(),
      fetchGoogleTrends()
    ])
  } catch (err) {
    isError.value = true
    console.error('데이터 로딩 실패:', err)
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAll)

const onPeriodChange = async (period) => {
  activePeriod.value = period
  await fetchYoutubeAnalytics()
}

const summary = computed(() => {
  if (!campaign.value) return {}

  const revenue = campaign.value.expectedRevenue || 0
  const unitPrice = campaign.value.productPrice || 0
  const totalSales = unitPrice ? Math.round(revenue / unitPrice) : 0

  return {
    totalRevenue: revenue,
    avgPrice: unitPrice,
    totalSales,
    paymentDate: campaign.value.endDate
  }
})
</script>

<template>
  <div class="w-full min-h-screen flex flex-col">
    <!-- 로딩 상태 -->
    <div v-if="isLoading" class="flex justify-center items-center w-full h-full">Loading...</div>

    <!-- 에러 상태 -->
    <div v-else-if="isError" class="flex justify-center items-center w-full h-full">
      데이터를 불러오지 못했습니다.
    </div>

    <!-- 정상 렌더링 -->
    <div v-else>
      <CampaignHeaderCard :campaign="campaign" :influencer="influencer" />
      <CampaignVideoSummary :meta="meta" />

      <div class="dashboard-section mb-4">
        <AnalyticsFilters
          :activeMetric="activeMetric"
          :activePeriod="activePeriod"
          @update:metric="activeMetric = $event"
          @update:period="onPeriodChange"
        />
        <YoutubeAnalyticsChart :rows="rows" :activeMetric="activeMetric" />
      </div>

      <div class="flex gap-8">
        <div class="w-[65%]">
          <TrafficSourcesChart />
        </div>
        <div class="w-[35%]">
          <RevenueSummary :summary="summary" />
        </div>
      </div>

      <div class="flex flex-col w-full mt-6">
        <NaverSearchData
          :rows="searchDataRows"
          :title="campaign?.productName"
          :publishedAt="meta?.publishedAt"
        />
        <GoogleSearchData
          v-if="googleTrendsData"
          :data="googleTrendsData"
          :title="campaign?.productName"
          :publishedAt="meta?.publishedAt"
        />
      </div>
    </div>
  </div>
</template>
