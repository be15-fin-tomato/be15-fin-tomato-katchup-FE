<script setup>
import { TAG_COLOR_MAP } from '@/constants/tags'
import { Icon } from '@iconify/vue'

const props = defineProps({
  influencer: {
    type: Object,
    required: true
  }
})

const tagStyle = (tag) => {
  return TAG_COLOR_MAP[tag] ?? 'bg-gray-200 text-black'
}

const formatCount = (num) => {
  if (num === null || num === undefined) return '해당 없음'
  const parsedNum = parseInt(num)
  return parsedNum >= 10000 ? `${Math.floor(parsedNum / 10000)}만명` : `${parsedNum}명`
}
const genderColor = (gender) => {
  switch (gender) {
    case 'M':
      return 'bg-blue-200'
    case 'F':
      return 'bg-pink-200'
    case 'O':
      return 'bg-purple-200'
    default:
      return 'bg-gray-200'
  }
}

const formatGender = (gender) => {
  switch (gender) {
    case 'M':
      return '남성'
    case 'F':
      return '여성'
    case 'O':
      return '혼합'
    default:
      return '기타'
  }
}
</script>

<template>
  <div class="dashboard-section relative">

    <div class="flex gap-10 items-start px-2 py-2">

      <!-- 썸네일 -->
      <img
        :src="influencer.youtube.thumbnailUrl"
        alt="썸네일"
        class="w-32 h-32 rounded-full object-cover"
      />

      <!-- 유튜브 채널명 -->
      <div class="flex-1">
        <h1 class="text-2xl font-bold">{{ influencer.youtube.name }}</h1>

        <!-- 태그 -->
        <div class="flex flex-wrap gap-2 mt-2 mb-5">
          <span
            v-for="tag in influencer.tags ?? []"
            :key="tag.categoryId"
            class="text-sm rounded-lg px-2"
            :class="tagStyle(tag.categoryName)"
          >
            # {{ tag.categoryName }}
          </span>
        </div>
         <!-- SNS 영역 -->
          <div class="flex flex-col gap-2">
            <div class="flex items-center gap-3 text-md text-gray-dark">
              <Icon icon="logos:youtube-icon" class="w-7 h-7" />
              <span>구독자 {{ formatCount(influencer?.youtube.subscriber) }}</span>
            </div>
            <div class="flex items-center gap-3 text-md text-gray-dark">
              <Icon icon="skill-icons:instagram" class="w-7 h-7" />
              <span>팔로워 {{ formatCount(influencer?.instagram.follower) }}</span>
            </div>
          </div>
      </div>

        <div class="absolute right-10 top-10 px-10 py-5 text-md text-gray-dark flex flex-col gap-3 whitespace-nowrap items-start">
          <div class="flex items-center justify-center gap-3">
            <span><Icon icon="mingcute:target-line" width="26" height="26" /></span>
            <span>타깃 : </span>
            <span class="bg-pipeline-proposal/50 px-2 rounded-md">{{ influencer.ageRange ?? '미정' }}</span>
            <span :class="[genderColor(influencer.targetGender), 'px-2 rounded-md']">{{ formatGender(influencer.targetGender) }}</span>
          </div>
          <div class="flex items-center justify-center gap-3">
            <span><Icon icon="fluent-emoji-high-contrast:money-bag" width="26" height="26" /></span>
            <span>단가 : </span>
            <span>{{ influencer.price?.toLocaleString() ?? '미정' }}원</span>
          </div>
          <div class="flex items-center justify-center gap-3">
            <span><Icon icon="hugeicons:manager" width="25" height="25" /></span>
            <span>매니저 : </span>
            <span>{{ influencer.manager ?? '없음' }}</span>
          </div>
        </div>
    </div>
  </div>
</template>
