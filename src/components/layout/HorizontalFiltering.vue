<template>
    <div
        class="custom-horizontal-filter grid grid-cols-[3fr_3fr_2fr_2fr_auto] items-start gap-x-6 gap-y-2"
    >
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
                        :value="step.value"
                        v-model="selectedSteps"
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
                        :value="status.value"
                        v-model="selectedStatuses"
                        class="form-checkbox text-blue-500 w-5 h-5"
                    />
                    <span class="text-sm">{{ status.label }}</span>
                </label>
            </div>
        </div>

        <!-- 계약금 -->
        <div class="flex flex-col">
            <label class="font-semibold text-md mb-2">계약금</label>
            <div class="grid grid-cols-2 gap-2">
                <button
                    v-for="(range, index) in budgetOptions"
                    :key="index"
                    :class="[
                        'px-3 py-2 rounded border text-sm',
                        selectedBudgetRange === index
                            ? 'bg-blue-500 text-white'
                            : 'bg-white text-gray-700 border-gray-300',
                    ]"
                    @click="selectBudgetRange(index)"
                >
                    {{ range.label }}
                </button>
            </div>
        </div>
        <div class="flex flex-col col-span-2">
            <!-- 기간 -->
            <label class="font-semibold text-md mb-2">기간</label>
            <div class="flex items-center gap-2 mb-4">
                <input v-model="startDate" type="date" class="input-form-box min-h-[40px] w-full" />
                <span class="mx-1">~</span>
                <input v-model="endDate" type="date" class="input-form-box min-h-[40px] w-full" />
            </div>

            <!-- 고객사 + 담당자 + 검색 버튼 -->
            <div class="grid grid-cols-[2fr_2fr_auto] gap-4">
                <!-- 고객사 -->
                <div class="flex flex-col">
                    <label class="font-semibold text-md mb-2">고객사</label>
                    <input
                        v-model="clientCompany"
                        type="text"
                        class="input-form-box min-h-[40px]"
                        placeholder="고객사 이름"
                    />
                </div>

                <!-- 담당자 -->
                <div class="flex flex-col">
                    <label class="font-semibold text-md mb-2">담당자</label>
                    <input
                        v-model="internalManager"
                        type="text"
                        class="input-form-box min-h-[40px]"
                        placeholder="담당자 이름"
                    />
                </div>

                <!-- 검색 버튼 -->
                <div class="flex flex-col h-full">
                    <label class="font-semibold text-md mb-2 invisible">검색</label>
                    <button @click="onSearch" class="btn-open-popup h-full">검색</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const emit = defineEmits(['filter']);

const selectedSteps = ref([]);
const selectedStatuses = ref([]);
const clientCompany = ref('');
const internalManager = ref('');
const selectedBudgetRange = ref(null);
const startDate = ref('');
const endDate = ref('');

const stepOptions = [
    { label: '기회', value: 'chance' },
    { label: '리스트업', value: 'listup' },
    { label: '제안', value: 'proposal' },
    { label: '견적', value: 'quotation' },
    { label: '협상', value: 'negotiation' },
    { label: '계약', value: 'contract' },
    { label: '사후관리', value: 'followup' },
];

const statusOptions = [
    { label: '대기', value: 'waiting' },
    { label: '진행중', value: 'inProgress' },
    { label: '완료', value: 'done' },
];

const budgetOptions = [
    { label: '1천만 이하', min: 0, max: 10000000 },
    { label: '1천만~3천만', min: 10000000, max: 30000000 },
    { label: '3천만~5천만', min: 30000000, max: 50000000 },
    { label: '5천만~7천만', min: 50000000, max: 70000000 },
    { label: '7천만~1억', min: 70000000, max: 100000000 },
    { label: '1억 이상', min: 100000000, max: Number.MAX_SAFE_INTEGER },
];

const selectBudgetRange = (index) => {
    selectedBudgetRange.value = index;
};

const getBudgetMin = () =>
    selectedBudgetRange.value !== null ? budgetOptions[selectedBudgetRange.value].min : null;

const getBudgetMax = () =>
    selectedBudgetRange.value !== null ? budgetOptions[selectedBudgetRange.value].max : null;

const onSearch = () => {
    emit('filter', {
        steps: selectedSteps.value,
        statuses: selectedStatuses.value,
        clientCompany: clientCompany.value,
        internalManager: internalManager.value,
        minBudget: getBudgetMin(),
        maxBudget: getBudgetMax(),
        startDate: startDate.value,
        endDate: endDate.value,
    });
};
</script>
