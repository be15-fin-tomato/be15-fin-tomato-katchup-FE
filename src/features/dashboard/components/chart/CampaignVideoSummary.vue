<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'

const props = defineProps({
  meta: Object
})

const statistics = computed(() => props.meta?.statistics ?? {})

const formatCount = (val) => {
  if (val >= 10000) return `${(val / 10000).toFixed(1)}만`
  if (val >= 1000) return `${(val / 1000).toFixed(1)}천`
  return val?.toLocaleString() ?? '0'
}
</script>

<template>
  <div class="dashboard-section flex bg-white rounded-xl shadow p-3 gap-8">
    <div class="relative w-[35%] h-[180px] mx-7 rounded-xl overflow-hidden">
      <img :src="meta?.thumbnail" class="w-full h-full object-cover" />
      <div class="absolute inset-0 bg-black bg-opacity-40 flex justify-center items-center">
        <Icon icon="mdi:youtube" class="text-white text-5xl" />
      </div>
    </div>

    <div class="grid grid-cols-2 grid-rows-2 w-full">
      <!-- 댓글 -->
      <div class="flex justify-between items-center p-5 border-b border-r border-gray-200">
        <div class="flex flex-col">
          <div class="text-gray-400 text-sm mb-3">댓글 수</div>
          <div class="text-3xl font-bold">{{ formatCount(statistics.commentCount) }}</div>
        </div>
        <Icon icon="ph:chats-light" class="text-6xl text-gray-400" />
      </div>

      <!-- 좋아요 -->
      <div class="flex justify-between items-center p-6 border-b border-gray-200">
        <div class="flex flex-col">
          <div class="text-gray-400 text-sm mb-3">좋아요 수</div>
          <div class="text-3xl font-bold">{{ formatCount(statistics.likeCount) }}</div>
        </div>
        <Icon icon="ph:thumbs-up-light" class="text-6xl text-gray-400" />
      </div>

      <!-- 클릭 -->
      <div class="flex justify-between items-center p-6 border-r border-gray-200">
        <div class="flex flex-col">
          <div class="text-gray-400 text-sm mb-3">클릭 수</div>
          <div class="text-3xl font-bold">{{ formatCount(statistics.clickCount) }}</div>
        </div>
        <Icon icon="ph:cursor-click-light" class="text-6xl text-gray-400" />
      </div>

      <!-- 조회수 -->
      <div class="flex justify-between items-center p-6">
        <div class="flex flex-col">
          <div class="text-gray-400 text-sm mb-3">조회 수</div>
          <div class="text-3xl font-bold">{{ formatCount(statistics.viewCount) }}</div>
        </div>
        <Icon icon="ph:play-light" class="text-6xl text-gray-400" />
      </div>
    </div>
  </div>
</template>
