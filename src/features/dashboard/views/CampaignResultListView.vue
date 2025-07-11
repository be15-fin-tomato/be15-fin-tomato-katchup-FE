<template>
  <div class="container">
    <div class="page-header flex justify-between items-center mb-4">
      <div class="flex items-center">
        <div class="page-title">캠페인 성과 목록</div>
        <span class="cnt-search ml-2">(검색 결과: {{ total }} 건)</span>
      </div>
    </div>

    <div class="mb-6 flex justify-end">
      <input
        v-model="campaignNameSearchQuery"
        @keyup.enter="handleSearch"
        placeholder="캠페인명으로 검색"
        class="input-form-box p-3 border border-blue-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-400 w-1/3"
      />
      <button
        @click="handleSearch"
        class="ml-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-5 rounded-lg text-base transition duration-300 ease-in-out"
      >
        검색
      </button>
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
</template>

<script setup>
import { useRouter } from 'vue-router';
import { computed, onMounted, ref } from 'vue';

import Pagination from '@/components/common/PagingBar.vue';

import { getCampaignResultList } from '@/features/dashboard/api.js';
import SalesCards from '@/features/campaign/components/SalesCards.vue';

const router = useRouter();

const campaignResultList = ref([]);
const page = ref(1);
const size = ref(10); // 프론트엔드에서 한 페이지당 보여줄 항목 수
const total = ref(0);
const isLoading = ref(true);

const totalPages = computed(() => Math.ceil(total.value / size.value));

// 캠페인명 검색어를 위한 ref 변수
const campaignNameSearchQuery = ref('');

const menuOpenId = ref(null);

const handlePageChange = async (newPage) => {
  page.value = newPage;
  await fetchCampaignResultList();
};

const handleSearch = () => {
  page.value = 1; // 검색 버튼 클릭 시 항상 첫 페이지로 리셋
  fetchCampaignResultList();
};

const goDetail = (pipelineId) => {
  router.push(`/campaign/dashboard/${pipelineId}`);
};

const handleDelete = (pipelineId) => {
  if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
    console.log('삭제 요청:', pipelineId);
    campaignResultList.value = campaignResultList.value.filter(
      (item) => item.pipelineId !== pipelineId,
    );
    total.value = campaignResultList.value.length;
    menuOpenId.value = null;
  }
};

const toggleMenu = (id) => {
  menuOpenId.value = menuOpenId.value === id ? null : id;
};

const fetchCampaignResultList = async () => {
  isLoading.value = true;
  try {
    const params = {
      page: page.value,
      size: size.value,
      name: campaignNameSearchQuery.value,
    };

    const apiResponse = await getCampaignResultList(params);

    // API 응답 구조가 { data: [캠페인 결과 목록], total: 총 개수 } 인지 확인
    campaignResultList.value = apiResponse.data || [];
    total.value = apiResponse.total || 0; // 백엔드에서 받은 total 값을 사용

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

<style scoped>
.input-form-box {
}
</style>
