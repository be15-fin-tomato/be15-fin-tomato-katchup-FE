<script setup>
import ApexCharts from 'vue3-apexcharts'
import { computed } from 'vue'
import { formatNumber } from '@/utils/fomatters.js';

const props = defineProps({
  platform: String,
  reach: Number,
  followerRate: Number,
  nonFollowerRate: Number
})

const series = computed(() => {
  if (props.followerRate == null || props.nonFollowerRate == null) return []
  return [props.followerRate, props.nonFollowerRate]
})

const labels = ['팔로워', '팔로워가 아닌 사람']

const getTitle = () => {
  return props.platform === 'instagram' ? '도달' : '노출';
}

const getReachText = () => {
  return props.platform === 'instagram' ? '도달한 계정' : '노출 수';
}
</script>

<template>
  <div class="dashboard-section">
    <h3 class="dashboard-title">{{ getTitle() }}</h3>

    <div class="flex justify-center items-center mt-6">
      <div class="relative">
        <ApexCharts
          v-if="series && series.length > 0"
          type="donut"
          width="300"
          :series="series"
          :options="{
            labels,
            colors: ['#FF62B3', '#8F87F1'],
            stroke: { show: false },
            legend: { position: 'bottom' },
            dataLabels: { enabled: false },
            tooltip: {
              y: {
                formatter: function (val) {
                  return `${val.toFixed(1)}%`;
                }
              }
            }
          }"
        />

        <div v-if="series && series.length > 0"
             class="absolute top-[46%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
          <div class="text-3xl font-extrabold">{{ (formatNumber(props.reach)) }}</div>
          <div class="text-gray-400 text-sm mt-1">{{ getReachText() }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
