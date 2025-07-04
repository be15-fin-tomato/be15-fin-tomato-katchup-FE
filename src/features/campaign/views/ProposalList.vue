<script setup>
import { useRouter } from 'vue-router';
import { getProposalList } from '@/features/campaign/api.js';
import { computed, onMounted, ref } from 'vue';
import SalesCards from '@/features/campaign/components/SalesCards.vue';
import SalesFiltering from '@/components/layout/SalesFiltering.vue';
import Pagination from '@/components/common/PagingBar.vue';
import { categoryOptions, filterOptions } from '@/features/campaign/constants/filterOptions.js';
import { cleanFilterObject } from '@/utils/CleanFilter.js';

const router = useRouter();

const proposalList = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / size.value));

const searchFilters = ref({
    category: '',
    keyword: '',
    manager: null,
    filter: '',
    sort: 'date',
    sortOrder: 'asc',
});

// 목록 불러오기
const fetchProposalList = async () => {
    try {
        const cleanedFilters = cleanFilterObject(searchFilters.value);
        const res = await getProposalList(page.value, size.value, cleanedFilters);
        console.log(res.data.data.response);
        proposalList.value = [...res.data.data.response];
        total.value = res.data.total;
    } catch (e) {
        console.error(e);
    }
};

onMounted(fetchProposalList);

const handlePageChange = async (newPage) => {
    page.value = newPage;
    await fetchProposalList();
};

const handleSearch = async () => {
    page.value = 1;
    await fetchProposalList();
};

const goDetail = (id) => {
    router.push(`/sales/proposal/${id}`);
};

const handleDelete = (id) => {
    proposalList.value = proposalList.value.filter((item) => item.id !== id);
};

const menuOpenId = ref(null);
const toggleMenu = (id) => {
    menuOpenId.value = menuOpenId.value === id ? null : id;
};
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
                    <div class="page-title">제안 목록</div>
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
                    v-for="proposal in proposalList"
                    :key="proposal.pipelineId"
                    :managementOption="proposal"
                    :openMenuId="menuOpenId"
                    :pageType="'proposal'"
                    @menuToggle="toggleMenu"
                    @delete="handleDelete"
                    @click="goDetail(proposal.pipelineId)"
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
