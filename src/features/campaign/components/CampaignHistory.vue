<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';

// props 받기
const props = defineProps({
    campaignHistory: {
        required: true,
        type: Array,
    },
});

// 상태
const selectedFilters = ref(['all']);
const startDate = ref('');
const endDate = ref('');
const createStep = ref('listup');
const router = useRouter();

// 리스트 할당
const pipelineList = props.campaignHistory;

// 정렬
const sortedList = computed(() => {
    return [...pipelineList].sort((a, b) => {
        const dateA = new Date(a.createdAt);
        const dateB = new Date(b.createdAt);

        if (dateB.getTime() !== dateA.getTime()) {
            return dateB - dateA; // 날짜 최신순
        } else {
            return (stepOrder[b.pipelineStep] ?? 99) - (stepOrder[a.pipelineStep] ?? 99);
        }
    });
});
// 필터 목록
const filters = [
    { label: '전체', value: 'all', color: 'bg-gray-400' },
    { label: '기회 인지', value: 'chance', color: 'bg-pipeline-chance' },
    { label: '리스트업', value: 'listup', color: 'bg-pipeline-list-up' },
    { label: '제안', value: 'proposal', color: 'bg-pipeline-proposal' },
    { label: '견적', value: 'quotation', color: 'bg-pipeline-quotation' },
    { label: '매출', value: 'sales', color: 'bg-orange-400' },
    { label: '계약', value: 'contract', color: 'bg-blue-400' },
];

// URL 매핑
const createUrlMap = {
    chance: '/pipeline/chance/create',
    listup: '/pipeline/list-up/create',
    proposal: '/pipeline/proposal/create',
    quotation: '/pipeline/quotation/create',
    sales: '/pipeline/sales/create',
    contract: '/pipeline/contract/create',
};

// 필터 토글
const toggleFilter = (value) => {
    if (value === 'all') {
        selectedFilters.value = ['all'];
    } else {
        if (selectedFilters.value.includes('all')) selectedFilters.value = [];
        if (selectedFilters.value.includes(value)) {
            selectedFilters.value = selectedFilters.value.filter((v) => v !== value);
        } else {
            selectedFilters.value.push(value);
        }
    }
};

const stepOrder = {
    chance: 1,
    listup: 2,
    proposal: 3,
    quotation: 4,
    sales: 5,
    contract: 6,
};

// 필터 결과
const filteredList = computed(() => {
    let list = sortedList.value;

    if (!selectedFilters.value.includes('all')) {
        list = list.filter((item) => selectedFilters.value.includes(item.pipelineStep));
    }

    if (startDate.value) {
        list = list.filter((item) => new Date(item.createdAt) >= new Date(startDate.value));
    }
    if (endDate.value) {
        list = list.filter((item) => new Date(item.createdAt) <= new Date(endDate.value));
    }

    return list;
});

// 생성 이동
const goToCreate = () => {
    const url = createUrlMap[createStep.value];
    if (url) router.push(url);
    else alert('URL 미정의');
};

const goToDetail = async (item) => {
    let step = item.pipelineStep;
    const id = item.id;

    if (step === 'chance') {
        step = 'influencer/recommendation';
        await router.push(`/${step}/${id}`);
    } else if (step && id) {
        await router.push(`/sales/${step}/${id}`);
    } else {
        alert('잘못된 항목입니다.');
    }
};

// 라벨 매핑
const getStepLabel = (step) => {
    const map = {
        chance: '파이프라인 등록',
        listup: '리스트업',
        proposal: '제안',
        quotation: '견적',
        sales: '매출',
        contract: '계약',
    };
    return map[step] || step;
};

// 아이콘 매핑
const getStepIcon = (step) => {
    const iconMap = {
        chance: 'bxs:contact',
        listup: 'material-symbols:list-alt-check-rounded',
        proposal: 'material-symbols:mic',
        quotation: 'material-symbols:calculate-outline-rounded',
        sales: 'material-symbols:local-atm-outline-sharp',
        contract: 'material-symbols:handshake-outline',
    };
    return iconMap[step] || 'material-symbols:circle';
};

// 색상 매핑
const getIconColor = (step) => {
    const colorMap = {
        chance: 'bg-pipeline-chance',
        listup: 'bg-pipeline-list-up',
        proposal: 'bg-pipeline-proposal',
        quotation: 'bg-pipeline-quotation',
        sales: 'bg-orange-400',
        contract: 'bg-blue-400',
    };
    return colorMap[step] || 'bg-gray-400';
};

// 날짜 포맷
const formatDate = (dateString) => {
    const date = new Date(dateString);
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
};

// 가격 포맷
const formatPrice = (price) => {
    return price.toLocaleString();
};
</script>

<template>
    <div>
        <!-- 필터영역 -->
        <div class="flex flex-col gap-4 mb-6 px-4">
            <div class="flex flex-wrap gap-2">
                <button
                    v-for="filter in filters"
                    :key="filter.value"
                    :class="[
                        'flex items-center gap-1 px-3 py-1 rounded text-sm border',
                        selectedFilters.includes(filter.value)
                            ? filter.color + ' text-white'
                            : 'bg-white',
                    ]"
                    @click="toggleFilter(filter.value)"
                >
                    {{ filter.label }}
                </button>
            </div>

            <div class="flex justify-between items-center flex-wrap gap-3">
                <div class="flex items-center gap-3 flex-wrap">
                    <!-- 기간 필터 -->
                    <div class="flex items-center gap-2">
                        <input
                            type="date"
                            v-model="startDate"
                            class="border rounded px-2 py-1 text-sm"
                        />
                        ~
                        <input
                            type="date"
                            v-model="endDate"
                            class="border rounded px-2 py-1 text-sm"
                        />
                    </div>
                </div>
                <div class="flex items-center gap-3">
                    <select v-model="createStep" class="border rounded px-2 py-1 text-sm">
                        <option
                            v-for="filter in filters.filter(
                                (f) => f.value !== 'all' && f.value !== 'chance',
                            )"
                            :key="filter.value"
                            :value="filter.value"
                        >
                            {{ filter.label }}
                        </option>
                    </select>

                    <button
                        class="bg-blue-500 text-white rounded px-3 py-1 text-sm shadow hover:brightness-95 active:brightness-90 transition"
                        @click="goToCreate"
                    >
                        + 생성
                    </button>
                </div>
            </div>
        </div>

        <!-- 타임라인 -->
        <div class="flex flex-col items-start relative px-4 max-h-[960px] overflow-y-auto">
            <div
                v-for="(item, index) in filteredList"
                :key="index"
                class="flex items-center relative w-full"
            >
                <div class="absolute left-6 top-0 bottom-0 w-px bg-gray-medium z-0"></div>

                <div class="relative z-10">
                    <div
                        class="w-12 h-12 rounded-full flex items-center justify-center mb-5"
                        :class="getIconColor(item.pipelineStep)"
                    >
                        <Icon
                            :icon="getStepIcon(item.pipelineStep)"
                            width="28"
                            height="28"
                            class="text-white"
                        />
                    </div>
                </div>

                <div
                    class="flex-1 min-w-0 bg-white rounded border border-gray-medium py-3 px-5 ml-6 z-10 mb-4 hover:bg-dropdown/10 active:bg-dropdown/15"
                    @click="goToDetail(item)"
                >
                    <div class="flex justify-between mb-2">
                        <div class="font-bold text-sm text-black">
                            {{ getStepLabel(item.pipelineStep) }}
                        </div>
                        <div class="font-semibold text-sm text-black">
                            {{ formatDate(item.createdAt) }}
                        </div>
                    </div>

                    <div class="font-semibold text-sm text-gray-dark truncate">
                        {{ item.title }}
                    </div>

                    <div v-if="item.clientCompany" class="font-semibold text-sm text-gray-dark">
                        {{ item.clientCompany }} / {{ item.ClientManagerName }}
                    </div>

                    <div
                        v-if="item.startAt && item.endAt"
                        class="font-semibold text-sm text-gray-dark"
                    >
                        {{ formatDate(item.startAt) }} ~ {{ formatDate(item.endAt) }}
                    </div>

                    <div v-if="item.adPrice" class="font-semibold text-sm text-gray-dark">
                        KRW {{ formatPrice(item.adPrice) }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
