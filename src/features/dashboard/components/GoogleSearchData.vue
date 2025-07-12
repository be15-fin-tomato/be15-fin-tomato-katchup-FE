<script setup>
import { computed } from 'vue';
import ApexCharts from 'vue3-apexcharts';
import { Icon } from '@iconify/vue';

const props = defineProps({
  data: { type: Object, required: true },
  title: { type: String, required: true },
  publishedAt: { type: String, required: true } // ISO 8601 문자열을 기대
});

const formattedPublishedAt = computed(() => {
  if (!props.publishedAt) return '날짜 정보 없음';

  const date = new Date(props.publishedAt);
  // 유효하지 않은 Date 객체인지 확인
  if (isNaN(date.getTime())) {
    console.warn('GoogleSearchData: Invalid publishedAt value received:', props.publishedAt);
    return '유효하지 않은 날짜'; // 또는 다른 기본값
  }
  return date.toISOString().slice(0, 10); // 'YYYY-MM-DD'
});

const parsedData = computed(() => {
  // data.default.timelineData의 존재 여부 확인
  if (!props.data?.default?.timelineData || !Array.isArray(props.data.default.timelineData)) {
    return [];
  }
  return props.data.default.timelineData.map(item => ({
    // time이 UNIX timestamp (초)라고 가정하고 Date 객체로 변환
    x: new Date(item.time * 1000).toISOString().slice(0, 10),
    y: item.value[0]
  }));
});

const series = computed(() => [
  {
    name: '검색 비율',
    data: parsedData.value
  }
]);

const chartOptions = computed(() => ({ // computed로 감싸서 반응성 확보
  chart: { toolbar: { show: false } },
  stroke: { curve: 'straight', width: 3 },
  markers: {
    size: 5,
    colors: ['#FFEA00'],
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
    categories: parsedData.value.map(item => item.x) // x축 카테고리 명시
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 5,
    labels: { style: { fontSize: '12px', colors: '#333' } }
  },
  colors: ['#FFEA00'],
  tooltip: {
    x: { format: 'yyyy-MM-dd' }
  },
  annotations: {
    xaxis: [
      {
        x: formattedPublishedAt.value, // computed 속성 사용 시 .value
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
    <Icon icon="devicon:google" class="w-11 h-11 ml-2" />
    <div v-if="parsedData.length === 0" class="text-center text-gray-500 py-10">
      구글 검색 트렌드 데이터가 없습니다.
    </div>
    <div v-else>
      <ApexCharts type="line" height="300" :options="chartOptions" :series="series" />
    </div>
  </div>
</template>
