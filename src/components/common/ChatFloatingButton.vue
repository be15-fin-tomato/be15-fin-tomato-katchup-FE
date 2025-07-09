<template>
  <div class="fixed bottom-6 right-6 z-50">
    <button
      class="relative w-14 h-14 rounded-full
             bg-blue-500
             border border-blue-600
             text-white text-2xl
             shadow-lg
             hover:scale-105 active:scale-95
             transition duration-200 ease-in-out
             flex items-center justify-center
             focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-75"
      @click="$emit('toggle')"
    >
      <Icon icon="mdi:chat-processing" class="w-8 h-8" />
      <span
        v-if="unreadCount > 0"
        class="absolute top-0 right-0 translate-x-1/3 -translate-y-1/3
               bg-red-500
               text-white text-[10px] font-bold w-5 h-5
               flex items-center justify-center rounded-full shadow"
      >
        {{ unreadCount }}
      </span>
    </button>
  </div>
</template>

<script setup>
import { Icon } from '@iconify/vue'

const props = defineProps({
  unreadCount: {
    type: Number,
    default: 0
  }
})

defineEmits(['toggle'])
</script>

<style scoped>
</style>
