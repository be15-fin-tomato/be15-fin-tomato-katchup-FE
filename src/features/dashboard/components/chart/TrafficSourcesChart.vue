<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import ApexCharts from 'vue3-apexcharts';

const route = useRoute();
const campaignId = route.query.id || '1';

const campaign = ref(null);
const meta = ref(null);
const rows = ref([]);
const isLoading = ref(false);
const isError = ref(false);

// AI 댓글 요약 예시 (나중에 실제 API로 교체 가능)
const aiCommentSummary = ref(`
해당 영상에 대해 긍정적인 반응이 많았으며, 특히 콘텐츠의 신선함과 정보 전달력에 대해 호평이 이어졌습니다.
몇몇 시청자는 영상 속 제품에 대한 자세한 설명에 감사의 댓글을 남기기도 했습니다.
또한 영상의 편집 스타일, 배경 음악 선택, 그리고 전달 방식이 매우 효과적이라는 의견도 다수 있었습니다.
일부 시청자들은 관련된 추가 정보나 링크를 요청하며, 해당 콘텐츠에 대한 깊은 관심을 보이기도 했습니다.
특히 영상이 초보자에게도 이해하기 쉬운 구성으로 되어 있어 접근성이 높다는 의견이 많았으며,
앞으로도 이런 유익한 콘텐츠가 지속되기를 바라는 목소리가 컸습니다.
종합적으로, 영상의 퀄리티와 정보의 유익성에 대한 만족도가 상당히 높은 것으로 나타났습니다.
`);
const sourceLabelMap = {
  YT_SEARCH: '유튜브 검색',
  RELATED_VIDEO: '추천 동영상',
  EXTERNAL: '외부 유입',
  PLAYLIST: '재생목록',
  NOTIFICATION: '알림',
};

const fetchAllData = async () => {
  isLoading.value = true;
  try {
    const campaignRes = await fetch(`/api/v1/campaign/${campaignId}`);
    campaign.value = (await campaignRes.json()).data;

    const metaRes = await fetch(`/api/v1/youtube/video?campaignId=${campaignId}`);
    meta.value = await metaRes.json();

    const trafficRes = await fetch(`/api/v1/youtube/traffic-sources?campaignId=${campaignId}&groupType=daily`);
    rows.value = (await trafficRes.json()).rows;
  } catch (err) {
    isError.value = true;
  } finally {
    isLoading.value = false;
  }
};

onMounted(fetchAllData);

const series = computed(() => rows.value.map((row) => row[1]));
const labels = computed(() => rows.value.map((row) => sourceLabelMap[row[0]]));

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
}));
</script>

<template>
  <div class="dashboard-section w-full flex justify-between items-start gap-6">
    <!-- 왼쪽 : 유입 분석 텍스트 + AI 요약 -->
    <div class="pl-6 pt-6 w-[45%]">
      <div class="dashboard-title text-xl font-bold mb-4">유입 분석</div>
      <div class="text-sm text-muted mb-1 font-semibold">댓글 요약 (AI)</div>
      <div class="bg-muted/10 p-4 rounded-xl text-sm leading-relaxed text-gray-700 shadow-sm overflow-auto h-[200px]">
        {{ aiCommentSummary }}
      </div>
    </div>
    <!-- 오른쪽 : 도넛 그래프 -->
    <div
      class="relative bg-background p-6 rounded-3xl shadow flex items-center justify-center h-[400px] w-[50%]"
    >
      <div class="relative w-[340px]">
        <ApexCharts type="donut" width="340" :series="series" :options="chartOptions" />
        <div
          class="absolute top-[40%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center"
        >
          <div class="text-lg font-semibold">영상유입 경로</div>
        </div>
      </div>
    </div>
  </div>
</template>
