<script setup>
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const props = defineProps({
  campaignHistory: {
    required: true,
    type: Array,
  },
});

const selectedFilters = ref(['all']);
const startDate = ref('');
const endDate = ref('');
const createStep = ref('listup'); // 초기 생성값
const router = useRouter();

// 필터 목록
const filters = [
  { label: '전체', value: 'all', color: 'bg-gray-400' },
  { label: '기회인지', value: 'chance', color: 'bg-pipeline-chance' },
  { label: '리스트업', value: 'listup', color: 'bg-pipeline-list-up' },
  { label: '제안', value: 'proposal', color: 'bg-pipeline-proposal' },
  { label: '견적', value: 'quotation', color: 'bg-pipeline-quotation' },
  { label: '매출', value: 'sales', color: 'bg-pipeline-revenue' },
  { label: '계약', value: 'contract', color: 'bg-pipeline-contract' },
];

// stepType 한글 → 영문 필터 값
const stepTypeToValue = {
  '기회인지': 'chance',
  '리스트업': 'listup',
  '제안': 'proposal',
  '견적': 'quotation',
  '매출': 'sales',
  '계약': 'contract',
};

const createUrlMap = {
  listup: '/influencer/recommendation',
  proposal: '/sales/proposal/create',
  quotation: '/sales/quotation/create',
  contract: '/sales/contract/create',
  sales: '/sales/revenue/create',
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

// 정렬
const sortedList = computed(() => {
  return [...props.campaignHistory].sort((a, b) => {
    const dateA = new Date(a.createdAt);
    const dateB = new Date(b.createdAt);
    return dateB - dateA;
  });
});

// 필터링
const filteredList = computed(() => {
  let list = sortedList.value;

  if (!selectedFilters.value.includes('all')) {
    list = list.filter((item) =>
      selectedFilters.value.includes(stepTypeToValue[item.stepType])
    );
  }

  if (startDate.value) {
    list = list.filter((item) => new Date(item.startedAt) >= new Date(startDate.value));
  }
  if (endDate.value) {
    list = list.filter((item) => new Date(item.endedAt) <= new Date(endDate.value));
  }

  return list;
});

// + 생성 버튼
const goToCreate = () => {
  const url = createUrlMap[createStep.value];
  if (url) router.push(url);
  else toast.error('이동 중 에러 발생');
};

const goToDetail = async (item) => {
  const step = item.stepType;
  const id = item.pipelineId;

  if (step === '기회인지') return;

  if (step === '리스트업') {
    await router.push(`/influencer/recommendation/${id}`);
    return;
  }

  const stepPathMap = {
    '제안': 'proposal',
    '견적': 'quotation',
    '계약': 'contract',
    '매출': 'revenue',
  };

  const path = stepPathMap[step];
  if (path && id) {
    await router.push(`/sales/${path}/${id}`);
  } else {
    toast.error('잘못된 항목입니다.');
  }
};

// 아이콘 매핑
const getStepIcon = (step) => {
  const map = {
    '기회인지': 'bxs:contact',
    '리스트업': 'material-symbols:list-alt-check-rounded',
    '제안': 'material-symbols:mic',
    '견적': 'material-symbols:calculate-outline-rounded',
    '매출': 'material-symbols:local-atm-outline-sharp',
    '계약': 'material-symbols:handshake-outline',
  };
  return map[step] || 'material-symbols:circle';
};

// 색상 매핑
const getStepColor = (step) => {
  const map = {
    '기회인지': 'bg-pipeline-chance',
    '리스트업': 'bg-pipeline-list-up',
    '제안': 'bg-pipeline-proposal',
    '견적': 'bg-pipeline-quotation',
    '매출': 'bg-orange-400',
    '계약': 'bg-blue-400',
  };
  return map[step] || 'bg-gray-400';
};

// 날짜 포맷
const formatDate = (dateString) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return `${yyyy}.${mm}.${dd}`;
};

// 기간 포맷
const formatPeriod = (start, end) => {
  if (!start || !end) return null;
  return `${formatDate(start)} ~ ${formatDate(end)}`;
};

// 금액 포맷
const formatPrice = (price) => {
  if (!price) return null;
  return `KRW ${price.toLocaleString()}`;
};
</script>

<template>
  <div class="flex flex-col gap-4 px-4">
    <!-- 필터 버튼 -->
    <div class="flex flex-wrap gap-2">
      <button
        v-for="filter in filters"
        :key="filter.value"
        :class="[ 'flex items-center gap-1 px-3 py-1 rounded text-sm border',
          selectedFilters.includes(filter.value)
            ? filter.color + ' text-white'
            : 'bg-white'
        ]"
        @click="toggleFilter(filter.value)"
      >
        {{ filter.label }}
      </button>
    </div>

    <!-- 날짜 & 생성 -->
    <div class="flex justify-between items-center">
      <div class="flex gap-2">
        <input type="date" v-model="startDate" class="border rounded px-2 py-1 text-sm" />
        ~
        <input type="date" v-model="endDate" class="border rounded px-2 py-1 text-sm" />
      </div>
      <div class="flex gap-2">
        <select v-model="createStep" class="border rounded px-2 py-1 text-sm">
          <option
            v-for="filter in filters.filter(f => f.value !== 'all' && f.value !== 'chance')"
            :key="filter.value"
            :value="filter.value"
          >
            {{ filter.label }}
          </option>
        </select>
        <button class="bg-blue-500 text-white rounded px-3 py-1 text-sm" @click="goToCreate">
          + 생성
        </button>
      </div>
    </div>

    <!-- 타임라인 리스트 -->
    <div class="relative max-h-[960px] overflow-y-auto">
      <div
        v-for="(item, index) in filteredList"
        :key="index"
        class="flex items-center relative w-full"
      >
        <div class="absolute left-6 top-0 bottom-0 w-px bg-gray-300 z-0"></div>
        <!-- 아이콘 원 -->
        <div class="relative z-10">
          <div
            :class="[
          'w-12 h-12 rounded-full flex items-center justify-center mb-5',
          getStepColor(item.stepType)
        ]"
          >
            <Icon
              :icon="getStepIcon(item.stepType)"
              width="28"
              height="28"
              class="text-white"
            />
          </div>
        </div>
        <!-- 카드 -->
        <div
          class="flex-1 min-w-0 rounded border border-gray-200 py-3 px-5 ml-6 z-10 mb-4"
          :class="item.stepType === '기회인지'
    ? 'bg-gray-50 opacity-70'
    : 'bg-white hover:bg-gray-50 hover:shadow-md cursor-pointer transition-shadow duration-150'"
          @click="item.stepType !== '기회인지' && goToDetail(item)"
        >
          <div class="flex justify-between mb-2">
            <div class="font-bold text-sm">{{ item.stepType }}</div>
            <div class="font-semibold text-sm">{{ formatDate(item.createdAt) }}</div>
          </div>
          <div class="text-sm font-semibold text-black truncate">{{ item.pipelineTitle }}</div>
          <div
            v-if="item.clientCompanyName || item.managerName"
            class="text-sm font-medium text-gray-600"
          >
            {{ item.clientCompanyName }}
            <span v-if="item.managerName"> / {{ item.managerName }}</span>
          </div>
          <div
            v-if="formatPeriod(item.startedAt, item.endedAt)"
            class="text-sm font-medium text-gray-600"
          >
            {{ formatPeriod(item.startedAt, item.endedAt) }}
          </div>
          <div
            v-if="formatPrice(item.adPrice)"
            class="text-sm font-medium text-gray-600"
          >
            {{ formatPrice(item.adPrice) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
