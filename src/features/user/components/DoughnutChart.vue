<script setup>
import { ref, onMounted } from 'vue';
import { Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { fetchSatisfactionResponseRate } from '@/features/user/api';

ChartJS.register(ChartDataLabels);
ChartJS.register(Title, Tooltip, Legend, ArcElement);

const chartKey = ref(0);

const chartData = ref({
  labels: ['응답', '미응답'],
  datasets: [
    {
      label: '응답 비율',
      data: [0, 100], // 기본값은 0%, 100%
      backgroundColor: ['#5F38E9', '#EAEAEA'],
      hoverOffset: 12,
    },
  ],
});

const chartOptions = {
  responsive: true,
  cutout: '45%',
  layout: {
    padding: 12,
  },
  plugins: {
    legend: {
      position: 'right',
      align: 'start',
    },
    datalabels: {
      color: ['#FFFFFF', '#000000'],
      formatter: (value, context) => {
        const total = context.dataset.data.reduce((a, b) => a + b, 0);
        const percentage = ((value / total) * 100).toFixed(0);
        return `${percentage}%`;
      },
      font: {
        weight: 'bold',
        size: 12,
      },
    },
  },
};

onMounted(async () => {
  try {
    const { data } = await fetchSatisfactionResponseRate();
    const rate = data.data.campaignResponseRate;
    console.log('rate :', rate);
    chartData.value.datasets[0].data = [rate, 100 - rate];
    chartKey.value++;
  } catch (err) {
    console.error('응답률 조회 실패:', err);
  }
});
</script>

<template>
  <div style="width: 280px; height: 265px; overflow: visible;">
    <Doughnut :data="chartData" :options="chartOptions" :key="chartKey" />
  </div>
</template>
