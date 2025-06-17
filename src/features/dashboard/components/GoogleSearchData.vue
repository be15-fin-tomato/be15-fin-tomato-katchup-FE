<script setup>
import { computed } from 'vue'
import ApexCharts from 'vue3-apexcharts'
import { Icon } from '@iconify/vue'

const props = defineProps({
    data: { type: Object, required: true },
    title: { type: String, required: true },
    publishedAt: { type: String, required: true }
})

const publishedDateStr = props.publishedAt.slice(0, 10)

const parsedData = computed(() => {
    return props.data.default.timelineData.map(item => ({
        x: new Date(item.time * 1000).toISOString().slice(0, 10),  // ISO날짜 -> yyyy-MM-dd
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
        align: 'right'
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
                x: publishedDateStr,
                borderColor: '#1CAFFF',
                label: {
                    style: { color: '#fff', background: '#83D4FF' },
                    text: '업로드일',
                    position: 'top',
                    offsetY: 10
                }
            }
        ]
    }
}
</script>

<template>
    <div class="dashboard-section">
        <Icon icon="devicon:google" class="w-11 h-11 ml-2" />
        <ApexCharts type="line" height="300" :options="chartOptions" :series="series" />
    </div>
</template>
