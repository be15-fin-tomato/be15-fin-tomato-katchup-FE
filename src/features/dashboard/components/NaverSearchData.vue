<script setup>
import ApexCharts from 'vue3-apexcharts'
import { Icon } from '@iconify/vue';

const props = defineProps({
    rows: {
        type: Array,
        required: true
    },
    title: {
        type: String,
        required: true
    },
    publishedAt: {
        type: String,
        required: true
    }
})

const formattedPublishedAt = props.publishedAt.slice(0, 10)

const series = [{
    name: '네이버 검색 트렌드',
    data: props.rows.map(item => ({ x: item.period, y: item.ratio }))
}]

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
        align: 'right',
        labels: { style: { fontSize: '14px', colors: '#333' } }
    },
    xaxis: {
        type: 'category',
        labels: {
          style: { fontSize: '14px', colors: '#333' }
        }
    },
    yaxis: {
        min: 0,
        max: 100,
        tickAmount: 5
    },
    colors: ['#FFEA00'],
    tooltip: {
        x: { format: 'yyyy-MM-dd' }
    },
    annotations: {
        xaxis: [
            {
                x: formattedPublishedAt,
                borderColor: '#1CAFFF',
                label: {
                    style: { color: '#fff', background: '#83D4FF' },
                    text: '업로드일'
                },
            }
        ]
    }
}
</script>

<template>
    <div class="dashboard-section">
        <Icon icon="simple-icons:naver" class="text-[#00AC4F] w-9 h-9 ml-3" />
        <ApexCharts type="line" height="300" :options="chartOptions" :series="series" />
    </div>
</template>


