<script setup>
import { onMounted, ref } from 'vue';

const props = defineProps({
  categories: {
    type: Array,
    required: true
  }
})

const emit = defineEmits(['update:selected'])
const selected = ref('전체')

onMounted(() => {
  emit('update:selected', selected.value)
})

const selectCategory = (category) => {
  selected.value = category
  emit('update:selected', category)
}
</script>

<template>
  <div class="flex gap-3 mb-10">
    <button
      v-for="category in props.categories"
      :key="category"
      @click="selectCategory(category)"
      :class="[
        'px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 whitespace-nowrap',
        selected.value === category
          ? 'bg-btn-sky text-white'
          : 'text-click hover:text-black hover:bg-gray-light'
      ]"
    >
      {{ category }}
    </button>
  </div>
</template>

