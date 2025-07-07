<script setup>
defineProps({ label: { type: String, default: '인스타그램' } })
</script>

<template>
  <button
    class="w-[120px] h-[36px] text-white text-sm font-semibold shadow rounded-[8px]"
    style="background: linear-gradient(135deg, #bc80f7, #f18383); opacity: 0.4;"
  >
    {{ label }}
  </button>
</template>
