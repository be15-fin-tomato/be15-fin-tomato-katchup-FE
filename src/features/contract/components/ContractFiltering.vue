<script setup>
import { reactive, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: Object,
});
const emit = defineEmits(['update:modelValue', 'search']);

const defaultFilter = () => ({
  searchType: 'all',
  keyword: '',
  registrationStatus: 'all', // 'registered', 'unregistered', 'all'
});

const localValue = reactive({ ...(props.modelValue || defaultFilter()) });

// v-model 양방향 바인딩
watch(localValue, (val) => {
  emit('update:modelValue', val);
});

// 검색 실행
const triggerSearch = () => {
  emit('search', localValue);
};
</script>

<template>
  <form @submit.prevent="triggerSearch" class="custom-sidebar flex flex-col gap-8">
    <!-- 검색조건 -->
    <div>
      <div class="font-bold mb-3">검색조건</div>

      <!-- 검색유형 -->
      <select v-model="localValue.searchType" class="input-form-box mb-2 w-full">
        <option value="all">전체</option>
        <option value="campaignName">캠페인명</option>
        <option value="productName">상품명</option>
        <option value="clientCompanyName">고객사명</option>
        <option value="influencerName">인플루언서명</option>
      </select>

      <!-- 키워드 -->
      <input
        v-model="localValue.keyword"
        placeholder="검색어를 입력하세요"
        class="input-form-box mb-2 w-full"
      />

      <!-- 등록 상태 -->
      <select v-model="localValue.registrationStatus" class="input-form-box mb-2 w-full">
        <option value="all" disabled>계약서 등록 상태</option>
        <option value="registered">등록</option>
        <option value="unregistered">미등록</option>
      </select>
    </div>

    <!-- 검색 버튼 -->
    <button type="submit" class="btn-create">검색</button>
  </form>
</template>
