<template>
    <div class="flex">
        <SalesFiltering
            v-model="searchFilters"
            :categoryOptions="categoryOptions"
            :filterOptions="filterOptions"
            @search="handleSearch"
        />

        <div class="container">
            <div class="page-header flex justify-between items-center">
                <div class="flex items-center">
                    <div class="page-title">캠페인 성과 목록</div>
                    <span class="cnt-search ml-2">(검색 결과: {{ total }} 건)</span>
                </div>
            </div>

            <div class="blue-line"></div>

            <div class="grid grid-cols-2 gap-6">
                <template v-if="isLoading">
                    <p class="col-span-2 text-center text-gray-dark py-10">
                        데이터를 불러오는 중입니다...
                    </p>
                </template>
                <template v-else-if="campaignResultList.length === 0">
                    <p class="col-span-2 text-center text-gray-dark py-10">데이터가 없습니다.</p>
                </template>
                <template v-else>
                    <SalesCards
                        v-for="campaignResult in campaignResultList"
                        :key="campaignResult.pipelineId"
                        :managementOption="campaignResult"
                        :openMenuId="menuOpenId"
                        :pageType="'campaignResult'"
                        @menuToggle="toggleMenu"
                        @delete="handleDelete"
                        @click="() => goDetail(campaignResult.pipelineId)"
                    />
                </template>
            </div>

            <Pagination
                v-if="!isLoading && total > 0"
                :currentPage="page"
                :totalPages="totalPages"
                @update:currentPage="handlePageChange"
            />
        </div>
    </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';

// Component Imports
import SalesFiltering from '@/components/layout/SalesFiltering.vue';
import CampaignResultCard from '@/features/dashboard/components/CampaignResultCard.vue';
import Pagination from '@/components/common/PagingBar.vue';

import { getCampaignResultList } from '@/features/dashboard/api.js';
import SalesCards from '@/features/campaign/components/SalesCards.vue';

const router = useRouter();

const campaignResultList = ref([]);
const page = ref(1); // Current page, starts from 1
const size = ref(10); // Items per page
const total = ref(0); // Total number of results
const isLoading = ref(true); // Loading state

// Computed Properties
const totalPages = computed(() => Math.ceil(total.value / size.value));

// Filter Options for SalesFiltering
const filterOptions = ref([]);

// Search Category Options for SalesFiltering
const categoryOptions = [
    { value: 'all', label: '전체' },
    { value: '제목', label: '제목' },
    { value: '고객사', label: '고객사' },
    { value: '담당자', label: '담당자' },
];

// Search Filters (v-model for SalesFiltering)
const searchFilters = ref({
    searchCondition: 'all',
    keyword: '',
    filterType: '',
    sortBy: 'registrationDate',
    sortOrder: 'desc',
});

const menuOpenId = ref(null);

const handlePageChange = async (newPage) => {
    page.value = newPage;
    await fetchCampaignResultList();
};

// Handles search action from SalesFiltering component
const handleSearch = () => {
    page.value = 1;
    fetchCampaignResultList();
};

// Navigates to the detail page for a specific campaign result
const goDetail = (pipelineId) => {
    router.push(`/campaign/dashboard/${pipelineId}`);
};

// Handles delete action for a campaign result (client-side mock for now)
const handleDelete = (pipelineId) => {
    if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
        console.log('삭제 요청:', pipelineId);
        campaignResultList.value = campaignResultList.value.filter(
            (item) => item.pipelineId !== pipelineId,
        );
        total.value = campaignResultList.value.length; // 목록에서 제거했으므로 total도 업데이트

        menuOpenId.value = null; // 메뉴 닫기
    }
};

// Toggles the dropdown menu for a specific card
const toggleMenu = (id) => {
    menuOpenId.value = menuOpenId.value === id ? null : id;
};

// Fetches campaign result list data from the backend
const fetchCampaignResultList = async () => {
    isLoading.value = true;
    try {
        const params = {
            page: page.value,
            size: size.value,
            searchCondition: searchFilters.value.searchCondition,
            keyword: searchFilters.value.keyword,
            filterType: searchFilters.value.filterType,
            sortBy: searchFilters.value.sortBy,
            sortOrder: searchFilters.value.sortOrder,
        };

        const apiResponse = await getCampaignResultList(params);

        campaignResultList.value = apiResponse.data || [];
        total.value = apiResponse.total || 0;

        console.log('백엔드에서 가져온 캠페인 결과 (프론트엔드):', campaignResultList.value);
        console.log('총 결과 개수 (프론트엔드):', total.value);
    } catch (error) {
        console.error('캠페인 결과를 가져오는 중 오류 발생:', error);
        campaignResultList.value = [];
        total.value = 0;
    } finally {
        isLoading.value = false;
    }
};

onMounted(async () => {
    await fetchCampaignResultList();
});
</script>
