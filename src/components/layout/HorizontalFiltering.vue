<template>
  <div class="custom-horizontal-filter grid grid-cols-[3fr_3fr_2fr_2fr_auto] items-start gap-x-6 gap-y-2">
    <!-- 단계 -->
    <div class="flex flex-col">
      <label class="font-semibold text-md mb-2">단계</label>
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <label
          v-for="step in stepOptions"
          :key="step.value"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="selectedStep === step.value"
            @change="handleStepChange(step.value)"
            class="form-checkbox text-blue-500 w-5 h-5"
          />
          <span class="text-sm">{{ step.label }}</span>
        </label>
      </div>

      <label class="font-semibold text-md mb-2 mt-4">상태</label>
      <div class="flex flex-wrap gap-x-4 gap-y-1">
        <label
          v-for="status in statusOptions"
          :key="status.value"
          class="flex items-center gap-2 cursor-pointer"
        >
          <input
            type="checkbox"
            :checked="selectedStatus === status.value"
            @change="handleStatusChange(status.value)"
            class="form-checkbox text-blue-500 w-5 h-5"
          />
          <span class="text-sm">{{ status.label }}</span>
        </label>
      </div>
    </div>

    <!-- 예상매출 -->
    <div class="flex flex-col">
      <label class="font-semibold text-md mb-2">예상매출</label>
      <div class="grid grid-cols-2 gap-2">
        <button
          v-for="range in budgetOptions"
          :key="range.value"
          :class="[
            'px-3 py-2 rounded border text-sm',
            selectedBudgetRange === range.value
              ? 'bg-blue-500 text-white'
              : 'bg-white text-gray-700 border-gray-300'
          ]"
          @click="selectBudgetRange(range.value)"
        >
          {{ range.label }}
        </button>
      </div>
    </div>

    <!-- 기간 + 고객사 + 담당자 -->
    <div class="flex flex-col col-span-3">
      <label class="font-semibold text-md mb-2">기간</label>
      <div class="flex items-center gap-2 mb-4">
        <input v-model="startDate" type="date" class="input-form-box min-h-[40px] w-full" />
        <span class="mx-1">~</span>
        <input v-model="endDate" type="date" class="input-form-box min-h-[40px] w-full" />
      </div>

      <div class="grid grid-cols-[4fr_4fr_auto] gap-4 mb-4">
        <div class="flex flex-col">
          <label class="font-semibold text-md mb-2">고객사</label>
          <input
            v-model="clientCompany"
            type="text"
            class="input-form-box min-h-[40px]"
            placeholder="고객사 이름"
          />
        </div>
        <div class="flex flex-col">
          <label class="font-semibold text-md mb-2">담당자</label>
          <input
            v-model="internalManager"
            type="text"
            class="input-form-box min-h-[40px]"
            placeholder="담당자 이름"
          />
        </div>
      </div>
    </div>

    <!-- 상품명 + 캠페인명 세로 정렬 -->
    <div class="flex flex-col col-span-5">
      <div class="grid grid-cols-2 gap-4 mb-4">
        <div class="flex flex-col w-full">
          <label class="font-semibold text-md mb-2">캠페인명</label>
          <input
            v-model="campaignName"
            type="text"
            class="input-form-box min-h-[40px] w-full"
            placeholder="캠페인명"
          />
        </div>
        <div class="flex flex-col w-full">
          <label class="font-semibold text-md mb-2">상품명</label>
          <input
            v-model="productName"
            type="text"
            class="input-form-box min-h-[40px] w-full"
            placeholder="상품명"
          />
        </div>
      </div>

      <!-- 검색 버튼 -->
      <div class="flex justify-end">
        <button
          @click="onSearch"
          class="bg-btn-blue text-white px-6 py-2 rounded-md font-semibold
           hover:brightness-95 active:scale-95 active:brightness-90
           transition transform shadow-sm hover:shadow-md"
        >
          검색
        </button>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref } from 'vue';

const emit = defineEmits(['filter']);

const selectedStep = ref('');
const selectedStatus = ref('');
const clientCompany = ref('');
const internalManager = ref('');
const selectedBudgetRange = ref(null);
const startDate = ref('');
const endDate = ref('');
const campaignName = ref('');
const productName = ref('');

const handleStepChange = (value) => {
  selectedStep.value = selectedStep.value === value ? '' : value;
};

const handleStatusChange = (value) => {
  selectedStatus.value = selectedStatus.value === value ? '' : value;
};

const stepOptions = [
  { id: 1, label: '기회인지', value: '기회인지' },
  { id: 2, label: '리스트업', value: '리스트업' },
  { id: 3, label: '제안', value: '제안' },
  { id: 4, label: '견적', value: '견적' },
  { id: 6, label: '계약', value: '계약' },
  { id: 7, label: '매출', value: '매출' },
];

const statusOptions = [
  { id: 1, label: '취소', value: 1 },
  { id: 2, label: '진행중', value: 2 },
  { id: 3, label: '보류', value: 3 },
  { id: 4, label: '게시대기', value: 4 },
  { id: 5, label: '완료', value: 5 },
];


// ✅ 1. 백엔드 `choose-when` 구문과 일치하는 `value`를 추가
const budgetOptions = [
  { label: '1백만 이하', value: 1000000 },
  { label: '1백만~3백만', value: 3000000 },
  { label: '3백만~5백만', value: 5000000 },
  { label: '5백만~7백만', value: 7000000 },
  { label: '7백만~1천만', value: 10000000 },
  { label: '1천만 이상', value: 10000001 },
];

const selectBudgetRange = (value) => {
  selectedBudgetRange.value = selectedBudgetRange.value === value ? null : value;
};


const onSearch = () => {
  emit('filter', {
    stepType: selectedStep.value,
    campaignStatus: selectedStatus.value,
    clientCompanyName: clientCompany.value,
    clientManagerName: internalManager.value,
    expectedRevenueRange: selectedBudgetRange.value,
    startedDate: startDate.value,
    endedDate: endDate.value,
    campaignName: campaignName.value,
    productName: productName.value
  });
};
</script>
