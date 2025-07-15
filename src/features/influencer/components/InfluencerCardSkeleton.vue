<template>
  <div class="border-[1px] rounded-lg px-5 py-4 shadow-sm mb-5 animate-pulse">
    <div class="grid w-full grid-cols-11 items-center gap-3">
      <!-- 프로필 -->
      <div class="flex items-center gap-7 col-span-3">
        <div class="w-[75px] h-[75px] rounded-full bg-gray-300"></div>
        <div class="h-4 w-[125px] bg-gray-300 rounded"></div>
      </div>

      <!-- 인스타 아이디 -->
      <div class="h-4 w-[130px] bg-gray-300 rounded col-span-2"></div>

      <!-- 유튜브 구독자 -->
      <div class="col-span-2 flex flex-col items-center gap-2">
        <div class="h-4 w-20 bg-gray-300 rounded"></div>
        <div class="h-6 w-[130px] bg-gray-300 rounded"></div>
      </div>

      <!-- 인스타 팔로워 -->
      <div class="col-span-2 flex flex-col items-center gap-2">
        <div class="h-4 w-20 bg-gray-300 rounded"></div>
        <div class="h-6 w-[130px] bg-gray-300 rounded"></div>
      </div>

      <!-- 성별 -->
      <div class="col-span-1 h-6 w-10 bg-gray-300 rounded-2xl"></div>

      <!-- 연령대 -->
      <div class="col-span-1 h-6 w-10 bg-gray-300 rounded-xl"></div>
    </div>

    <!-- 태그 -->
    <div class="flex gap-2 mt-3">
      <div class="h-4 w-16 bg-gray-300 rounded"></div>
      <div class="h-4 w-12 bg-gray-300 rounded"></div>
    </div>
  </div>
</template>
