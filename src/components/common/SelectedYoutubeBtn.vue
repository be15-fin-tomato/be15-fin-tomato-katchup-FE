<script setup>
defineProps({ label: { type: String, default: '유튜브' } })
</script>

<template>
  <button
    class="w-[120px] h-[36px] text-white text-sm font-semibold shadow rounded-[8px]"
    style="background: linear-gradient(135deg, #ff416c, #ff4b2b);"
  >
    {{ label }}
  </button>
</template>
