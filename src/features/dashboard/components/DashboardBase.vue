<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';

import AverageChart from '@/features/dashboard/components/chart/AverageChart.vue';
import AlgorithmChart from '@/features/dashboard/components/chart/AlgorithmChart.vue';
import ReachChart from '@/features/dashboard/components/chart/ReachChart.vue';
import AgeChart from '@/features/dashboard/components/chart/AgeChart.vue';
import GenderChart from '@/features/dashboard/components/chart/GenderChart.vue';
import FollowerChart from '@/features/dashboard/components/chart/FollowerChart.vue';
import DashboardSummary from '@/features/dashboard/components/DashboardSummary.vue';

const props = defineProps({
    platform: String,
    data: Object,
    summaryData: Object,
    satisfaction: Number,
});

const emit = defineEmits(['switch']);

const satisfactionIcon = computed(() => {
    if (props.satisfaction <= 50) {
        return 'ph:smiley-sad';
    } else if (props.satisfaction <= 80) {
        return 'ph:smiley-meh';
    } else {
        return 'ph:smiley';
    }
});

const satisfactionColorClass = computed(() => {
  if (props.satisfaction <= 50) {
    return 'text-red-500';
  } else if (props.satisfaction <= 80) {
    return 'text-yellow-400';
  } else {
    return 'text-green-500';
  }
})
</script>

<template>
    <div class="flex flex-col">
        <div class="flex gap-3 mb-4 self-start">
            <button
                @click="emit('switch', 'youtube')"
                :class="[
                    'w-28 h-10 rounded-xl text-white font-semibold text-sm shadow-md transition',
                    platform === 'youtube' ? 'bg-[#CC3333]' : 'bg-[#FFCCCC]',
                ]"
            >
                유튜브
            </button>

            <button
                @click="emit('switch', 'instagram')"
                :class="[
                    'w-28 h-10 rounded-xl text-white font-semibold text-sm shadow-md transition',
                    platform === 'instagram'
                        ? 'bg-gradient-to-r from-[#F58529] via-[#DD2A7B] to-[#515BD4]'
                        : 'bg-gradient-to-r from-[#FFDABF] via-[#F5B5D4] to-[#B0B6F0]',
                ]"
            >
                인스타그램
            </button>
        </div>

        <DashboardSummary :platform="platform" :data="props.summaryData" />

        <div class="flex gap-8">
            <AverageChart
              :platform="platform"
              :daily="props.data?.dailyAvgViews ?? 0"
              :monthly="props.data?.monthlyAvgViews ?? 0"
              class="w-1/3"
            />
            <AlgorithmChart :platform="platform" :data="props.data" class="w-1/3" />
            <div class="dashboard-section w-1/3">
                <div class="flex items-center gap-1">
                    <h3 class="font-bold text-gray-dark">평균 만족도</h3>
                    <div class="relative group">
                        <Icon
                            icon="material-symbols:info-outline-rounded"
                            class="w-5 h-5 text-gray-dark cursor-pointer"
                        />
                        <div
                            class="absolute left-1/2 -translate-x-1/2 top-8 w-max bg-black text-white text-xs rounded px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 z-10"
                        >
                            고객들의 평균 만족도를 계산한 값
                        </div>
                    </div>
                </div>
                <div class="flex flex-col justify-center items-center mt-10 gap-5">
                  <Icon :icon="satisfactionIcon" :class="`w-36 h-36 ${satisfactionColorClass}`" />
                  <p class="text-5xl font-extrabold">{{ props.satisfaction }}</p>
                </div>
            </div>
        </div>

<!--        <div class="flex gap-8">-->
<!--            <AgeChart-->
<!--                :platform="platform"-->
<!--                :data="{-->
<!--                    age1824: props.data?.age1824 ?? 0,-->
<!--                    age2534: props.data?.age2534 ?? 0,-->
<!--                    age3544: props.data?.age3544 ?? 0,-->
<!--                    age4554: props.data?.age4554 ?? 0-->
<!--                }"-->
<!--                class="w-[70%]"-->
<!--            />-->
<!--            <GenderChart-->
<!--                :platform="platform"-->
<!--                :data="{-->
<!--                    male: props.data?.genderMale ?? 0,-->
<!--                    female: props.data?.genderFemale ?? 0-->
<!--                }"-->
<!--            class="w-[30%]"-->
<!--          />-->
<!--        </div>-->

<!--        <div class="flex gap-8">-->
<!--            <FollowerChart-->
<!--                :platform="platform"-->
<!--                :data="platform === 'instagram' ? (props.data?.followersTrend ?? []) : (props.data?.subscribersTrend ?? [])"-->
<!--                class="w-[70%]"-->
<!--            />-->
<!--            <ReachChart-->
<!--              platform="platform"-->
<!--              :reach="props.data?.reach ?? 0"-->
<!--              :followerRate="props.data?.subscribedRatio ?? 0"-->
<!--              :nonFollowerRate="props.data?.notSubscribedRatio ?? 0"-->
<!--              class="w-[30%]"-->
<!--            />-->

<!--        </div>-->
    </div>
</template>
