<script setup>
const props = defineProps({
  summary: {
    type: Object,
    required: true,
    default: () => ({
      totalRevenue: 0,
      avgPrice: 0,
      totalSales: 0,
      paymentDate: '-'
    })
  }
})

const formatCurrency = (val) => `₩ ${(val ?? 0).toLocaleString()}`
const formatNumber = (val) => `${(val ?? 0).toLocaleString()} 개`
const formatDate = (val) => {
  if (!val) return '-'
  return val.replace(/-/g, '.')
}
</script>

<template>
  <div class="dashboard-section">
    <div class="flex flex-col gap-5 justify-around">
      <div class="dashboard-title">수익 요약</div>
      <div class="flex gap-5">
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[230px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">총 이익</div>
          <div class="text-xl text-red-400 font-bold">{{ formatCurrency(summary.totalRevenue) }}</div>
        </div>
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[230px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">평균 단가</div>
          <div class="text-xl text-red-400 font-bold">{{ formatCurrency(summary.avgPrice) }}</div>
        </div>
      </div>

      <div class="flex gap-5">
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[230px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">판매수</div>
          <div class="text-xl text-red-400 font-bold">{{ formatNumber(summary.totalSales) }}</div>
        </div>
        <div class="bg-background rounded-xl px-6 py-4 shadow text-center w-[230px] h-[85px] flex flex-col justify-between">
          <div class="text-sm">지급일</div>
          <div class="text-xl text-red-400 font-bold">{{ formatDate(summary.paymentDate) }}</div>
        </div>
      </div>

      <div class="text-xs text-gray-medium leading-relaxed mt-5">
        ※ 평균 단가 : 총 수익 / 판매 수량
      </div>
    </div>
  </div>
</template>
