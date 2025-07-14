<script setup>
import { ref, onMounted, watch } from 'vue';
import Filtering from '@/features/user/components/Filtering.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import SatisfactionCard from '@/features/user/components/SatisfactionCard.vue';
import ChartCard from '@/features/user/components/ChartCard.vue';
import { fetchSatisfactionList } from '@/features/user/api';

const currentPage = ref(1);
const pageSize = 10;
const totalPages = ref(0);
const totalCount = ref(0);
const satisfactionList = ref([]);

const searchModel = ref({
  searchType: 'all',
  keyword: '',
  user: null,
  sort: 'date',
  sortOrder: 'asc',
});

const loadSatisfactionList = async () => {
  try {
    const { data } = await fetchSatisfactionList({
      searchType: searchModel.value.searchType,
      keyword: searchModel.value.keyword,
      userName: searchModel.value.user?.name ?? '',
      page: currentPage.value,
      size: pageSize,
    });
    satisfactionList.value = data.data.campaignSatisfaction;
    totalPages.value = data.data.pagination.totalPage;
    totalCount.value = data.data.pagination.totalCount;
  } catch (err) {
    console.error('만족도 조회 실패:', err);
  }
};

const handleSearch = (filters) => {
  searchModel.value = filters;
  currentPage.value = 1;
  loadSatisfactionList();
};

watch(currentPage, () => {
  loadSatisfactionList();
});

onMounted(() => {
  loadSatisfactionList();
});
</script>

<template>
  <div class="w-full min-h-screen bg-background flex">
    <Filtering
      v-model="searchModel"
      @search="handleSearch"
    />

    <div class="flex flex-col flex-1 container bg-white">
      <div class="page-header">
        <div class="page-title">
          만족도 조사 목록
          <span class="text-sm text-gray-400 ml-1">
            (검색 결과: {{ totalCount }}건)
          </span>
        </div>
      </div>
      <div class="blue-line"></div>

      <div class="grid grid-cols-2 gap-x-20 gap-y-20 px-6">
        <ChartCard />
        <SatisfactionCard />
      </div>

      <table class="w-full text-sm text-center border-t mt-10 border-gray-400">
        <thead class="text-sm font-semibold border-b border-gray-400">
        <tr>
          <th class="py-2">고객</th>
          <th>회사명</th>
          <th>진행 캠페인</th>
          <th>인플루언서명</th>
          <th>발송일</th>
          <th>응답일</th>
          <th>응답 상태</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="item in satisfactionList" :key="item.satisfactionId">
          <td class="py-2">{{ item.clientManagerName || '-' }}</td>
          <td>{{ item.clientCompanyName || '-' }}</td>
          <td>{{ item.campaignName || '-' }}</td>
          <td>{{ item.influencerName || '-' }}</td>
          <td>{{ item.sentDate ? item.sentDate : '-' }}</td>
          <td>{{ item.responseDate ? item.responseDate : '-' }}</td>
          <td
            :class="{
              'text-blue-500': item.isReacted === 'Y',
              'text-red-500': item.isReacted === 'N' || !item.isReacted,
            }"
          >
            {{ item.isReacted === 'Y' ? '응답' : item.isReacted === 'N' ? '미응답' : '-' }}
          </td>
        </tr>
        </tbody>
      </table>

      <div class="flex justify-center mt-8 mb-8">
        <PagingBar
          :totalPages="totalPages"
          v-model:currentPage="currentPage"
        />
      </div>
    </div>
  </div>
</template>
