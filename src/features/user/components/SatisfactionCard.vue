<script setup>
import { computed, ref, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import { fetchSatisfactionAverage } from '@/features/user/api';

const satisfaction = ref(0);

onMounted(async () => {
  try {
    const { data } = await fetchSatisfactionAverage();
    satisfaction.value = data.data.toFixed(1);
  } catch (err) {
    console.error('만족도 평균 점수 조회 실패:', err);
  }
});

const satisfactionIcon = computed(() => {
  if (satisfaction.value <= 50) {
    return 'ph:smiley-sad';
  } else if (satisfaction.value <= 80) {
    return 'ph:smiley-meh';
  } else {
    return 'ph:smiley';
  }
});

const satisfactionColorClass = computed(() => {
  if (satisfaction.value <= 50) {
    return 'text-red-500';
  } else if (satisfaction.value <= 80) {
    return 'text-yellow-400';
  } else {
    return 'text-green-500';
  }
});
</script>

<template>
  <div
    class="w-full border border-gray-medium rounded-xl bg-white shadow-sm px-5 pt-5 pb-0.5 hover:bg-gray-100 transition-colors duration-200"
  >
    <div class="flex justify-between items-start">
      <h3 class="text-lg font-semibold mb-4">
        평균 만족도
      </h3>
    </div>

    <div class="flex flex-col items-center justify-center h-[200px]">
      <Icon
        :icon="satisfactionIcon"
        :class="[satisfactionColorClass, 'mb-4']"
        width="150"
        height="150"
      />
      <h1 class="text-4xl font-extrabold text-black">
        {{ satisfaction }}
      </h1>
    </div>
  </div>
</template>
