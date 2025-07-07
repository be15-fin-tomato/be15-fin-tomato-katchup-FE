<script setup>
import { ref } from 'vue'

const emit = defineEmits(['change'])

const filters = ref({
  keyword: '',
  statusId: null,
  minSales: null,
  maxSales: null,
  startDate: null,
  endDate: null,
})

const applyFilter = () => {
  emit('change', { ...filters.value })
}
</script>

<template>
  <div class="custom-sidebar flex flex-col gap-4">
    <!-- 제목 -->
    <p class="text text-md font-semibold mb-4 mt-5">고객사 검색</p>

    <!-- 검색어 입력 -->
    <input
      v-model="filters.keyword"
      type="text"
      placeholder="고객사명 or 담당자명"
      class="w-full border border-gray-medium rounded-md p-2 mb-3"
    />

    <!-- 고객사 상태 셀렉트 -->
    <div class="relative">
      <select
        v-model="filters.statusId"
        class="appearance-none w-full border border-gray-medium rounded-md p-2 mb-3 leading-tight focus:outline-none"
      >
        <option :value="null">고객사 상태</option>
        <option :value="1">진행중</option>
        <option :value="2">보류</option>
        <option :value="3">거절</option>
      </select>
      <div class="absolute inset-y-0 mb-2 right-3 flex items-center pointer-events-none">
        <i class="bi bi-chevron-down text-black"></i>
      </div>
    </div>

    <!-- 매출 범위 -->
    <input
      v-model.number="filters.minSales"
      type="number"
      placeholder="최소 매출"
      class="w-full border border-gray-medium rounded-md p-2 mb-3"
    />
    <input
      v-model.number="filters.maxSales"
      type="number"
      placeholder="최대 매출"
      class="w-full border border-gray-medium rounded-md p-2 mb-3"
    />

    <!-- 날짜 필터 -->
      <!-- 시작일 -->
      <div class="mb-3">
          <label for="startDate" class="block text-sm text-gray-dark mb-1">시작일</label>
          <input
              id="startDate"
              v-model="filters.startDate"
              type="date"
              class="w-full border border-gray-medium rounded-md p-2"
          />
      </div>

      <!-- 종료일 -->
      <div class="mb-5">
          <label for="endDate" class="block text-sm text-gray-dark mb-1">종료일</label>
          <input
              id="endDate"
              v-model="filters.endDate"
              type="date"
              class="w-full border border-gray-medium rounded-md p-2"
          />
      </div>


    <!-- 검색 버튼 -->
    <button
      @click="applyFilter"
      class="w-full bg-btn-gray text-white font-semibold py-2 rounded-md"
    >
      검색
    </button>
  </div>
</template>
