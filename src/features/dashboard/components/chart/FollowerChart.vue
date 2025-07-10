<script setup>

import { computed } from 'vue';

const props = defineProps({
  platform: String,
  data: Object,
});

const dailyChange = computed(() => props.data?.subscriberChangeDaily || 0);
const weeklyChange = computed(() => props.data?.subscriberChangeWeekly || 0);
const monthlyChange = computed(() => props.data?.subscriberChangeMonthly || 0);
</script>

<template>
  <div class="dashboard-section">
    <p class="dashboard-title">
      구독자 증감수
    </p>
    <div class="flex flex-wrap justify-around p-5">
      <div class="flex flex-col items-center justify-center border border-gray-dark rounded-xl shadow-lg">
        <span class="bg-btn-yellow/90 px-30 py-3 text-xl rounded-t-xl">일간</span>
        <span class="p-15 text-3xl">{{ dailyChange > 0 ? '+' : '' }}{{ dailyChange }}</span>
      </div>
      <div class="flex flex-col items-center justify-center border border-gray-dark rounded-xl shadow-lg">
        <span class="bg-btn-yellow/90 px-30 py-3 text-xl rounded-t-xl">주간</span>
        <span class="p-15 text-3xl">{{ weeklyChange > 0 ? '+' : '' }}{{ weeklyChange }}</span>
      </div>
      <div class="flex flex-col items-center justify-center border border-gray-dark rounded-xl shadow-lg">
        <span class="bg-btn-yellow/90 px-30 py-3 text-xl rounded-t-xl">월간</span>
        <span class="p-15 text-3xl">{{ monthlyChange > 0 ? '+' : '' }}{{ monthlyChange }}</span>
      </div>
    </div>
  </div>
</template>
