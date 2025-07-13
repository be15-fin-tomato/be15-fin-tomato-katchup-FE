<script setup>

import { computed } from 'vue';

const props = defineProps({
  platform: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({})
  },
});

const dailyChange = computed(() => {
  if (props.platform === 'youtube') {
    return props.data?.subscriberChangeDaily || 0;
  } else if (props.platform === 'instagram') {
    return props.data?.followerChangeDaily || 0;
  }
  return 0;
});

const weeklyChange = computed(() => {
  if (props.platform === 'youtube') {
    return props.data?.subscriberChangeWeekly || 0;
  } else if (props.platform === 'instagram') {
    return props.data?.followerChangeWeekly || 0;
  }
  return 0;
});

const monthlyChange = computed(() => {
  if (props.platform === 'youtube') {
    return props.data?.subscriberChangeMonthly || 0;
  } else if (props.platform === 'instagram') {
    return props.data?.followerChangeMonthly || 0;
  }
  return 0;
});

const chartTitle = computed(() => {
  return props.platform === 'youtube' ? '구독자 증감수' : '팔로워 증감수';
});
</script>

<template>
  <div class="dashboard-section">
    <p class="dashboard-title">
      {{ chartTitle }}
    </p>
    <div class="flex flex-wrap justify-around p-5">
      <div class="flex flex-col items-center justify-center border border-gray-dark rounded-xl shadow-lg">
        <span class="bg-btn-yellow/90 px-30 py-3 text-xl rounded-t-xl">일간</span>
        <span class="p-15 text-3xl">{{ dailyChange > 0 ? '+' : '' }}{{ dailyChange.toLocaleString() }}</span>
      </div>
      <div class="flex flex-col items-center justify-center border border-gray-dark rounded-xl shadow-lg">
        <span class="bg-btn-yellow/90 px-30 py-3 text-xl rounded-t-xl">주간</span>
        <span class="p-15 text-3xl">{{ weeklyChange > 0 ? '+' : '' }}{{ weeklyChange.toLocaleString() }}</span>
      </div>
      <div class="flex flex-col items-center justify-center border border-gray-dark rounded-xl shadow-lg">
        <span class="bg-btn-yellow/90 px-30 py-3 text-xl rounded-t-xl">월간</span>
        <span class="p-15 text-3xl">{{ monthlyChange > 0 ? '+' : '' }}{{ monthlyChange.toLocaleString() }}</span>
      </div>
    </div>
  </div>
</template>
