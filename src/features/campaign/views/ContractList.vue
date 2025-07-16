<script setup>
import { useRouter } from 'vue-router';
import { deleteContract, getContractList } from '@/features/campaign/api.js';
import { computed, onMounted, ref } from 'vue';
import SalesCards from '@/features/campaign/components/SalesCards.vue';
import SalesFiltering from '@/components/layout/SalesFiltering.vue';
import Pagination from '@/components/common/PagingBar.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

const contractList = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / size.value));

const categoryOptions = [
    { value: 'title', label: '제목' },
    { value: 'clientCompany', label: '고객사' },
    { value: 'user', label: '광고 담당자' },
];

const filterOptions = [
    { value: 1, label: '승인요청' },
    { value: 2, label: '승인완료' },
    { value: 3, label: '보류/대기' },
    { value: 4, label: '승인거절' },
];

const searchFilters = ref({
    category: '',
    keyword: '',
    userId: null,
    filter: '',
    sort: 'date',
    sortOrder: 'desc',
});

// 목록 불러오기
const fetchContractList = async () => {
    try {
        const res = await getContractList(page.value, size.value, searchFilters.value);
        contractList.value = res.data.data.response;
        total.value = res.data.data.pagination.totalCount;
    } catch (e) {
        console.error(e);
    }
};

onMounted(fetchContractList);

const handlePageChange = async (newPage) => {
    page.value = newPage;
    await fetchContractList();
};

const handleSearch = () => {
    page.value = 1;
    fetchContractList();
};

const goDetail = (id) => {
    router.push(`/sales/contract/${id}`);
};

const handleDelete = async (id) => {
    try {
        await deleteContract(id);
        toast.success('견적이 삭제되었습니다.');
        await fetchContractList();
    } catch (e) {
        toast.error(e.response.data.message);
    }
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
                    <div class="page-title">계약 목록</div>
                    <span class="cnt-search ml-2">(검색 결과: {{ total }} 건)</span>
                </div>

                <!-- 우측: 버튼 영역 -->
                <div class="flex gap-2">
                    <button class="btn-create" @click="router.push('/sales/contract/create')">
                        추가
                    </button>
                </div>
            </div>
            <div class="blue-line"></div>
            <div class="grid grid-cols-2 gap-6">
                <SalesCards
                    v-for="contract in contractList"
                    :key="contract.pipelineId"
                    :management-option="contract"
                    :openMenuId="menuOpenId"
                    :pageType="'contract'"
                    @menuToggle="toggleMenu"
                    @delete="handleDelete"
                    @click="goDetail(contract.pipelineId)"
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
