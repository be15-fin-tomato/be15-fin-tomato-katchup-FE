<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue'; // 아이콘 사용을 위해 @iconify/vue import

// 검색 조건 드롭다운 옵션
const searchOptions = ref(['전체', '인플루언서명', '채널명', '카테고리']);
const selectedSearchOption = ref('전체');
const searchQuery = ref('');

// 카테고리 필터 (예시 데이터, 실제로는 API에서 가져올 수 있음)
const categories = ref([
  { name: 'Food', value: 'Food' },
  { name: 'Gaming', value: 'Gaming' },
  { name: 'Education', value: 'Education' },
  { name: 'Lifestyle', value: 'Lifestyle' },
  { name: 'Entertainment', value: 'Entertainment' },
  { name: 'Family & Kids', value: 'Family & Kids' },
]);
const selectedCategories = ref([]); // 선택된 카테고리들을 저장할 배열

// 정렬 기준 드롭다운 옵션
const sortOptions = ref([
  { label: '최신순', value: 'latest' },
  { label: '이름순', value: 'name_asc' }, // 팔로워 관련 정렬 옵션 제거
]);
const selectedSortOption = ref('latest');

// 필터 초기화 함수
const resetFilters = () => {
  selectedSearchOption.value = '전체';
  searchQuery.value = '';
  selectedCategories.value = [];
  selectedSortOption.value = 'latest';
};

// 검색 및 필터 적용 함수 (실제로는 API 호출 로직이 들어갈 곳)
const applyFilters = () => {
  console.log('필터 적용:', {
    selectedSearchOption: selectedSearchOption.value,
    searchQuery: searchQuery.value,
    selectedCategories: selectedCategories.value,
    selectedSortOption: selectedSortOption.value,
  });
  // 여기에 실제 인플루언서 목록을 필터링하거나 API를 호출하는 로직 추가
};

// 엔터 키로 검색 실행
const handleEnterKey = (event) => {
  if (event.key === 'Enter') {
    applyFilters();
  }
};
</script>

<template>
  <div class="custom-sidebar">
    <p class="text text-md font-semibold mb-4 mt-5">검색조건</p>

    <div class="relative mb-3">
      <select
        v-model="selectedSearchOption"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-medium rounded-md p-2"
      >
        <option v-for="option in searchOptions" :key="option" :value="option">{{ option }}</option>
      </select>
      <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-black"></i>
      </div>
    </div>

    <input
      type="text"
      v-model="searchQuery"
      :placeholder="`${selectedSearchOption === '전체' ? '검색어' : selectedSearchOption}를 입력하세요`"
      class="w-full border border-gray-medium rounded-md p-2 mb-3"
      @keyup.enter="handleEnterKey"
    />

    <p class="text text-sm font-semibold mb-2">카테고리</p>
    <div class="mb-3 p-2 border border-gray-medium rounded-md max-h-32 overflow-y-auto">
      <div v-for="category in categories" :key="category.value" class="flex items-center mb-1">
        <input
          type="checkbox"
          :id="`category-${category.value}`"
          :value="category.value"
          v-model="selectedCategories"
          class="mr-2"
        />
        <label :for="`category-${category.value}`" class="text-sm cursor-pointer">{{ category.name }}</label>
      </div>
      <p v-if="categories.length === 0" class="text-gray-400 text-sm">카테고리 없음</p>
    </div>

    <button class="w-full bg-btn-gray text-white font-semibold py-2 rounded-md mb-3" @click="applyFilters">
      검색
    </button>

    <button class="w-full bg-gray-300 text-gray-700 font-semibold py-2 rounded-md mb-5" @click="resetFilters">
      초기화
    </button>


    <p class="text text-md font-semibold mb-4 mt-5">정렬</p>

    <div class="relative mb-3">
      <select
        v-model="selectedSortOption"
        class="appearance-none leading-tight focus:outline-none w-full border border-gray-medium rounded-md p-2"
        @change="applyFilters"
      >
        <option v-for="option in sortOptions" :key="option.value" :value="option.value">
          {{ option.label }}
        </option>
      </select>
      <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-black"></i>
      </div>
    </div>
  </div>
</template>
