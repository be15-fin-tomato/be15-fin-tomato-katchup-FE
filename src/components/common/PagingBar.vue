<script setup>
import { computed, ref, watch } from 'vue'

const props = defineProps({
  currentPage: Number,
  totalPages: Number
})

const emit = defineEmits(['update:currentPage'])

const groupSize = 5
const currentGroup = ref(Math.floor((props.currentPage - 1) / groupSize))

// currentPage 변경될 때 그룹도 재계산
watch(() => props.currentPage, (newPage) => {
  currentGroup.value = Math.floor((newPage - 1) / groupSize)
})

// 페이지 그룹 계산
const pages = computed(() => {
  const start = currentGroup.value * groupSize + 1
  const end = Math.min(start + groupSize - 1, props.totalPages)
  return Array.from({ length: end - start + 1 }, (_, i) => start + i)
})

// 페이지 이동
const goToPage = (page) => {
  if (page === props.currentPage) return
  emit('update:currentPage', page)
}

const goToPrevGroup = () => {
  const prevStart = Math.max((currentGroup.value - 1) * groupSize + 1, 1)
  emit('update:currentPage', prevStart)
}

const goToNextGroup = () => {
  const nextStart = (currentGroup.value + 1) * groupSize + 1
  if (nextStart <= props.totalPages) emit('update:currentPage', nextStart)
}
</script>

<template>
  <div class="flex items-center justify-center gap-2 mt-10">
    <!-- 이전 -->
    <button
      class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      :disabled="pages[0] === 1"
      @click="goToPrevGroup"
    >
      ❮
    </button>

    <!-- 페이지 숫자 -->
    <button
      v-for="page in pages"
      :key="page"
      @click="goToPage(page)"
      :class="[
        'w-8 h-8 text-sm rounded border cursor-pointer transition-all',
        page === currentPage
          ? 'bg-[#0F1C61] text-white border-[#7C58E6]'
          : 'text-black border-gray-300 hover:bg-gray-100'
      ]"
    >
      {{ page }}
    </button>

    <!-- 다음 -->
    <button
      class="w-8 h-8 flex items-center justify-center rounded border border-gray-300 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
      :disabled="pages.at(-1) === totalPages"
      @click="goToNextGroup"
    >
      ❯
    </button>
  </div>
</template>
