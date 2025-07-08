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

const currentPageZeroBased = ref(0); // 0부터 시작하는 페이지 인덱스
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
  const selectedTag = categoryMap[selectedCategory.value];
  const params = {
    page: currentPageZeroBased.value,
    size: pageSize,
    ...(selectedTag !== 'ALL' && { category: selectedTag })
  };

  const res = await fetchInfluencerList(params);
  influencerList.value = res.data.data.data;
  totalCount.value = res.data.data.pagination.totalCount;
  totalPages.value = res.data.data.pagination.totalPage;
}

onMounted(async () => {
  const categoryRes = await fetchCategoryList();
  const rawCategories = categoryRes.data.data;
  categoryList.value = ['전체', ...rawCategories.map(cat => reverseCategoryMap[cat.categoryName] || cat.categoryName)];

  await loadInfluencers();
})

watch(selectedCategory, () => {
  currentPageZeroBased.value = 0; // 카테고리 바꾸면 페이지 0으로
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

      <div class="flex flex-1 py-5 ml-5 mr-4 justify-between text-gray-medium text-sm">
        <span>프로필</span>
        <span>채널명</span>
        <span>인스타 아이디</span>
        <span>유튜브 구독자 수</span>
        <span>인스타 팔로워 수</span>
        <span>타깃 성별</span>
        <span>타깃 연령대</span>
      </div>

      <div v-if="influencerList.length === 0" class="text-center text-gray-500 py-10">
        해당하는 인플루언서가 없습니다.
      </div>

      <div v-else v-for="influencer in influencerList" :key="influencer.influencerId">
        <InfluencerCard :influencer="influencer" />
      </div>

      <!-- 페이지네이션 -->
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

