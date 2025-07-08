<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white w-[90%] h-[90%] rounded-xl shadow-lg relative">
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        닫기
      </button>

      <iframe
        :src="pdfUrl"
        class="w-full h-full rounded-b-xl"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
const props = defineProps({
  contractId: Number
})

const pdfUrl = computed(() => `/example.pdf`)
</script>
