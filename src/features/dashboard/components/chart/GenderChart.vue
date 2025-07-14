<script setup>
import ApexCharts from 'vue3-apexcharts'
import { computed } from 'vue';

const props = defineProps({
  platform: String,
  data: Object
})

const totalMale = computed(() => props.data.male ?? 0);
const totalFemale = computed(() => props.data.female ?? 0);
const totalOther = computed(() => props.data.other ?? 0);

const series = computed(() => [
  totalMale.value,
  totalFemale.value,
  totalOther.value
]);

const labels = ['남성', '여성', '사용자 지정'];
const total = computed(() => totalMale.value + totalFemale.value + totalOther.value);
const chartTitle = computed(() => props.platform === 'instagram' ? '팔로워 성별 비율' : '구독자 성별 비율');</script>
<template>
  <div class="dashboard-section">
    <p class="dashboard-title">{{ chartTitle }}</p>

    <div class="flex justify-center items-center">
      <div class="relative">
        <ApexCharts
          type="pie"
          width="300"
          :series="series"
          :options="{
            labels,
            colors: ['#A2C9F4', '#F6A6B2', '#D9D9D9'],
            legend: { position: 'bottom' },
            dataLabels: { enabled: false },
            stroke: { show: false },
          }"
        />
      </div>
    </div>
  </div>
</template>
