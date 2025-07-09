<script setup>
import ApexCharts from 'vue3-apexcharts'
import { Icon } from '@iconify/vue'
import { formatNumber } from '@/utils/fomatters.js';

const props = defineProps({
  platform: String,
  daily: Number,
  monthly: Number
})

const series = [{
  data: [props.daily, props.monthly]
}]

const categories = ['일 평균 조회 수', '월 평균 조회 수']

const getDailyTooltip = () => {
  return props.platform === 'instagram'
    ? '최근 90일간 하루 평균 릴스 조회수'
    : '최근 90일간 하루 평균 전체 조회수'
}

const getMonthlyTooltip = () => {
  return props.platform === 'instagram'
    ? '최근 1년간 월별 평균 릴스 조회수'
    : '최근 1년간 월별 평균 전체 조회수'
}
</script>

<template>
  <div class="dashboard-section">
    <div class="flex items-center mb-4 px-10 justify-between">
      <div class="flex items-center gap-1">
        <h3 class="font-bold text-gray-dark">일 평균 조회수</h3>
        <div class="relative group">
          <Icon icon="material-symbols:info-outline-rounded" class="w-5 h-5 text-gray-dark cursor-pointer" />
          <div class="absolute left-1/2 -translate-x-1/2 top-8 w-max bg-black text-white text-xs rounded px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 z-10">
            {{ getDailyTooltip() }}
          </div>
        </div>
      </div>

      <div class="flex items-center gap-1">
        <h3 class="font-bold text-gray-dark">월 평균 조회수</h3>
        <div class="relative group">
          <Icon icon="material-symbols:info-outline-rounded" class="w-5 h-5 text-gray-dark cursor-pointer" />
          <div class="absolute left-1/2 -translate-x-1/2 top-8 w-max bg-black text-white text-xs rounded px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 z-10">
            {{ getMonthlyTooltip() }}
          </div>
        </div>
      </div>
    </div>

    <div class="flex justify-center items-center ml-10 h-[300px]">
        <ApexCharts
          type="bar"
          height="250"
          :series="series"
          :options="{
            chart: { toolbar: { show: false } },
            colors: ['#5F38E9'],
            plotOptions: {
              bar: {
                columnWidth: '40%',
                borderRadius: 10,
                distributed: true
              }
            },
            dataLabels: {
              enabled: true,
              formatter: val =>  formatNumber(val),
              style: { fontSize: '20px', fontWeight: 'bold', colors: ['#5F38E9'] },
              offsetY: 140
            },
            xaxis: {
              categories,
              labels: { style: { fontSize: '14px', colors: 'black' } }
            },
            yaxis: { show: false },
            grid: { show: false }
          }"
        />
    </div>
  </div>
</template>
