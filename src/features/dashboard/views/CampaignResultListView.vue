<script setup>
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';
import SalesFiltering from '@/components/layout/SalesFiltering.vue';
import SalesCards from '@/features/campaign/components/SalesCards.vue';
import Pagination from '@/components/common/PagingBar.vue';
import { getCampaignResultList } from '@/features/dashboard/api.js';

const router = useRouter();

const campaignResultList = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / size.value));

// 검색 필터 카테고리 옵션
const categoryOptions = [
    { value: 'title', label: '제목' },
    { value: 'clientCompany', label: '고객사' },
    { value: 'user', label: '담당자' },
];

// 검색 필터
const searchFilters = ref({
    category: '',
    keyword: '',
    manager: null,
    filter: '',
    sort: 'date',
    sortOrder: 'asc',
});

const handlePageChange = async (newPage) => {
    page.value = newPage;
    await fetchCampaignResultList();
};

const handleSearch = () => {
    page.value = 1;
    fetchCampaignResultList();
};

const goDetail = (id) => {
    router.push(`/campaign/dashboard/${id}`);
};

const handleDelete = (id) => {
    campaignResultList.value = campaignResultList.value.filter((item) => item.id !== id);
};

const fetchCampaignResultList = async () => {
    try {
        const res = await getCampaignResultList(page.value, size.value, searchFilters.value);
        campaignResultList.value = res.data.data;
        console.log(campaignResultList.value);
        total.value = res.data.total;
    } catch (e) {
        console.error(e);
    }
};

const menuOpenId = ref(null);
const toggleMenu = (id) => {
    menuOpenId.value = menuOpenId.value === id ? null : id;
};

onMounted(async () => {
    await Promise.all([fetchCampaignResultList()]);
});
</script>

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
                <!-- 좌측: 제목 + 검색결과 -->
                <div class="flex items-center">
                    <div class="page-title">캠페인 성과 목록</div>
                    <span class="cnt-search ml-2">(검색 결과: {{ total }} 건)</span>
                </div>

                <!-- 우측: 버튼 영역 -->
                <div class="flex gap-2">
                    <button class="btn-create" @click="router.push('/sales/proposal/create')">
                        추가
                    </button>
                </div>
            </div>
            <div class="blue-line"></div>
            <div class="grid grid-cols-2 gap-6">
                <SalesCards
                    v-for="campaignResult in campaignResultList"
                    :key="campaignResult.id"
                    :managementOption="campaignResult"
                    :openMenuId="menuOpenId"
                    :pageType="'campaignResult'"
                    @menuToggle="toggleMenu"
                    @delete="handleDelete"
                    @click="() => goDetail(campaignResult.id)"
                />
            </div>

            <Pagination
                :currentPage="page"
                :totalPages="totalPages"
                @update:currentPage="handlePageChange"
            />
        </div>
    </div>
</template>

<style scoped></style>
