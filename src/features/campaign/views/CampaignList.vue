<template>
    <div class="flex flex-col">
        <HorizontalFiltering @filter="handleFilter" />
        <div class="container">
            <div class="page-header">
                <div class="page-title">
                    파이프라인
                    <span class="cnt-search">(검색결과: {{ total }}건)</span>
                </div>
                <button class="btn-create" @click="router.push('/campaign/create')">등록</button>
            </div>

            <div class="blue-line"></div>

            <PipelineCard :campaigns="campaigns" />

            <!-- 페이지네이션 컴포넌트 적용 -->
            <Pagination
                :current-page="page"
                :total-pages="totalPages"
                @update:currentPage="handlePageChange"
            />
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { getCampaignList } from '@/features/campaign/api.js';
import PipelineCard from '@/features/campaign/components/PipelineCard.vue';
import Pagination from '@/components/common/PagingBar.vue';
import { useRouter } from 'vue-router';
import HorizontalFiltering from '@/components/layout/HorizontalFiltering.vue';
import { cleanFilterObject } from '@/utils/CleanFilter.js';

const router = useRouter();

const campaigns = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const filterConditions = ref({
    steps: [],
    statuses: [],
    clientCompany: '',
    internalManager: '',
    minBudget: null,
    maxBudget: null,
    startDate: null,
    endDate: null,
});

const totalPages = computed(() => Math.ceil(total.value / size.value));

const fetchCampaigns = async () => {
    const { startDate, endDate } = filterConditions.value;

    if (startDate && endDate && startDate > endDate) {
        alert('시작일은 종료일보다 빠르거나 같아야 합니다.');
        return;
    }

    const cleanedFilters = cleanFilterObject(filterConditions.value);

    const res = await getCampaignList(page.value, size.value, cleanedFilters);
    campaigns.value = res.data.data.campaignList;
    total.value = res.data.data.pagination.totalCount;
};

const handleFilter = async (filters) => {
    filterConditions.value = filters;
    page.value = 1;
    await fetchCampaigns();
};

onMounted(fetchCampaigns);

const handlePageChange = async (newPage) => {
    page.value = newPage;
    await fetchCampaigns();
};
</script>
