<script setup>
const props = defineProps({
  diagramInfo: {
    type: Object,
    required: true,
  },
});

// 1~7단계 정의
const stepOrder = [
  { id: 1, key: 'chance', label: '기회인지', colorVar: 'bg-pipeline-chance' },
  { id: 2, key: 'listUp', label: '리스트업', colorVar: 'bg-pipeline-list-up' },
  { id: 3, key: 'proposal', label: '제안', colorVar: 'bg-pipeline-proposal' },
  { id: 4, key: 'quotation', label: '견적', colorVar: 'bg-pipeline-quotation' },
  { id: 5, key: 'negotiation', label: '협상', colorVar: 'bg-pipeline-negotiation' },
  { id: 6, key: 'contract', label: '계약', colorVar: 'bg-pipeline-contract' },
  { id: 7, key: 'aftercare', label: '사후관리', colorVar: 'bg-pipeline-aftercare' },
];

// 등록된 단계 중 가장 높은 pipelineStepId 기준으로 색칠
const highestStepId = Math.max(...(props.diagramInfo.stepStatus?.map(s => s.pipelineStepId) ?? []));
const lastPipelineIndex = stepOrder.findIndex(step => step.id === highestStepId);

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toISOString().split('T')[0].replace(/-/g, '.');
};

// 해당 단계의 startedAt 날짜 찾기
const getDateByStepId = (id) => {
  const step = props.diagramInfo.stepStatus.find(s => s.pipelineStepId === id);
  return formatDate(step?.startedAt);
};
</script>

<template>
    <template v-for="(step, index) in stepOrder" :key="step.id">
      <div class="step flex-1">
        <div
          :class="[
            'pipeline-box w-full text-center p-2 rounded-lg text-white h-[60px]',
            index <= lastPipelineIndex ? step.colorVar : 'bg-gray-300'
          ]"
        >
          <div class="step-label font-semibold">{{ step.label }}</div>
          <div class="step-date text-sm">
            {{ getDateByStepId(step.id) }}
          </div>
        </div>
      </div>

      <div
        v-if="index < stepOrder.length - 1"
        :class="[
                'connector w-3 h-3',
                index <= lastPipelineIndex ? step.colorVar : 'bg-gray-300',]">
      </div>
    </template>
</template>

<style scoped>

</style>
