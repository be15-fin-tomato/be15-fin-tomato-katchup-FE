<script setup>
import { computed } from 'vue';
import ApexCharts from 'vue3-apexcharts';

const props = defineProps({
  rows: Array,
  activeMetric: String,
});

const categories = computed(() => props.rows.map(row => row.date));

const metricKeyMap = {
  '조회수': 'views',
  '댓글수': 'comments',
  '좋아요수': 'likes',
  '클릭수': 'clicks',
};

const chartSeries = computed(() => {
  const key = metricKeyMap[props.activeMetric];
  const data = props.rows.map(row => row[key] || 0);

  return [
    { name: props.activeMetric, type: 'column', data },
    { name: props.activeMetric + ' 트렌드', type: 'line', data }
  ];
});

const chartOptions = computed(() => ({
  chart: {
    height: 250, // 높이 조정
    type: 'line',
    stacked: false,
    toolbar: { show: false }
  },
  stroke: {
    width: [0, 1.5],
    curve: 'straight'
  },
  plotOptions: {
    bar: {
      columnWidth: '30%',
      borderRadius: 6,
      borderRadiusApplication: 'end'
    }
  },
  markers: {
    size: 3,
    shape: 'circle',
    colors: ['#ffffff'],
    strokeWidth: 2,
    strokeColors: '#DA001A',
    hover: { sizeOffset: 3 }
  },
  xaxis: {
    categories: categories.value, // dashboard에서 생성된 날짜 카테고리 사용
    labels: { style: { fontSize: '12px', colors: '#333' } }
  },
  yaxis: {
    labels: {
      formatter: (val) => val.toLocaleString()
    }
  },
  colors: ['#5F38E9', '#000000'],
  legend: { show: false },
  dataLabels: {
    enabled: true,
    enabledOnSeries: [1],
    formatter: (val) => val.toLocaleString(),
    offsetY: -10,
    style: {
      fontSize: '12px',
      fontWeight: '500',
      colors: ['#000000']
    },
    background: {
      enabled: true,
      backgroundColor: '#ffffff',
      foreColor: '#000000',
      padding: 6,
      borderRadius: 4,
      borderWidth: 1,
      borderColor: '#e0e0e0',
      opacity: 0.9,
    }
  },
  grid: {
    show: true,
    borderColor: '#e0e0e0',
    strokeDashArray: 4,
    xaxis: {
      lines: {
        show: false
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  }
}));

</script>

<template>
  <div class="p-6 bg-white rounded-xl shadow">
    <h2 class="text-lg font-semibold mb-4">기간별 데이터</h2>
    <div v-if="props.rows.length === 0" class="text-center text-gray-500 py-10">
      데이터가 없습니다.
    </div>
    <div v-else>
      <ApexCharts type="line" height="250" :series="chartSeries" :options="chartOptions" />
    </div>
  </div>
</template>
