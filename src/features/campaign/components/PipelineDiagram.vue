<script setup>
import { computed } from 'vue';

const props = defineProps({
  diagramInfo: {
    type: [Object, Array],
    required: true,
  },
});

// 1~8단계 정의 (매출 제외)
const stepOrder = [
  { id: 1, key: 'chance', label: '기회인지', colorVar: 'bg-pipeline-chance' },
  { id: 2, key: 'listUp', label: '리스트업', colorVar: 'bg-pipeline-list-up' },
  { id: 3, key: 'proposal', label: '제안', colorVar: 'bg-pipeline-proposal' },
  { id: 4, key: 'quotation', label: '견적', colorVar: 'bg-pipeline-quotation' },
  { id: 5, key: 'negotiation', label: '협상', colorVar: 'bg-pipeline-negotiation' },
  { id: 6, key: 'contract', label: '계약', colorVar: 'bg-pipeline-contract' },
  { id: 7, key: 'aftercare', label: '매출', colorVar: 'bg-pipeline-aftercare' },
];

// 등록된 단계 중 가장 높은 pipelineStepId 기준으로 색칠
const normalizedDiagramSteps = computed(() => {
  if (Array.isArray(props.diagramInfo)) {

    return props.diagramInfo;
  } else if (props.diagramInfo && Array.isArray(props.diagramInfo.stepStatus)) {

    return props.diagramInfo.stepStatus;
  }
  return []; // 유효한 데이터가 없으면 빈 배열 반환
});

// 등록된 단계 중 가장 높은 단계를 찾는 로직
const lastPipelineIndex = computed(() => {
  if (!normalizedDiagramSteps.value || normalizedDiagramSteps.value.length === 0) {
    return -1;
  }

  let highestIdFound = -1;
  let lastIndex = -1;

  normalizedDiagramSteps.value.forEach(item => {
    let currentStepId = -1;

    if (item.stepType && item.createdAt !== null) {
      const matchingStep = stepOrder.find(step => step.label === item.stepType);
      if (matchingStep) {
        currentStepId = matchingStep.id;
      }
    }

    else if (item.pipelineStepId && item.createdAt !== null) {
      currentStepId = item.pipelineStepId;
    }

    if (currentStepId !== -1 && currentStepId > highestIdFound) {
      highestIdFound = currentStepId;
    }
  });

  lastIndex = stepOrder.findIndex(step => step.id === highestIdFound);
  return lastIndex;
});

// 날짜 포맷
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toISOString().split('T')[0].replace(/-/g, '.');
};

// 해당 단계의 createdAt 날짜 찾기
const getDateByStepId = (id) => {
  const stepData = normalizedDiagramSteps.value.find(item => {
    if (item.stepType) {
      const matchingStepOrder = stepOrder.find(step => step.id === id);
      return matchingStepOrder && item.stepType === matchingStepOrder.label;
    }
    else if (item.pipelineStepId) {
      return item.pipelineStepId === id;
    }
    return false;
  });
  return formatDate(stepData?.createdAt);
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
