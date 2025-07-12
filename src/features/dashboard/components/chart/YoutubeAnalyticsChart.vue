<script setup>
import { computed } from 'vue';
import ApexCharts from 'vue3-apexcharts';

const props = defineProps({
  rows: Array, // rows는 이제 객체 배열을 예상합니다. 예: [{ date: '...', views: ..., comments: ... }]
  activeMetric: String,
});

// rows 배열의 각 객체에서 'date' 속성을 가져오도록 변경
const categories = computed(() => props.rows.map(row => row.date));

const metricKeyMap = {
  '조회수': 'views',
  '댓글수': 'comments',
  '좋아요수': 'likes',
  '클릭수': 'clicks', // 클릭수도 추가 (목 데이터에 포함시킬 경우)
};

const chartSeries = computed(() => {
  const key = metricKeyMap[props.activeMetric];
  // rows 배열의 각 객체에서 해당 metric의 값을 가져오도록 변경
  const data = props.rows.map(row => row[key] || 0);

  return [
    { name: props.activeMetric, type: 'column', data },
    { name: props.activeMetric + ' 트렌드', type: 'line', data } // 트렌드 이름 변경 (선택 사항)
  ];
});

const chartOptions = computed(() => ({
  chart: {
    height: 200,
    type: 'line',
    stacked: false,
    toolbar: { show: false } // 툴바 숨김
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
    strokeColors: '#DA001A', // 기본 색상에서 변경
    hover: { sizeOffset: 3 }
  },
  xaxis: {
    categories: categories.value,
    labels: { style: { fontSize: '12px', colors: '#333' } } // 폰트 스타일 추가
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
    enabledOnSeries: [1], // 라인 차트에만 데이터 레이블 표시
    formatter: (val) => val.toLocaleString(),
    offsetY: -10,
    style: {
      fontSize: '12px',
      fontWeight: '500',
      colors: ['#000000'] // 데이터 레이블 색상
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
