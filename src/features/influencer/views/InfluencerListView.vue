<script setup>
import { ref, onMounted, computed } from 'vue';
import InfluencerCard from '@/components/common/InfluencerCard.vue'
import CommonFiltering from '@/components/layout/CommonFiltering.vue';
import InfluencerCategory from '@/features/influencer/components/InfluencerCategory.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import { fetchCategoryList, fetchInfluencerList } from '@/features/influencer/api.js';

const influencerList = ref([])
const selectedCategory = ref('전체')
const categoryList = ref([])

const currentPage = ref(1)
const pageSize = 6

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

const reverseCategoryMap = Object.fromEntries(
  Object.entries(categoryMap).map(([ko, en]) => [en, ko])
)

onMounted(async () => {
  // 카테고리 호출 및 한글화
  const categoryRes = await fetchCategoryList()
  const rawCategories = categoryRes.data.data
  categoryList.value = ['전체', ...rawCategories.map(cat => reverseCategoryMap[cat.categoryName] || cat.categoryName)]

  // 인플루언서 호출
  const influencerRes = await fetchInfluencerList()
  influencerList.value = influencerRes.data.data.data
})

const filteredList = computed(() => {
  const selectedTag = categoryMap[selectedCategory.value]
  if (selectedTag === 'ALL') return influencerList.value

  return influencerList.value.filter(item =>
    (item.tags ?? []).some(tag => tag.categoryName === selectedTag)
  )
})

const totalCount = computed(() => filteredList.value.length)
const totalPages = computed(() => Math.ceil(totalCount.value / pageSize))
const paginatedList = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  return filteredList.value.slice(start, start + pageSize)
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

          <div v-if="paginatedList.length === 0" class="text-center text-gray-500 py-10">
            해당하는 인플루언서가 없습니다.
          </div>

          <div v-else v-for="influencer in paginatedList" :key="influencer.influencerId">
            <InfluencerCard :influencer="influencer" />
          </div>

        <!-- 페이지네이션 -->
          <div v-if="totalPages > 0" class="flex justify-center mt-8">
            <PagingBar
              :totalPages="totalPages"
              :currentPage="currentPage"
              @update:currentPage="(val) => currentPage = val"
            />
          </div>
      </div>
  </div>
</template>
