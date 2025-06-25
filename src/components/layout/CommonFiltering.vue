<script setup>
defineProps({
  showFilterSort: {
    type: Boolean,
    default: true,
  },
});
</script>


<template>
    <div class="custom-sidebar">
        <p class="text text-md font-semibold mb-4 mt-5">검색조건</p>

        <div class="relative">
            <select
                class="appearance-none leading-tight focus:outline-none w-full border border-gray-medium rounded-md p-2 mb-3"
            >
                <option>전체</option>
                <option>캠페인명</option>
                <option>광고업체명</option>
                <option>광고담당자명</option>
            </select>

            <div class="absolute inset-y-0 mb-2 right-3 flex items-center pointer-events-none">
                <i class="bi bi-chevron-down text-black"></i>
            </div>
        </div>

        <input
            type="text"
            placeholder="검색어"
            class="w-full border border-gray-medium rounded-md p-2 mb-3"
        />

        <div class="flex gap-2 mb-3">
            <input
                type="text"
                placeholder="담당자"
                class="flex-1 min-w-0 border border-gray-medium rounded-md p-2"
            />
            <button
                class="w-[40px] h-[40px] bg-background border border-gray-medium rounded-md flex items-center justify-center"
            >
                <img src="@/assets/icons/add.svg" alt="sort" class="w-5 select-none" />
            </button>
        </div>

        <button class="w-full bg-btn-gray text-white font-semibold py-2 rounded-md mb-5">
            검색
        </button>

      <!-- 필터/정렬 -->
      <p v-if="showFilterSort" class="text text-md font-semibold mb-4 mt-5">필터/정렬</p>

      <div v-if="showFilterSort" class="relative">
        <select
          class="appearance-none leading-tight focus:outline-none w-full border border-gray-medium rounded-md p-2 mb-3"
        >
          <option>필터</option>
        </select>
        <div class="absolute inset-y-0 mb-2 right-3 flex items-center pointer-events-none">
          <i class="bi bi-chevron-down text-black"></i>
        </div>
      </div>

      <div v-if="showFilterSort" class="flex gap-2 mb-3">
        <input
          type="date"
          class="flex-1 border border-gray-medium rounded-md p-2 leading-tight focus:outline-none"
        />
        <button
          class="w-[40px] h-[40px] bg-btn-gray rounded-md flex items-center justify-center"
        >
          <img src="@/assets/icons/sort.svg" alt="sort" class="w-5 select-none" />
        </button>
      </div>

    </div>
</template>
