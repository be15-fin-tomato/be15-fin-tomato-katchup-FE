<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import InfluencerCard from '@/components/common/InfluencerCard.vue'
import InfluencerCategory from '@/features/influencer/components/InfluencerCategory.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import { fetchCategoryList, fetchInfluencerList } from '@/features/influencer/api.js';
import InfluencerListFilter from '@/components/common/InfluencerListFilter.vue';

const influencerList = ref([])
const categoryList = ref([])
const categoryNameToIdMap = ref({});

const filters = ref({});

const currentPageZeroBased = ref(0);
const pageSize = 6;
const totalCount = ref(0);
const totalPages = ref(0);

const reverseCategoryMap = {
  'Entertainment': '엔터테인먼트',
  'LifeStyle': '일상',
  'Food': '푸드',
  'Gaming': '게임',
  'Fashion & Beauty': '뷰티/패션',
  'Travel': '여행',
  'Pet': '동물',
  'Education': '교육',
  'Technology': '기술',
  'Health & Fitness': '건강/운동',
  'Family & Kids': '키즈',
};

const currentPage = computed({
  get: () => currentPageZeroBased.value + 1,
  set: (val) => currentPageZeroBased.value = val - 1
});

async function loadInfluencers() {
  const params = {
    page: currentPageZeroBased.value,
    size: pageSize,
    ...filters.value,
  };

  if (params.categoryIds && params.categoryIds.length === 0) {
    delete params.categoryIds;
  }

    console.log('[loadInfluencers] 호출 파라미터:', params);

  try {
    const res = await fetchInfluencerList(params);
    influencerList.value = res.data.data.data;
    totalCount.value = res.data.data.pagination.totalCount;
    totalPages.value = res.data.data.pagination.totalPage;
  } catch (error) {
    console.error("인플루언서 목록을 불러오는 데 실패했습니다:", error);
    influencerList.value = [];
  }
}

// [수정] 필터 적용 함수
function handleApplyFilters(newFilters) {
    console.log('[handleApplyFilters] 전달된 필터:', newFilters);

    let updatedFilters = {};

    if (Object.keys(newFilters).length === 0) {
        // 빈 객체면 완전 초기화
        updatedFilters = {};
    } else {
        updatedFilters = { ...filters.value, ...newFilters };

        if (newFilters.categoryIds && newFilters.categoryIds.length === 0) {
            delete updatedFilters.categoryIds;
        }
    }

    filters.value = updatedFilters;
    currentPageZeroBased.value = 0;

    console.log('[handleApplyFilters] filters.value 상태:', filters.value);
}


onMounted(async () => {
  try {
    const categoryRes = await fetchCategoryList();
    const rawCategories = categoryRes.data.data;

    const nameToId = {};
    const displayCategories = ['전체'];

    rawCategories.forEach(cat => {
      const koreanName = reverseCategoryMap[cat.categoryName] || cat.categoryName;
      displayCategories.push(koreanName);
      nameToId[koreanName] = cat.categoryId;
    });

    categoryList.value = displayCategories;
    categoryNameToIdMap.value = nameToId;
  } catch (error) {
    console.error("카테고리 목록을 불러오는 데 실패했습니다:", error);
  }
  await loadInfluencers();
});

watch(
  () => ({ ...filters.value, page: currentPageZeroBased.value }),
  () => {
    loadInfluencers();
  },
  { deep: true }
);
</script>

<template>
  <div class="w-full min-h-screen bg-background flex font-sans">
    <InfluencerListFilter @apply-filters="handleApplyFilters" />
    <div class="container">
      <div class="page-header">
        <div class="page-title">
          인플루언서
          <span class="cnt-search"> (검색 결과: {{ totalCount }}건) </span>
        </div>
      </div>
      <div class="blue-line"></div>

      <InfluencerCategory
        :categories="categoryList"
        @update:selected="(cat) => {
                    const categoryId = categoryNameToIdMap[cat];
                    handleApplyFilters({ categoryIds: categoryId ? [categoryId] : [] });
                }"
      />

      <div class="grid w-full grid-cols-11 items-center px-5 py-5 text-gray-medium">
        <div class="flex items-center gap-12 col-span-3">
          <span>대표사진</span>
          <span>유튜브 채널명</span>
        </div>
        <span class="col-span-2">인스타그램 ID</span>
        <span class="text-center col-span-2">유튜브 구독자</span>
        <span class="text-center col-span-2">인스타그램  팔로워</span>
        <span class="text-center col-span-1">타깃 성별</span>
        <span class="text-center col-span-1">타깃 연령대</span>
      </div>

      <div v-if="influencerList.length === 0" class="text-center text-gray-500 py-10">
        해당하는 인플루언서가 없습니다.
      </div>

      <div v-else v-for="influencer in influencerList" :key="influencer.influencerId">
        <InfluencerCard :influencer="influencer" />
      </div>

      <div v-if="totalPages > 1" class="flex justify-center mt-8">
        <PagingBar
          :totalPages="totalPages"
          :currentPage="currentPage"
          @update:currentPage="(val) => currentPage = val"
        />
      </div>
    </div>
  </div>
</template>
