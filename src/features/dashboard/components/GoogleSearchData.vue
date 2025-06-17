<script setup>
import { computed } from 'vue'
import ApexCharts from 'vue3-apexcharts'

const props = defineProps({
  data: { type: Object, required: true },
  title: { type: String, required: true }
})

const parsedData = computed(() => {
  return props.data.default.timelineData.map(item => ({
    x: new Date(item.time * 1000).toISOString().slice(0, 10),
    y: item.value[0]
  }))
})

const series = computed(() => [
  {
    name: '검색 비율',
    data: parsedData.value
  }
])

const chartOptions = {
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
    align: 'left',
    labels: { style: { fontSize: '14px', colors: '#333' } }
  },
  xaxis: {
    type: 'category',
    labels: { rotate: -45 }
  },
  yaxis: {
    min: 0,
    max: 100,
    tickAmount: 5
  },
  colors: ['#FFEA00'],
  tooltip: {
    x: {
      format: 'yyyy-MM-dd'
    }
  }
}
</script>

<template>
    <div class="dashboard-section">
        <ApexCharts type="line" height="300" :options="chartOptions" :series="series" />
    </div>
</template>
