<script setup>

const props = defineProps({
  summary: {
    type: Object,
    required: true,
    default: () => ({
      totalRevenue: 0,
      avgPrice: 0,
      totalSales: 0,
      estimatedRevenue: 0,
      roas: 0,
      conversionRate: 0
    })
  }
})

const formatCurrency = (val) => `₩ ${(val ?? 0).toLocaleString()}`
const formatNumber = (val) => `${(val ?? 0).toLocaleString()} 개`
const formatPercent = (val) => `${(val ?? 0)}%`
const formatRoas = (val) => `x ${(val ?? 0)}`
</script>

<template>
  <div class="flex flex-col gap-5">
    <div class="dashboard-title">수익 요약</div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div class="bg-background rounded-xl px-6 py-4 shadow text-center flex flex-col justify-between min-h-[85px]">
        <div class="text-sm">판매 수</div>
        <div class="text-xl text-red-400 font-bold">{{ formatNumber(summary.totalSales) }}</div>
      </div>

      <div class="bg-background rounded-xl px-6 py-4 shadow text-center flex flex-col justify-between min-h-[85px]">
        <div class="text-sm">평균 단가</div>
        <div class="text-xl text-red-400 font-bold">{{ formatCurrency(summary.avgPrice) }}</div>
      </div>

      <div class="bg-background rounded-xl px-6 py-4 shadow text-center flex flex-col justify-between min-h-[85px]">
        <div class="text-sm">총 이익</div>
        <div class="text-xl text-red-400 font-bold">{{ formatCurrency(summary.totalRevenue) }}</div>
      </div>

      <div class="bg-background rounded-xl px-6 py-4 shadow text-center flex flex-col justify-between min-h-[85px]">
        <div class="text-sm">예상 수익</div>
        <div class="text-xl text-red-400 font-bold">{{ formatCurrency(summary.estimatedRevenue) }}</div>
      </div>

      <div class="bg-background rounded-xl px-6 py-4 shadow text-center flex flex-col justify-between min-h-[85px]">
        <div class="text-sm">ROAS</div>
        <div class="text-xl text-red-400 font-bold">{{ formatRoas(summary.roas) }}</div>
      </div>

      <div class="bg-background rounded-xl px-6 py-4 shadow text-center flex flex-col justify-between min-h-[85px]">
        <div class="text-sm">전환율</div>
        <div class="text-xl text-red-400 font-bold">{{ formatPercent(summary.conversionRate) }}</div>
      </div>
    </div>

    <div class="mt-4 text-xs text-gray-medium leading-relaxed">
      ※ 평균 단가 : 총 수익 / 판매 수량<br />
      ※ ROAS : 광고비 1원을 썼을 때 얼마 벌었는지 보여주는 지표<br />
      ※ 전환율 : 콘텐츠를 시청한 사람이 실제 구매를 한 비율
    </div>
  </div>
</template>
