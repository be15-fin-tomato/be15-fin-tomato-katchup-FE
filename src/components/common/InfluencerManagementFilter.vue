<script setup>
import { ref, defineEmits, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
// getCategoryList는 더 이상 필요 없으므로 임포트 제거
// import { getCategoryList } from '@/features/user/api.js';

const emit = defineEmits(['apply-filters']);

const influencerNameQuery = ref('');

// 카테고리 필터 관련 ref 제거
// const categories = ref([]);
// const selectedCategories = ref([]);

// 카테고리 목록을 API에서 가져오는 함수 제거
// const fetchCategories = async () => { /* ... */ };

// onMounted 훅에서 fetchCategories 호출 제거
// onMounted(() => { /* ... */ });

const subscriberOptions = ref([
  { label: '전체', min: null, max: null },
  { label: '1만 미만', min: 0, max: 9999 },
  { label: '1만 ~ 5만', min: 10000, max: 49999 },
  { label: '5만 ~ 10만', min: 50000, max: 99999 },
  { label: '10만 ~ 50만', min: 100000, max: 499999 },
  { label: '50만 ~ 100만', min: 500000, max: 999999 },
  { label: '100만 이상', min: 1000000, max: null },
]);
const selectedSubscriberRange = ref(subscriberOptions.value[0]);

const followerOptions = ref([
  { label: '전체', min: null, max: null },
  { label: '1만 미만', min: 0, max: 9999 },
  { label: '1만 ~ 5만', min: 10000, max: 49999 },
  { label: '5만 ~ 10만', min: 50000, max: 99999 },
  { label: '10만 ~ 50만', min: 100000, max: 499999 },
  { label: '50만 ~ 100만', min: 500000, max: 999999 },
  { label: '100만 이상', min: 1000000, max: null },
]);
const selectedFollowerRange = ref(followerOptions.value[0]);

const priceOptions = ref([
  { label: '전체', min: null, max: null },
  { label: '10만원 미만', min: 0, max: 99999 },
  { label: '10만원 ~ 50만원', min: 100000, max: 499999 },
  { label: '50만원 ~ 100만원', min: 500000, max: 999999 },
  { label: '100만원 이상', min: 1000000, max: null },
]);
const selectedPriceRange = ref(priceOptions.value[0]);

const sortOptions = ref([
  { label: '기본순', value: null },
  { label: '가격 낮은순', value: 'price_asc' },
  { label: '가격 높은순', value: 'price_desc' },
]);
const selectedSortOption = ref(null);

const parseNumberInput = (value) => {
  const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? null : num;
};

const resetFilters = () => {
  influencerNameQuery.value = '';
  // selectedCategories.value = []; // 카테고리 관련 초기화 제거
  selectedSubscriberRange.value = subscriberOptions.value[0];
  selectedFollowerRange.value = followerOptions.value[0];
  selectedPriceRange.value = priceOptions.value[0];
  selectedSortOption.value = null;
  applyFilters();
};

const applyFilters = () => {
  const filtersToEmit = {
    influencerName: influencerNameQuery.value || null,
    // categories: selectedCategories.value.length > 0 ? selectedCategories.value.join(',') : null, // 카테고리 관련 필터 제거
    minSubscriber: selectedSubscriberRange.value.min,
    maxSubscriber: selectedSubscriberRange.value.max,
    minFollower: selectedFollowerRange.value.min,
    maxFollower: selectedFollowerRange.value.max,
    minPrice: selectedPriceRange.value.min,
    maxPrice: selectedPriceRange.value.max,
  };

  if (selectedSortOption.value) {
    const [sortBy, sortOrder] = selectedSortOption.value.split('_');
    filtersToEmit.sortBy = sortBy;
    filtersToEmit.sortOrder = sortOrder;
  } else {
    filtersToEmit.sortBy = null;
    filtersToEmit.sortOrder = null;
  }

  for (const key in filtersToEmit) {
    if (filtersToEmit[key] === null || filtersToEmit[key] === '') {
      delete filtersToEmit[key];
    }
  }
  console.log("Filters to emit (before API call):", filtersToEmit);
  emit('apply-filters', filtersToEmit);
};

const handleEnterKey = (event) => {
  if (event.key === 'Enter') {
    applyFilters();
  }
};
</script>

<template>
  <div class="custom-sidebar p-3 rounded-lg shadow-md bg-white max-w-xs w-full flex-shrink-0">
    <p class="text-base font-semibold mb-2">검색조건</p>

    <input
      type="text"
      v-model="influencerNameQuery"
      placeholder="인플루언서명"
      class="w-full border border-gray-300 rounded-md py-1.5 px-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      @keyup.enter="handleEnterKey"
    />

    <p class="text-base font-semibold mb-2 mt-4">필터</p>

    <!-- 카테고리 필터 섹션 제거 -->
    <!--
    <p class="text-xs font-semibold mb-1 text-gray-700">카테고리</p>
    <div class="mb-3 py-1 px-1.5 border border-gray-300 rounded-md max-h-24 overflow-y-auto bg-gray-50">
      <div v-for="category in categories" :key="category.id" class="flex items-center mb-0 last:mb-0">
        <input
          type="checkbox"
          :id="`category-${category.id}`"
          :value="category.value"
          v-model="selectedCategories"
          class="mr-1.5 h-3 w-3 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
        <label :for="`category-${category.id}`" class="text-xs text-gray-700 cursor-pointer py-0.5">{{ category.name }}</label>
      </div>
      <p v-if="categories.length === 0" class="text-gray-400 text-xs py-0.5">카테고리 없음</p>
    </div>
    -->

    <p class="text-xs font-semibold mb-1 text-gray-700">구독자 수 (만명)</p>
    <div class="relative mb-3">
      <select
        v-model="selectedSubscriberRange"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md py-1.5 px-2 text-xs focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="option in subscriberOptions" :key="option.label" :value="option">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-xs"></i>
      </div>
    </div>

    <p class="text-xs font-semibold mb-1 text-gray-700">팔로워 수 (만명)</p>
    <div class="relative mb-3">
      <select
        v-model="selectedFollowerRange"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md py-1.5 px-2 text-xs focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="option in followerOptions" :key="option.label" :value="option">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-xs"></i>
      </div>
    </div>

    <p class="text-xs font-semibold mb-1 text-gray-700">가격 (만원)</p>
    <div class="relative mb-3">
      <select
        v-model="selectedPriceRange"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md py-1.5 px-2 text-xs focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="option in priceOptions" :key="option.label" :value="option">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-xs"></i>
      </div>
    </div>

    <button class="w-full bg-blue-600 text-white font-semibold py-1.5 rounded-md mb-2 hover:bg-blue-700 transition-colors shadow-md text-sm" @click="applyFilters">
      검색
    </button>

    <button class="w-full bg-gray-200 text-gray-700 font-semibold py-1.5 rounded-md mb-4 hover:bg-gray-300 transition-colors shadow-md text-sm" @click="resetFilters">
      초기화
    </button>

    <p class="text-base font-semibold mb-2">정렬</p>

    <div class="relative">
      <select
        v-model="selectedSortOption"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md py-1.5 px-2 text-xs focus:ring-2 focus:ring-blue-500"
        @change="applyFilters"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-2 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-xs"></i>
      </div>
    </div>
  </div>
</template>
