<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue';
import { TAGS } from '@/constants/tags'; // TAGS 상수 임포트

const emit = defineEmits(['apply-filters']);

const influencerNameQuery = ref('');

// 카테고리 필터: 커스텀 드롭다운 (체크박스 중복 선택) 로직
const categories = ref(
  TAGS.map((tag, index) => ({
    name: tag,
    value: tag,
    id: index + 1
  }))
);
const selectedCategories = ref([]); // 선택된 카테고리 ID들을 저장할 배열
const isCategoryDropdownOpen = ref(false); // 드롭다운 열림/닫힘 상태
const categoryDropdownRef = ref(null); // 드롭다운 영역 참조

// 선택된 카테고리 이름을 쉼표로 연결하여 표시
const displaySelectedCategories = ref('전체');

// 선택된 카테고리 업데이트 시 표시 텍스트 변경
const updateDisplayCategories = () => {
  if (selectedCategories.value.length === 0) {
    displaySelectedCategories.value = '전체';
  } else {
    displaySelectedCategories.value = selectedCategories.value
      .map(id => {
        const category = categories.value.find(cat => cat.id === id);
        return category ? category.name : '';
      })
      .filter(name => name !== '')
      .join(', ');
  }
};

// 카테고리 체크박스 변경 시 호출
const handleCategoryChange = () => {
  updateDisplayCategories();
  // 드롭다운이 열린 상태에서 체크박스 변경 시 바로 필터 적용 (옵션)
  // applyFilters();
};

// 카테고리 드롭다운 토글
const toggleCategoryDropdown = () => {
  isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
};

// 드롭다운 외부 클릭 시 닫기
const handleClickOutsideCategory = (event) => {
  if (categoryDropdownRef.value && !categoryDropdownRef.value.contains(event.target)) {
    isCategoryDropdownOpen.value = false;
  }
};

// 구독자, 팔로워, 가격, 정렬 드롭다운은 기존 로직 유지
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
  { label: '단가 낮은순', value: 'price_asc' },
  { label: '단가 높은순', value: 'price_desc' },
]);
const selectedSortOption = ref(null);

const parseNumberInput = (value) => {
  const num = parseInt(value.replace(/[^0-9]/g, ''), 10);
  return isNaN(num) ? null : num;
};

const resetFilters = () => {
  influencerNameQuery.value = '';
  selectedCategories.value = []; // 카테고리 초기화
  updateDisplayCategories(); // 표시 텍스트도 초기화
  selectedSubscriberRange.value = subscriberOptions.value[0];
  selectedFollowerRange.value = followerOptions.value[0];
  selectedPriceRange.value = priceOptions.value[0];
  selectedSortOption.value = null;
  applyFilters();
};

const applyFilters = () => {
  const filtersToEmit = {
    influencerName: influencerNameQuery.value || null,
    categoryIds: selectedCategories.value.length > 0 ? selectedCategories.value : null, // 배열로 전달
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
    if (filtersToEmit[key] === null || filtersToEmit[key] === '' || (Array.isArray(filtersToEmit[key]) && filtersToEmit[key].length === 0)) {
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

// 컴포넌트 마운트 시 이벤트 리스너 추가
onMounted(() => {
  document.addEventListener('click', handleClickOutsideCategory);
  updateDisplayCategories(); // 초기 로드 시 '전체'로 표시
});

// 컴포넌트 언마운트 시 이벤트 리스너 제거
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutsideCategory);
});
</script>

<template>
  <div class="custom-sidebar flex flex-col gap-2">
    <p class="font-bold">인플루언서 검색</p>

    <div class="grid grid-cols-4 gap-2">
      <input
        v-model="influencerNameQuery"
        type="text"
        placeholder="이름"
        class="input-form-box w-full mb-2 col-span-3"
        @keyup.enter="handleEnterKey"
      />
      <button
        @click="applyFilters"
        class="w-full bg-btn-blue text-white font-semibold py-2 rounded-md h-[43px]
         hover:brightness-95 active:scale-95 active:brightness-90
         transition transform shadow-sm hover:shadow-md col-span-1"
      >
        검색
      </button>
    </div>

      <label class="block">카테고리</label>
      <div class="relative mb-2" ref="categoryDropdownRef">
        <div
          class="input-form-box w-full cursor-pointer flex justify-between items-center h-[40px]"
          @click="toggleCategoryDropdown"
        >
          <span class="text-gray-dark overflow-hidden whitespace-nowrap text-ellipsis mr-2">
            {{ displaySelectedCategories }}
          </span>
          <i class="bi bi-chevron-down text-black transition-transform" :class="{ 'rotate-180': isCategoryDropdownOpen }"></i>
        </div>

        <div
          v-if="isCategoryDropdownOpen"
          class="absolute z-10 w-full mt-1 bg-white border border-gray-dark rounded-sm shadow-lg max-h-60 overflow-y-auto"
        >
          <div class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              id="category-all"
              :checked="selectedCategories.length === 0"
              @change="selectedCategories = []; updateDisplayCategories();"
              class="mr-2 h-4 w-4 text-blue-600 border-gray-dark rounded-sm cursor-pointer"
            />
            <label for="category-all" class="text-gray-dark cursor-pointer">전체</label>
          </div>
          <div v-for="category in categories.slice(1)" :key="category.id" class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
            <input
              type="checkbox"
              :id="`category-${category.id}`"
              :value="category.id"
              v-model="selectedCategories"
              @change="handleCategoryChange"
              class="mr-2 h-4 w-4 text-blue-600 border-gray-dark rounded-sm cursor-pointer"
            />
            <label :for="`category-${category.id}`" class="text-gray-dark cursor-pointer">{{ category.name }}</label>
          </div>
          <p v-if="categories.length === 1" class="text-gray-dark px-3 py-2">카테고리 없음</p>
        </div>
      </div>

      <label class="block">구독자수</label>
      <div class="relative mb-2">
        <select
          v-model="selectedSubscriberRange"
          class="input-form-box appearance-none w-full leading-tight focus:outline-none text-gray-dark"
          @change="applyFilters"
        >
          <option v-for="option in subscriberOptions" :key="option.label" :value="option">
            {{ option.label }}
          </option>
        </select>
        <div class="flex items-center absolute inset-y-5 right-3 pointer-events-none">
          <i class="bi bi-chevron-down"></i>
        </div>
      </div>

      <label class="block">팔로워수</label>
      <div class="relative mb-3">
        <select
          v-model="selectedFollowerRange"
          class="input-form-box appearance-none w-full leading-tight focus:outline-none text-gray-dark"
          @change="applyFilters"
        >
          <option v-for="option in followerOptions" :key="option.label" :value="option">
            {{ option.label }}
          </option>
        </select>
        <div class="absolute inset-y-5 mb-2 right-3 flex items-center pointer-events-none">
          <i class="bi bi-chevron-down text-black"></i>
        </div>
      </div>

      <label class="block">광고단가</label>
      <div class="relative mb-2">
        <select
          v-model="selectedPriceRange"
          class="input-form-box appearance-none w-full leading-tight focus:outline-none text-gray-dark"
          @change="applyFilters"
        >
          <option v-for="option in priceOptions" :key="option.label" :value="option">
            {{ option.label }}
          </option>
        </select>
        <div class="absolute inset-y-5 mb-2 right-3 flex items-center pointer-events-none">
          <i class="bi bi-chevron-down text-black"></i>
        </div>
      </div>

      <label class="block">정렬</label>
      <div class="relative mb-3">
        <select
          v-model="selectedSortOption"
          class="input-form-box appearance-none w-full leading-tight focus:outline-none text-gray-dark"
          @change="applyFilters"
        >
          <option v-for="option in sortOptions" :key="option.value" :value="option.value">
            {{ option.label }}
          </option>
        </select>
        <div class="absolute inset-y-0 mb-2 right-3 flex items-center pointer-events-none">
          <i class="bi bi-chevron-down text-black"></i>
        </div>
      </div>

    <button
      class="w-full bg-gray-medium text-white rounded-lg font-semibold py-2
        hover:brightness-95 hover:shadow-lg active:brightness-90 active:scale-95
        transition transform shadow-md cursor-pointer"
      @click="resetFilters"
    >
      초기화
    </button>

  </div>
</template>
