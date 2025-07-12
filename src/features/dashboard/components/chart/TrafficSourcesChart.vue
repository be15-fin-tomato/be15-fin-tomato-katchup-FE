<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import ApexCharts from 'vue3-apexcharts';

// api.js에서 정의한 함수 임포트
import { fetchAiCommentSummary } from '@/features/dashboard/api.js'; // api.js 경로에 맞게 수정

const props = defineProps({
  trafficSourcesData: {
    type: Array,
    default: () => []
  },
  // prop 이름을 pipelineInfluencerId로 명확하게 변경
  pipelineInfluencerId: String
});

// AI 댓글 요약 데이터를 저장할 ref
const aiCommentSummary = ref('');
const isSummaryLoading = ref(true);
const summaryError = ref(false);

const sourceLabelMap = {
  YT_SEARCH: '유튜브 검색',
  RELATED_VIDEO: '추천 동영상',
  EXTERNAL: '외부 유입',
  PLAYLIST: '재생목록',
  NOTIFICATION: '알림',
};

// AI 댓글 요약을 가져오는 함수
const loadAiCommentSummary = async (id) => { // 여기서 id는 pipelineInfluencerId
  if (!id) {
    console.warn('Pipeline Influencer ID is missing for AI comment summary.');
    aiCommentSummary.value = '캠페인 ID가 없어 AI 댓글 요약을 불러올 수 없습니다.';
    isSummaryLoading.value = false;
    return;
  }
  isSummaryLoading.value = true;
  summaryError.value = false;
  try {
    const summaryText = await fetchAiCommentSummary(id); // 수정된 fetchAiCommentSummary 사용
    aiCommentSummary.value = summaryText;
  } catch (error) {
    summaryError.value = true;
    aiCommentSummary.value = 'AI 댓글 요약을 불러오는 데 실패했습니다.';
    console.error('Failed to load AI comment summary:', error);
  } finally {
    isSummaryLoading.value = false;
  }
};

onMounted(() => {
  // 컴포넌트 마운트 시 pipelineInfluencerId가 있으면 요약 로드
  if (props.pipelineInfluencerId) {
    loadAiCommentSummary(props.pipelineInfluencerId);
  }
});

// pipelineInfluencerId prop이 변경될 때마다 요약을 다시 로드
watch(() => props.pipelineInfluencerId, (newId) => {
  if (newId) {
    loadAiCommentSummary(newId);
  }
}, { immediate: true }); // 컴포넌트 초기 로드 시에도 watch가 실행되도록

const series = computed(() => {
  if (!props.trafficSourcesData || props.trafficSourcesData.length === 0) {
    return [];
  }
  return props.trafficSourcesData.map(row => row.views);
});

const labels = computed(() => {
  if (!props.trafficSourcesData || props.trafficSourcesData.length === 0) {
    return [];
  }
  return props.trafficSourcesData.map(row => sourceLabelMap[row.source] || row.source);
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
      formatter: (val) => `${val.toLocaleString()}회`,
    },
  },
  chart: {
    toolbar: { show: false }
  }
}));
</script>

<template>
  <div class="dashboard-section w-full flex justify-between items-start gap-6">
    <div class="pl-6 pt-6 w-[45%]">
      <div class="dashboard-title text-xl font-bold mb-4">유입 분석</div>
      <div class="text-sm text-muted mb-1 font-semibold">댓글 요약 (AI)</div>
      <div class="bg-muted/10 p-4 rounded-xl text-sm leading-relaxed text-gray-700 shadow-sm overflow-auto h-[200px]">
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
        <div v-if="props.trafficSourcesData.length === 0" class="text-center text-gray-500 py-10">
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
