<script setup>
import { useRouter } from 'vue-router';
import { deleteQuotationDetail, getQuotationList } from '@/features/campaign/api.js';
import { computed, onMounted, ref } from 'vue';
import SalesCards from '@/features/campaign/components/SalesCards.vue';
import SalesFiltering from '@/components/layout/SalesFiltering.vue';
import Pagination from '@/components/common/PagingBar.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

const quotationList = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / size.value));

const categoryOptions = [
    { value: 'title', label: '제목' },
    { value: 'clientCompany', label: '고객사' },
    { value: 'user', label: '담당자' },
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
    manager: null,
    filter: '',
    sort: 'date',
    sortOrder: 'asc',
});

// 목록 불러오기
const fetchQuotationList = async () => {
    try {
        // quotationList.value = [];
        const res = await getQuotationList(page.value, size.value, searchFilters.value);
        quotationList.value = [...res.data.data.response];
        total.value = res.data.data.pagination.totalCount;
    } catch (e) {
        toast.error(e.response.data.message);
    }
};

onMounted(fetchQuotationList);

const handlePageChange = async (newPage) => {
    page.value = newPage;
    await fetchQuotationList();
};

const handleSearch = () => {
    page.value = 1;
    fetchQuotationList();
};

const goDetail = (id) => {
    router.push(`/sales/quotation/${id}`);
};

const handleDelete = async (id) => {
    try {
        await deleteQuotationDetail(id);
        toast.success('견적이 삭제되었습니다.');
        await fetchQuotationList();
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
                    <div class="page-title">견적 목록</div>
                    <span class="cnt-search ml-2">(검색 결과: {{ total }} 건)</span>
                </div>

                <!-- 우측: 버튼 영역 -->
                <div class="flex gap-2">
                    <button class="btn-create" @click="router.push('/sales/quotation/create')">
                        추가
                    </button>
                </div>
            </div>
            <div class="blue-line"></div>
            <div class="grid grid-cols-2 gap-6">
                <SalesCards
                    v-for="quotation in quotationList"
                    :key="quotation.pipelineId"
                    :management-option="quotation"
                    :openMenuId="menuOpenId"
                    :pageType="'quotation'"
                    @menuToggle="toggleMenu"
                    @delete="handleDelete"
                    @click="goDetail(quotation.pipelineId)"
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
