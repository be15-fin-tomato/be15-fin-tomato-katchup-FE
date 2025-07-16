<script setup>
const props = defineProps({
  activeMetric: String,
  activePeriod: String,
})

const emit = defineEmits(['update:metric', 'update:period'])
</script>

<template>
  <div class="flex gap-4 justify-between text-sm">
    <div class="flex gap-2">
      <button v-for="metric in ['조회수','댓글수','좋아요수','클릭수']"
              :key="metric"
              :class="['px-3 py-1 rounded-md', activeMetric === metric ? 'bg-btn-sky text-white' : 'text-black']"
              @click="$emit('update:metric', metric)">
        {{ metric }}
      </button>
    </div>

    <div class="flex gap-0 ml-4">
      <button
        :class="[
          'px-3 py-1 border border-gray-medium',
          activePeriod === '주간' ? 'bg-click text-white' : 'bg-white',
          'rounded-md'
        ]"
        @click="$emit('update:period', '주간')"
      >
        주간
      </button>
    </div>
  </div>
</template>
