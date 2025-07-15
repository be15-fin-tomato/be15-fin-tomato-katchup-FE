<script setup>
const props = defineProps({
    categories: {
        type: Array,
        required: true
    },
    selectedCategory: {
        type: String,
        default: '전체'
    }
});

const emit = defineEmits(['update:selected'])

const selectCategory = (category) => {
    emit('update:selected', category);
};
</script>

<template>
  <div class="flex gap-3 mb-5">
    <button
      v-for="category in props.categories"
      :key="category"
      @click="selectCategory(category)"
      :class="[
        'px-4 py-2 rounded-md font-semibold text-sm transition-all duration-200 whitespace-nowrap',
         props.selectedCategory === category
          ? 'bg-btn-sky text-white'
          : 'text-click hover:text-black hover:bg-gray-light'
      ]"
    >
      {{ category }}
    </button>
  </div>
</template>

