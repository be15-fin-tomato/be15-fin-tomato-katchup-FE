<script setup>
import { computed } from 'vue'
import { Icon } from '@iconify/vue'
import { formatNumber } from '@/utils/fomatters.js';

const props = defineProps({
  platform: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    required: true
  }
})

const summary = computed(() => {
  if (!props.data) {
    return {
      avgViews: 0, avgLikes: 0, avgComments: 0,
      averageViewCount: 0, likeCount: 0, commentCount: 0,
      totalVideos: 0,
    }
  }
  return props.platform === 'instagram'
    ? (props.data.reelsSummary ?? { avgViews: 0, avgLikes: 0, avgComments: 0, totalVideos: 0 })
    : (props.data.shortsSummary ?? { averageViewCount: 0, likeCount: 0, commentCount: 0, totalVideos: 0 })
})

const followers = computed(() => {
  if (!props.data) return 1
  return props.platform === 'instagram'
    ? (props.data.instagram?.followers ?? 1)
    : (parseInt(props.data.subscriberCount ?? props.data.channel?.subscriberCount ?? '1'))
})

const safeDivide = (a, b) => (!b || isNaN(b)) ? 0 : a / b

const scoreData = computed(() => {
  const s = summary.value
  const f = followers.value

  const avgViews = props.platform === 'instagram' ? (s.avgViews ?? 0) : (s.averageViewCount ?? 0)
  const avgLikes = props.platform === 'instagram' ? (s.avgLikes ?? 0) : (s.likeCount ?? 0)
  const avgComments = props.platform === 'instagram' ? (s.avgComments ?? 0) : (s.commentCount ?? 0)
  const totalVideos = props.platform === 'instagram' ? (s.totalVideos ?? 0) : (props.data.totalVideos ?? 0)

  const algorithmScore = Math.min(safeDivide(avgViews, f) * 10, 100)
  const engagement = Math.min(safeDivide(avgLikes + avgComments, avgViews) * 100, 100)
  const activeness = Math.min(safeDivide(totalVideos, 30) * 100, 100)
  return [
    { label: '알고리즘 스코어', value: algorithmScore },
    { label: '참여도', value: engagement },
    { label: '활성도', value: activeness }
  ]
})

const tooltipMap = {
  '알고리즘 스코어': '평균 조회수 ÷ 팔로워(구독자) 수 × 10 (최대 100)',
  '참여도': '(좋아요 + 댓글) ÷ 조회수 × 100 (최대 100)',
  '활성도': '게시물 수 ÷ 30 × 100 (최대 100)'
}

const barColors = ['#FF3B30', '#FF8A65', '#90A4AE', '#7C9CF6', '#5F38E9']
const thresholds = [20, 40, 60, 80]
const getActiveLevel = percent => thresholds.filter(t => percent > t).length
const getSegmentColor = (segment, percent) => {
  const level = getActiveLevel(percent)
  return segment <= level + 1 ? barColors[segment - 1] : '#EAEAEA'
}
</script>

<template>
  <div class="dashboard-section space-y-8">
    <div v-for="score in scoreData" :key="score.label" class="space-y-3">
        <div class="flex items-center gap-1">
          <h3 class="text-gray-dark font-semibold">{{ score.label }}</h3>
          <div class="relative group">
            <Icon icon="material-symbols:info-outline-rounded" class="w-5 h-5 text-gray-dark cursor-pointer" />
            <div class="absolute left-1/2 -translate-x-1/2 top-8 w-max bg-black text-white text-xs rounded px-3 py-2 shadow-lg opacity-0 group-hover:opacity-100 transition duration-300 z-10">
              {{ tooltipMap[score.label] }}
            </div>
          </div>
        </div>

      <div class="flex gap-1.5">
        <div
          v-for="n in 5"
          :key="n"
          class="h-6 flex-1"
          :class="{
            'rounded-l-lg': n === 1,
            'rounded-r-lg': n === 5
          }"
          :style="{ backgroundColor: getSegmentColor(n, score.value) }"
        ></div>
      </div>

      <div class="flex justify-end">
        <div class="text-black font-semibold">{{ formatNumber(score.value) }}</div>
      </div>
    </div>
  </div>
</template>
