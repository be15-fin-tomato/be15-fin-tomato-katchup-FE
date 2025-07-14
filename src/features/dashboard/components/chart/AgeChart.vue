<script setup>
import ApexCharts from 'vue3-apexcharts';
import { ref, reactive, computed, watch, nextTick } from 'vue';

const props = defineProps({
  platform: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  }
});

console.log('AgeChart 초기 로드 - 받은 props.data:', props.data);

const chartSeries = ref([]);
const chartCategories = ref([]);

const chartOptions = reactive({
  chart: {
    toolbar: { show: false },
    id: 'age-chart-' + props.platform,
    animations: {
      enabled: true,
      easing: 'easeinout',
      speed: 800,
      animateGradually: {
        enabled: true,
        delay: 150
      },
      dynamicAnimation: {
        enabled: true,
        speed: 350
      }
    }
  },
  colors: ['#5F38E9'],
  plotOptions: {
    bar: {
      borderRadius: 10,
      columnWidth: '35%',
      dataLabels: {
        position: 'top'
      }
    }
  },
  dataLabels: {
    enabled: true,
    formatter: val => `${val}%`,
    offsetY: -20,
    style: {
      fontSize: '12px',
      colors: ['#304758']
    }
  },
  xaxis: {
    categories: chartCategories.value,
    labels: { style: { fontSize: '14px', colors: '#333' } }
  },
  yaxis: {
    show: false,
    labels: { formatter: val => `${val}%` }
  },
  grid: { show: false },
  tooltip: {
    y: {
      formatter: function (val) {
        return `${val}%`
      }
    }
  }
});

const chartTitle = computed(() => props.platform === 'instagram' ? '팔로워 연령대' : '구독자 연령대');

watch(() => props.data, async (newData) => {
  console.log('AgeChart - watch 훅 트리거됨 (새 데이터):', newData);
  if (newData) {
    const ageGroups = [
      { ageRange: '13-17', value: newData.age1317 ?? 0 },
      { ageRange: '18-24', value: newData.age1824 ?? 0 },
      { ageRange: '25-34', value: newData.age2534 ?? 0 },
      { ageRange: '35-44', value: newData.age3544 ?? 0 },
      { ageRange: '45-54', value: newData.age4554 ?? 0 },
      { ageRange: '55-64', value: newData.age5564 ?? 0 },
      { ageRange: '65+', value: newData.age65plus ?? 0 },
    ];

    const total = ageGroups.reduce((sum, group) => sum + group.value, 0);

    const resultPercentages = ageGroups.map(group => ({
      ageRange: group.ageRange,
      percentage: total === 0 ? 0 : parseFloat(((group.value / total) * 100).toFixed(1)),
    }));

    chartSeries.value = [{
      name: props.platform === 'instagram' ? '팔로워 비율' : '구독자 비율',
      data: resultPercentages.map(item => item.percentage)
    }];
    chartCategories.value = resultPercentages.map(item => `만 ${item.ageRange}세`);

    await nextTick();

    chartOptions.xaxis.categories = chartCategories.value;
  }
}, { immediate: true, deep: true });
</script>

<template>
  <div class="dashboard-section">
    <p class="dashboard-title">{{ chartTitle }}</p>

    <div v-if="chartSeries.length > 0 && chartSeries[0].data && Array.isArray(chartSeries[0].data)">
      <ApexCharts
        type="bar"
        height="250"
        :series="chartSeries" :options="chartOptions" :key="platform + JSON.stringify(props.data)"
      />
    </div>
    <div v-else class="flex justify-center items-center h-[250px] text-gray-500">
      연령대 데이터를 불러오는 중이거나 없습니다.
    </div>
  </div>
</template>
