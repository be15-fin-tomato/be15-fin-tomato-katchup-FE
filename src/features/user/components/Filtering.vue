<script setup>
import { reactive, watch, onMounted } from 'vue';

const props = defineProps({
  modelValue: Object,
  showFilterSort: {
    type: Boolean,
    default: true,
  },
});

const emit = defineEmits(['update:modelValue', 'search']);

const localValue = reactive({ ...(props.modelValue || defaultSearch()) });

watch(localValue, (val) => {
  emit('update:modelValue', val);
});

const triggerSearch = () => {
  emit('search', localValue);
};

const openUserSearch = () => {
  const selectedIds = localValue.user?.id ?? '';

  window.__userSelectCallback__ = (selectedItem) => {
    localValue.user = selectedItem;
  };

  window.open(
    `/search-popup?type=one-user&selected=${selectedIds}`,
    'SearchPopup',
    'width=500,height=600'
  );
};

function defaultSearch() {
  return {
    searchType: 'all',
    keyword: '',
    user: null,
    sort: 'date',
    sortOrder: 'asc',
  };
}

// 전역 핸들러 등록 (한 번만)
onMounted(() => {
  if (!window.__userSelectHandlerRegistered) {
    window.handleUserSelect = (selectedItems) => {
      if (window.__userSelectCallback__) {
        window.__userSelectCallback__(selectedItems);
        window.__userSelectCallback__ = null;
      }
    };
    window.__userSelectHandlerRegistered = true;
  }
});
</script>

<template>
  <form @submit.prevent="triggerSearch" class="custom-sidebar flex flex-col gap-8">
    <!-- 검색조건 -->
    <div>
      <div class="font-bold mb-3">검색조건</div>

      <!-- 카테고리 -->
      <select v-model="localValue.searchType" class="input-form-box mb-2 w-full">
        <option value="all">전체</option>
        <option value="campaignName">캠페인명</option>
        <option value="clientCompanyName">광고업체명</option>
        <option value="clientManagerName">광고담당자명</option>
      </select>

      <!-- 키워드 -->
      <input
        v-model="localValue.keyword"
        placeholder="검색어"
        class="input-form-box mb-2 w-full"
      />

      <!-- 담당자 -->
      <div class="flex mb-2">
        <input
          :value="localValue.user?.name ?? ''"
          placeholder="담당자"
          class="input-form-box flex-1"
          readonly
        />
        <button
          type="button"
          @click="openUserSearch"
          class="ml-1 px-2 bg-gray-200 rounded text-sm"
        >
          <img src="@/assets/icons/add.svg" alt="추가" class="w-5 select-none" />
        </button>
      </div>
    </div>
    <button type="submit" class="btn-create">검색</button>
  </form>
</template>
