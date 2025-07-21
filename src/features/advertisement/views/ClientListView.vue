<script setup>
import { ref, watch, onMounted } from 'vue'
import ClientCard from '../components/ClientCard.vue'
import PagingBar from '@/components/common/PagingBar.vue'
import ClientFiltering from '../components/ClientFiltering.vue'
import { getClientCompanyList } from '@/features/advertisement/api.js'

// 현재 페이지 상태
const currentPage = ref(1)
const pageSize = 6 // 한 페이지에 보여줄 개수


// 고객사 목록 & 총 개수
const clientList = ref([])
const totalCount = ref(0)
const totalPages = ref(1)

// 필터 조건 초기값
const filters = ref({
  keyword: '',
  statusId: null,
  minSales: null,
  maxSales: null,
  startDate: null,
  endDate: null,
})

// 고객사 목록 조회 API
const fetchClients = async () => {
  try {
    const res = await getClientCompanyList(currentPage.value, pageSize, filters.value)

    // 응답 구조 반영 (items + pagination)
    clientList.value = res.data.data.items
    totalCount.value = res.data.data.pagination.totalCount || 0
    totalPages.value = res.data.data.pagination.totalPage || 1

  } catch (e) {
    console.error('고객사 목록 조회 실패:', e)
  }
}

// 필터 변경 시 호출되는 함수 (자식 컴포넌트에서 emit)
const onFilterChange = (newFilters) => {
  filters.value = { ...filters.value, ...newFilters }
  currentPage.value = 1
  fetchClients()
}

watch(currentPage, fetchClients)

// 최초 진입 시 목록 조회
onMounted(fetchClients)
</script>

<template>
  <div class="w-full min-h-screen bg-background flex font-sans">

    <!-- 필터 영역 -->
    <ClientFiltering class="custom-sidebar" @change="onFilterChange" />

    <!-- 본문 컨텐츠 -->
    <div class="flex flex-col flex-1 container bg-white">

      <!-- 타이틀 + 등록 버튼 -->
      <div class="page-header">
        <div class="page-title">
          고객사 목록
          <span class="cnt-search">
            (검색 결과: {{ totalCount }}건)
          </span>
        </div>
        <RouterLink to="/management/client/new" class="btn-create">등록</RouterLink>
      </div>

      <!-- 구분선 -->
      <div class="blue-line"></div>

      <!-- 고객사 카드 리스트 -->
      <div class="grid grid-cols-2 gap-x-6 gap-y-6 px-4">
        <ClientCard
          v-for="client in clientList"
          :key="client.clientCompanyId"
          :client="client"
        />
      </div>

      <!-- 페이지네이션 바 (totalPages 1 이상일 때만 렌더링) -->
      <div class="flex justify-center mt-8" v-if="totalPages > 0">
        <PagingBar
          :totalPages="totalPages"
          v-model:currentPage="currentPage"
        />
      </div>
    </div>
  </div>
</template>
