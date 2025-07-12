<script setup>
import { computed } from 'vue';
import ApexCharts from 'vue3-apexcharts'; // ApexCharts 사용하는 경우
import { Icon } from '@iconify/vue'; // Icon 사용하는 경우

const props = defineProps({
  rows: { type: Array, required: true }, // CampaignResultDashboardView에서 naverSearchDataRows를 받음
  title: { type: String, required: true },
  publishedAt: { type: String, required: true } // 날짜 관련 prop
});

// 날짜 데이터 가공 (GoogleSearchData.vue와 유사하게 유효성 검사 필요)
const formattedPublishedAt = computed(() => {
  if (!props.publishedAt) return '날짜 정보 없음';
  const date = new Date(props.publishedAt);
  if (isNaN(date.getTime())) {
    console.warn('NaverSearchData: Invalid publishedAt value received:', props.publishedAt);
    return '유효하지 않은 날짜';
  }
  return date.toISOString().slice(0, 10);
});

const seriesData = computed(() => {
  if (!props.rows || !Array.isArray(props.rows) || props.rows.length === 0) {
    return [];
  }
  return props.rows.map(item => item.ratio);
});

const categories = computed(() => {
  if (!props.rows || !Array.isArray(props.rows) || props.rows.length === 0) {
    return [];
  }
  return props.rows.map(item => item.period); // '2023-01-01' 같은 문자열
});

const series = computed(() => [
  {
    name: '검색 비율',
    data: seriesData.value
  }
]);

const chartOptions = computed(() => ({
  chart: {
    toolbar: { show: false }
  },
  stroke: { curve: 'straight', width: 3 },
  markers: {
    size: 5,
    colors: ['#03C75A'], // 네이버 초록색
    strokeColors: '#fff',
    strokeWidth: 2
  },
  title: {
    text: `검색 트렌드 (${props.title})`,
    align: 'right',
    style: { fontSize: '14px', colors: '#333' }
  },
  xaxis: {
    type: 'category',
    labels: {
      style: { fontSize: '12px', colors: '#333' }
    },
    categories: categories.value
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 5,
    labels: { style: { fontSize: '12px', colors: '#333' } }
  },
  colors: ['#03C75A'],
  tooltip: {
    x: { format: 'yyyy-MM-dd' }
  },
  annotations: {
    xaxis: [
      {
        x: formattedPublishedAt.value,
        borderColor: '#1CAFFF',
        label: {
          style: { color: '#fff', background: '#83D4FF' },
          text: '업로드일',
          position: 'top'
        }
      }
    ]
  }
}));
</script>

<template>
  <div class="dashboard-section p-6 bg-white rounded-xl shadow mt-6">
    <Icon icon="simple-icons:naver" class="w-11 h-11 ml-2" /> <div v-if="seriesData.length === 0" class="text-center text-gray-500 py-10">
    네이버 검색 트렌드 데이터가 없습니다.
  </div>
    <div v-else>
      <ApexCharts type="line" height="300" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>
