<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import InfluencerCard from '@/components/common/InfluencerCard.vue'
import CommonFiltering from '@/components/layout/CommonFiltering.vue';
import InfluencerCategory from '@/features/influencer/components/InfluencerCategory.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import { fetchCategoryList, fetchInfluencerList } from '@/features/influencer/api.js';

const influencerList = ref([])
const selectedCategory = ref('전체')
const categoryList = ref([])
const isLoading = ref(false);

const currentPageZeroBased = ref(0);
const pageSize = 6;
const totalCount = ref(0);
const totalPages = ref(0);

const categoryMap = {
  '전체': 'ALL',
  '엔터테인먼트': 'Entertainment',
  '일상': 'LifeStyle',
  '푸드': 'Food',
  '게임': 'Gaming',
  '뷰티/패션': 'Fashion & Beauty',
  '여행': 'Travel',
  '동물': 'Pet',
  '교육': 'Education',
  '기술': 'Technology',
  '건강/운동': 'Health & Fitness',
  '키즈': 'Family & Kids',
}
const reverseCategoryMap = Object.fromEntries(Object.entries(categoryMap).map(([ko, en]) => [en, ko]))

const currentPage = computed({
  get: () => currentPageZeroBased.value + 1,
  set: (val) => currentPageZeroBased.value = val - 1
})

async function loadInfluencers() {
  isLoading.value = true;
  const params = {
    page: currentPageZeroBased.value,
    size: pageSize,
  };

  try {
    const res = await fetchInfluencerList(params);
    const rawList = res.data.data.data;

    if (selectedCategory.value === '전체') {
      influencerList.value = rawList;
    } else {
      const selectedEngCategory = categoryMap[selectedCategory.value];
      influencerList.value = rawList.filter(influencer =>
        influencer.tags?.some(tag => tag.categoryName === selectedEngCategory)
      );
    }

    totalCount.value = res.data.data.pagination.totalCount;
    totalPages.value = res.data.data.pagination.totalPage;
  } catch (error) {
    console.error("인플루언서 목록을 불러오는데 실패했습니다:", error);
  } finally {
    isLoading.value = false;
  }
}

onMounted(async () => {
  const categoryRes = await fetchCategoryList();
  const rawCategories = categoryRes.data.data;
  categoryList.value = [
    '전체', ...rawCategories.map(cat => reverseCategoryMap[cat.categoryName] || cat.categoryName)
  ];

  await loadInfluencers();
})

watch(selectedCategory, () => {
  currentPageZeroBased.value = 0;
  loadInfluencers();
})

watch(currentPageZeroBased, () => {
  loadInfluencers();
})
</script>

<template>
  <div class="w-full min-h-screen bg-background flex font-sans">
    <CommonFiltering />
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
        @update:selected="selectedCategory = $event"
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

      <div v-if="isLoading" class="text-center text-gray-500 py-10">
        데이터를 불러오는 중입니다...
      </div>

      <div v-else-if="influencerList.length === 0" class="text-center text-gray-500 py-10">
        해당하는 인플루언서가 없습니다.
      </div>

      <div v-else v-for="influencer in influencerList" :key="influencer.influencerId">
        <InfluencerCard :influencer="influencer" />
      </div>

      <!-- 페이지네이션 -->
      <div v-if="!isLoading && totalPages > 1" class="flex justify-center mt-8">
        <PagingBar
          :totalPages="totalPages"
          :currentPage="currentPage"
          @update:currentPage="(val) => currentPage = val"
        />
      </div>
    </div>
  </div>
</template>

