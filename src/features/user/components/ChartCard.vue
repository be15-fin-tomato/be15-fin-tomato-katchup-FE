<template>
  <div class="w-full border border-gray-medium rounded-xl bg-white shadow-sm px-5 pt-5 pb-0.5 hover:bg-gray-100 transition-colors duration-200">
    <div class="flex justify-between items-start">
      <div class="flex flex-col justify-between min-h-[80px]">
        <h3 class="text-lg font-semibold text-black mb-4">조사 응답률</h3>
      </div>
      <!-- 중앙 정렬용 wrapper -->
      <div class="flex justify-center items-center flex-1">
        <DoughnutChart />
      </div>
    </div>
  </div>
</template>

<script setup>
import DoughnutChart from '@/features/user/components/DoughnutChart.vue'
</script>
