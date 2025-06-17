<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router'
import ApexCharts from 'vue3-apexcharts'

const route = useRoute()
const campaignId = route.query.id || '1'

const campaign = ref(null)
const meta = ref(null)
const rows = ref([])
const isLoading = ref(false)
const isError = ref(false)

const sourceLabelMap = {
  YT_SEARCH: '유튜브 검색',
  RELATED_VIDEO: '추천 동영상',
  EXTERNAL: '외부 유입',
  PLAYLIST: '재생목록',
  NOTIFICATION: '알림'
}

const fetchAllData = async () => {
  isLoading.value = true
  try {
    // 캠페인
    const campaignRes = await fetch(`/api/v1/campaign/${campaignId}`)
    const campaignData = await campaignRes.json()
    campaign.value = campaignData.data

    // 메타 데이터 (유튜브 영상 통계)
    const metaRes = await fetch(`/api/v1/youtube/video?campaignId=${campaignId}`)
    const metaData = await metaRes.json()
    meta.value = metaData

    // 유입경로 데이터
    const trafficRes = await fetch(`/api/v1/youtube/traffic-sources?campaignId=${campaignId}&groupType=daily`)
    const trafficData = await trafficRes.json()
    rows.value = trafficData.rows

  } catch (err) {
    isError.value = true
  } finally {
    isLoading.value = false
  }
}

onMounted(fetchAllData)

const metrics = computed(() => {
  if (!campaign.value || !meta.value) return {}

  const revenue = campaign.value.expectedRevenue ?? 0 // 예상 수익
  const adCost = campaign.value.adCost ?? 3000000 // 광고 단가
  const productPrice = campaign.value.productPrice ?? 1 // 상품 단가
  const sales = productPrice ? Math.round(revenue / productPrice) : 0 // 판매 수량
  const views = meta.value?.statistics?.viewCount ?? 0  // 해당 캠페인 영상 조회 수
  const subscriberGrowth = meta.value?.statistics?.subscriberCount ?? 0 // 구독자 수 증가 : 종료날짜 구독자 - 시작날짜 구독자

  return {
    revenue,
    roas: adCost ? (revenue / adCost).toFixed(1) : 0,
    conversionRate: views ? ((sales / views) * 100).toFixed(1) : 0,
    subscriberGrowth
  }
})

const series = computed(() => rows.value.map(row => row[1]))
const labels = computed(() => rows.value.map(row => sourceLabelMap[row[0]]))

const chartOptions = computed(() => ({
  labels: labels.value,
  colors: ['#FF65DE', '#BA8FFF', '#4DC7FF', '#81FF85', '#FFE88D'],
  legend: { position: 'bottom' },
  dataLabels: {
    enabled: true,
    formatter: (val) => `${val.toFixed(0)}%`,
    style: { fontSize: '16px', fontWeight: 600, colors: ['#FFFFFF'] }
  },
  plotOptions: { pie: { donut: { size: '60%' } } },
  stroke: { show: false },
  tooltip: {
    y: { formatter: (val) => `${val.toLocaleString()}회` }
  }
}))
</script>

<template>
  <div class="dashboard-section w-full flex flex-wrap justify-around items-start gap-5">
    <div class="flex flex-col gap-5">
      <div class="dashboard-title">유입 분석</div>
      <div class="flex gap-5">
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[200px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">구독자 수</div>
          <div class="text-xl text-red-400 font-bold">{{ metrics.subscriberGrowth }} ↑</div>
        </div>
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[200px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">전환율</div>
          <div class="text-xl text-red-400 font-bold">{{ metrics.conversionRate }}%</div>
        </div>
      </div>

      <div class="flex gap-5">
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[200px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">ROAS</div>
          <div class="text-xl text-red-400 font-bold">x {{ metrics.roas }}</div>
        </div>
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[200px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">예상 수익</div>
          <div class="text-xl text-red-400 font-bold">₩ {{ metrics.revenue?.toLocaleString() }}</div>
        </div>
      </div>

      <div class="text-xs text-gray-medium leading-relaxed">
        ※ 전환율: 콘텐츠를 시청한 사람이 실제 구매를 한 비율<br/>
        ※ ROAS: 광고비 1원을 썼을 때 얼마 벌었는지 보여주는 지표
      </div>
    </div>

    <div class="relative bg-background p-6 rounded-3xl shadow flex items-center justify-center">
      <div class="relative w-[320px]">
        <ApexCharts type="donut" width="320" :series="series" :options="chartOptions" />
        <div class="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div class="text-md font-medium">영상유입 경로</div>
        </div>
      </div>
    </div>

  </div>
</template>
