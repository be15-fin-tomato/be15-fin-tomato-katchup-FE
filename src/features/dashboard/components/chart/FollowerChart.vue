<script setup>
import { ref, computed } from 'vue';
import ApexCharts from 'vue3-apexcharts'

const props = defineProps({
  platform: String,
  data: {
    type: Object,
    required: true,
    default: () => ({
      daily: [], weekly: [], monthly: []
    })
  }
});

const activePeriod = ref('monthly');

const chartData = computed(() => {
  const trend = props.data?.[activePeriod.value] ?? [];

  const categories = trend.map(item => (item.end_time || item.date)?.slice(0, 10));
  const series = trend.map(item => item.value / 10000);
  return { categories, series };
});

const chartOptions = {

}
</script>

<template>
  <div class="dashboard-section">
    <p class="dashboard-title">
      {{ platform === 'instagram' ? '팔로워 수 변화율' : '구독자 수 변화율' }}
    </p>

    <div class="flex gap-2 justify-end mr-5">
      <button
        v-for="period in ['daily', 'weekly', 'monthly']"
        :key="period"
        @click="activePeriod = period"
        :class="[
          'w-16 h-8 rounded-sm text-sm font-medium',
          activePeriod === period ? 'bg-click text-white' : 'bg-white border border-[#D1D5DB] text-click'
        ]"
      >
        {{ period === 'daily' ? '일간' : period === 'weekly' ? '주간' : '월간' }}
      </button>
    </div>

    <ApexCharts
      type="line"
      height="250"
      :series="[{ name: platform === 'instagram' ? '팔로워수' : '구독자수', data: chartData.series }]"
      :options="{
        chart: { toolbar: { show: false } },
        stroke: { curve: 'straight', width: 3 },
        markers: { size: 5, colors: ['#328E6F'], strokeColors: '#fff', strokeWidth: 2 },
        xaxis: {
          categories: chartData.categories,
          labels: { rotate: -45 }
        },
        yaxis: {
          labels: { formatter: val => `${val}만` }
        },
        colors: ['#328E6F'],
        tooltip: {
          y: { formatter: val => `${val}만` }
        }
      }"
    />
  </div>
</template>
