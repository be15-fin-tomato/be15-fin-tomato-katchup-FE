<script setup>
import { useRouter } from 'vue-router';
import { deleteListup, getListUpList } from '@/features/campaign/api.js';
import { computed, onMounted, ref } from 'vue';
import SalesCards from '@/features/campaign/components/SalesCards.vue';
import SalesFiltering from '@/components/layout/SalesFiltering.vue';
import Pagination from '@/components/common/PagingBar.vue';
import { useToast } from 'vue-toastification';

const router = useRouter();
const toast = useToast();

const listupList = ref([]);
const page = ref(1);
const size = ref(10);
const total = ref(0);
const totalPages = computed(() => Math.ceil(total.value / size.value));

const categoryOptions = [
    { value: 'title', label: '제목' },
    { value: 'clientCompany', label: '고객사' },
    // { value: 'user', label: '담당자' },
];

const searchFilters = ref({
    category: '',
    keyword: '',
    userId: null,
    filter: '',
    sort: 'date',
    sortOrder: 'asc',
});

// 목록 불러오기
const fetchListUpList = async () => {
    try {
        const res = await getListUpList(page.value, size.value, searchFilters.value);
        listupList.value = res.data.data.response;
        total.value = res.data.data.pagination.totalCount;
    } catch (e) {
        toast.error(e.response.data.message || '리스트업 목록 조회에 실패하였습니다.');
    }
};

onMounted(fetchListUpList);

const handlePageChange = async (newPage) => {
    page.value = newPage;
    await fetchListUpList();
};

const handleSearch = () => {
    page.value = 1;
    fetchListUpList();
};

const goDetail = (id) => {
    router.push(`/influencer/recommendation/${id}`);
};

const handleDelete = async (id) => {
    try {
        await deleteListup(id);
        toast.success('리스트업이 삭제되었습니다.');
        await fetchListUpList();
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
            @search="handleSearch"
        />

        <div class="container">
            <div class="page-header flex justify-between items-center">
                <!-- 좌측: 제목 + 검색결과 -->
                <div class="flex items-center">
                    <div class="page-title">리스트업 목록</div>
                    <span class="cnt-search ml-2">(검색 결과: {{ total }} 건)</span>
                </div>

                <!-- 우측: 버튼 영역 -->
                <div class="flex gap-2">
                    <button class="btn-create" @click="router.push('/influencer/recommendation')">
                        추가
                    </button>
                </div>
            </div>
            <div class="blue-line"></div>
            <div class="grid grid-cols-2 gap-6">
                <SalesCards
                    v-for="listup in listupList"
                    :key="listup.pipelineId"
                    :management-option="listup"
                    :openMenuId="menuOpenId"
                    :pageType="'listup'"
                    @menuToggle="toggleMenu"
                    @delete="handleDelete"
                    @click="goDetail(listup.pipelineId)"
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
