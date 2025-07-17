<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';

import { fetchAiCommentSummary, fetchCampaignTraffic } from '@/features/dashboard/api.js';

const props = defineProps({
    pipelineInfluencerId: String,
});

// AI 댓글 요약 데이터를 저장할 ref
const aiCommentSummary = ref('');
const isSummaryLoading = ref(true);
const summaryError = ref(false);

// 트래픽 소스 데이터를 저장할 ref
const trafficSourcesData = ref([]);
const isTrafficLoading = ref(true);
const trafficError = ref(false);

// sourceLabelMap은 백엔드에서 trafficName이 이미 한글 라벨로 오므로 필요 없습니다.
// 주석 처리 또는 삭제합니다.

// // AI 댓글 요약을 가져오는 함수
const loadAiCommentSummary = async (id) => {
    if (!id) {
        console.warn('Pipeline Influencer ID is missing for AI comment summary.');
        aiCommentSummary.value = '캠페인 ID가 없어 AI 댓글 요약을 불러올 수 없습니다.';
        isSummaryLoading.value = false;
        return;
    }
    isSummaryLoading.value = true;
    summaryError.value = false;
    try {
        const summaryText = await fetchAiCommentSummary(id);
        aiCommentSummary.value = summaryText;
    } catch (error) {
        summaryError.value = true;
        aiCommentSummary.value = 'AI 댓글 요약을 불러오는 데 실패했습니다.';
        console.error('Failed to load AI comment summary:', error);
    } finally {
        isSummaryLoading.value = false;
    }
};

// 트래픽 소스 데이터를 가져오는 함수
const loadTrafficSourcesData = async (id) => {
    if (!id) {
        console.warn('Pipeline Influencer ID is missing for traffic sources data.');
        trafficSourcesData.value = [];
        isTrafficLoading.value = false;
        return;
    }
    isTrafficLoading.value = true;
    trafficError.value = false;
    try {
        const data = await fetchCampaignTraffic(id);
        trafficSourcesData.value = data;
    } catch (error) {
        trafficError.value = true;
        trafficSourcesData.value = [];
        console.error('Failed to load traffic sources data:', error);
    } finally {
        isTrafficLoading.value = false;
    }
};

onMounted(() => {
    if (props.pipelineInfluencerId) {
        loadAiCommentSummary(props.pipelineInfluencerId);
        loadTrafficSourcesData(props.pipelineInfluencerId);
    }
});

watch(
    () => props.pipelineInfluencerId,
    (newId) => {
        if (newId) {
            loadAiCommentSummary(newId);
            loadTrafficSourcesData(newId);
        } else {
            aiCommentSummary.value = '';
            isSummaryLoading.value = false;
            summaryError.value = false;
            trafficSourcesData.value = [];
            isTrafficLoading.value = false;
            trafficError.value = false;
        }
    },
    { immediate: true },
);

const series = computed(() => {
    if (!trafficSourcesData.value || trafficSourcesData.value.length === 0) {
        return [];
    }
    return trafficSourcesData.value.map((row) => row.views);
});

const labels = computed(() => {
    if (!trafficSourcesData.value || trafficSourcesData.value.length === 0) {
        return [];
    }
    // 백엔드에서 trafficName이 이미 한글이므로 source를 그대로 사용합니다.
    return trafficSourcesData.value.map((row) => row.source);
});

const chartOptions = computed(() => ({
    labels: labels.value,
    colors: ['#FF65DE', '#BA8FFF', '#4DC7FF', '#81FF85', '#FFE88D'],
    legend: { position: 'bottom' },
    dataLabels: {
        enabled: true,
        formatter: (val) => `${val.toFixed(0)}%`,
        style: { fontSize: '18px', fontWeight: 700, colors: ['#ffffff'] },
    },
    plotOptions: {
        pie: {
            donut: { size: '65%' },
        },
    },
    stroke: { show: false },
    tooltip: {
        y: {
            formatter: (val) => `${val.toFixed(2)}%`,
        },
    },
    chart: {
        toolbar: { show: false },
    },
}));
</script>

<template>
    <div class="w-full flex justify-between items-start gap-6">
        <div class="pl-6 pt-6 w-[45%]">
            <div class="dashboard-title text-xl font-bold mb-4">유입 분석</div>
            <div class="text-sm text-muted mb-1 font-semibold">댓글 요약 (AI)</div>
            <div
                class="bg-muted/10 p-4 rounded-xl text-sm leading-relaxed text-gray-700 shadow-sm overflow-auto h-[200px]"
            >
                <div v-if="isSummaryLoading" class="text-center text-gray-500">
                    AI 댓글 요약을 불러오는 중입니다...
                </div>
                <div v-else-if="summaryError" class="text-center text-red-500">
                    {{ aiCommentSummary }}
                </div>
                <div v-else>
                    {{ aiCommentSummary }}
                </div>
            </div>
        </div>
        <div
            class="relative bg-background p-6 rounded-3xl shadow flex items-center justify-center h-[400px] w-[50%]"
        >
            <div class="relative w-[340px]">
                <div v-if="isTrafficLoading" class="text-center text-gray-500 py-10">
                    트래픽 소스 데이터를 불러오는 중입니다...
                </div>
                <div v-else-if="trafficError" class="text-center text-red-500 py-10">
                    트래픽 소스 데이터를 불러오는 데 실패했습니다.
                </div>
                <div
                    v-else-if="trafficSourcesData.length === 0"
                    class="text-center text-gray-500 py-10"
                >
                    트래픽 소스 데이터가 없습니다.
                </div>
                <div v-else>
                    <ApexCharts type="donut" width="340" :series="series" :options="chartOptions" />
                    <div
                        class="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
                    >
                        <div class="text-lg font-semibold">영상유입 경로</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
