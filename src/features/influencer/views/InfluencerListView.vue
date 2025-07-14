<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import InfluencerCard from '@/components/common/InfluencerCard.vue'
import InfluencerCategory from '@/features/influencer/components/InfluencerCategory.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import { fetchCategoryList, fetchInfluencerList } from '@/features/influencer/api.js';
import InfluencerListFilter from '@/components/common/InfluencerListFilter.vue';

const influencerList = ref([])
const selectedCategory = ref('전체')
const categoryList = ref([])

const filters = ref({
    category: 'ALL',  // 기본값 전체
});


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
    const params = {
        page: currentPageZeroBased.value,
        size: pageSize,
        ...filters.value,  // 여기에 category, 기타 필터 조건 포함
    };

    const res = await fetchInfluencerList(params);
    influencerList.value = res.data.data.data;

    totalCount.value = res.data.data.pagination.totalCount;
    totalPages.value = res.data.data.pagination.totalPage;
}


function handleApplyFilters(newFilters) {
    filters.value = { ...filters.value, ...newFilters };
    currentPageZeroBased.value = 0;
    loadInfluencers();
}


onMounted(async () => {
    const categoryRes = await fetchCategoryList();
    const rawCategories = categoryRes.data.data;
    categoryList.value = ['전체', ...rawCategories.map(cat => reverseCategoryMap[cat.categoryName] || cat.categoryName)];

    await loadInfluencers();
})

watch([filters, currentPageZeroBased], () => {
    loadInfluencers();
}, { deep: true });

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
                @update:selected="(cat) => handleApplyFilters({ category: categoryMap[cat] || 'ALL' })"
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

