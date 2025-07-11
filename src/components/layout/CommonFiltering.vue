<script setup>
import { ref, defineEmits } from 'vue';
import { Icon } from '@iconify/vue';
import { TAGS } from '@/constants/tags'; // TAGS 상수 임포트 (경로 확인 필요)

const emit = defineEmits(['apply-filters']);

const influencerNameQuery = ref('');

// 카테고리 필터: TAGS 상수를 이용하여 동적으로 생성
const categories = ref(
  TAGS.map(tag => ({ name: tag, value: tag }))
);
const selectedCategories = ref([]);

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
  { label: '가격 낮은순', value: 'price_asc' },
  { label: '가격 높은순', value: 'price_desc' },
]);
const selectedSortOption = ref('price_asc');

const parseNumberInput = (value) => {
  const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? null : num;
};

const resetFilters = () => {
  influencerNameQuery.value = '';
  selectedCategories.value = [];
  selectedSubscriberRange.value = subscriberOptions.value[0];
  selectedFollowerRange.value = followerOptions.value[0];
  selectedPriceRange.value = priceOptions.value[0];
  selectedSortOption.value = 'price_asc';
  applyFilters();
};

const applyFilters = () => {
  const filtersToEmit = {
    influencerName: influencerNameQuery.value || null,
    categories: selectedCategories.value.length > 0 ? selectedCategories.value : null,
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
    <p class="text-md font-semibold mb-3 mt-2">검색조건</p>

    <input
      type="text"
      v-model="influencerNameQuery"
      placeholder="인플루언서명"
      class="w-full border border-gray-300 rounded-md p-2 mb-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      @keyup.enter="handleEnterKey"
    />

    <p class="text-md font-semibold mb-3 mt-4">필터</p>

    <p class="text-sm font-semibold mb-2 text-gray-700">카테고리</p>
    <div class="mb-3 p-2 border border-gray-300 rounded-md max-h-28 overflow-y-auto bg-gray-50">
      <div v-for="category in categories" :key="category.value" class="flex items-center mb-0.5 last:mb-0">
        <input
          type="checkbox"
          :id="`category-${category.value}`"
          :value="category.value"
          v-model="selectedCategories"
          class="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
        />
        <label :for="`category-${category.value}`" class="text-sm text-gray-700 cursor-pointer">{{ category.name }}</label>
      </div>
      <p v-if="categories.length === 0" class="text-gray-400 text-sm py-0.5">카테고리 없음</p>
    </div>

    <p class="text-sm font-semibold mb-2 text-gray-700">구독자 수 (만명)</p>
    <div class="relative mb-3">
      <select
        v-model="selectedSubscriberRange"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="option in subscriberOptions" :key="option.label" :value="option">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-sm"></i>
      </div>
    </div>

    <p class="text-sm font-semibold mb-2 text-gray-700">팔로워 수 (만명)</p>
    <div class="relative mb-3">
      <select
        v-model="selectedFollowerRange"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="option in followerOptions" :key="option.label" :value="option">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-sm"></i>
      </div>
    </div>

    <p class="text-sm font-semibold mb-2 text-gray-700">가격 (만원)</p>
    <div class="relative mb-3">
      <select
        v-model="selectedPriceRange"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
      >
        <option v-for="option in priceOptions" :key="option.label" :value="option">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-sm"></i>
      </div>
    </div>

    <button class="w-full bg-blue-600 text-white font-semibold py-2 rounded-md mb-3 hover:bg-blue-700 transition-colors shadow-md text-sm" @click="applyFilters">
      검색
    </button>

    <button class="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-md mb-5 hover:bg-gray-300 transition-colors shadow-md text-sm" @click="resetFilters">
      초기화
    </button>

    <p class="text-md font-semibold mb-3">정렬</p>

    <div class="relative">
      <select
        v-model="selectedSortOption"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-300 rounded-md p-2 text-sm focus:ring-2 focus:ring-blue-500"
        @change="applyFilters"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-gray-500 text-sm"></i>
      </div>
    </div>
  </div>
</template>
