<script setup>
import { TAG_COLOR_MAP } from '@/constants/tags.js'
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';

const props = defineProps({
  influencer: Object
})

const router = useRouter();

const tagStyle = (tag) => {
  return TAG_COLOR_MAP[tag] ?? 'bg-gray-200 text-black'
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

const genderLabel = (gender) => {
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

const formatCount = (value) => {
  if (!value || isNaN(value)) return '해당 없음'

  const num = Number(value)

  if (num < 10000) {
    return num.toLocaleString() // 1,000처럼 쉼표 찍기
  }

  return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만' // 소수점 첫째자리, .0 제거
}

function goToDashboard(target)  {
  switch (target) {
    case 'youtube':
      router.push(`/influencer/dashboard/youtube?id=${props.influencer.id}`)
      break;
    case 'instagram':
      router.push(`/influencer/dashboard/instagram?id=${props.influencer.id}`)
      break;
  }
}
</script>

<template>
    <div class="border-[1.5px] rounded-lg p-5 shadow-sm mb-5">
        <div class="flex flex-wrap items-center justify-between gap-4">

            <!-- 유튜브명 -->
            <div class="flex items-center gap-7 min-w-[200px]">
                <img :src="influencer.youtube.thumbnailUrl" alt="프로필" class="w-[75px] rounded-full object-cover" />
                <div class="font-bold text-md truncate w-[100px]" :title="influencer.name">
                    {{ influencer.youtube.name }}
                </div>
            </div>

            <!-- 인스타 아이디 -->
            <div class="w-[70px] text-sm font-semibold truncate text-center">
                {{ influencer.instagram }}
            </div>

            <!-- 유튜브 구독자 -->
            <div class="flex flex-col items-center w-[130px]">
                <span class="text-sm font-semibold truncate mb-2">
                    {{ formatCount(influencer.youtube?.subscriber) }}
                </span>
                <button
                  @click="goToDashboard('youtube')"
                  class="flex items-center justify-center bg-white text-black border border-black rounded-lg text-sm font-bold p-2 whitespace-nowrap w-[150px]"
                >
                    <Icon icon="logos:youtube-icon" width="24" height="24" class="mr-2" />
                    <span class="hidden md:inline">유튜브 대시보드</span>
                </button>
            </div>

            <!-- 인스타 팔로워 -->
            <div class="flex flex-col items-center w-[130px]">
                <span class="text-sm font-semibold truncate mb-2">
                    {{ formatCount(influencer.instagram?.follower) }}
                </span>
                <button
                  @click="goToDashboard('instagram')"
                  class="flex items-center justify-center bg-white text-black border border-black rounded-lg font-semibold text-sm p-2 whitespace-nowrap w-[150px]"
                >
                    <Icon icon="skill-icons:instagram" width="24" height="24" class="mr-2" />
                    <span class="hidden md:inline">인스타 대시보드</span>
                </button>
            </div>

            <!-- 성별 -->
            <div class="w-[80px] flex justify-center items-center">
                <div :class="[genderColor(influencer.targetGender), 'px-2 rounded-2xl font-semibold text-sm text-center']">
                    {{ genderLabel(influencer.targetGender) }}
                </div>
            </div>

            <!-- 연령대 -->
            <div class="w-[80px] flex justify-center items-center">
                <div class="bg-green-100 text-black px-2 rounded-xl font-semibold text-sm text-center">
                    {{ influencer.ageRange }}
                </div>
            </div>

        </div>

        <!-- 태그 -->
        <div class="flex flex-wrap gap-2 mt-3">
             <span
               v-for="tag in influencer.tags ?? []"
               :key="tag.categoryId"
               class="text-xs rounded-lg px-1 py-0.5"
               :class="tagStyle(tag.categoryName)"
             >
            # {{ tag.categoryName }}
            </span>
        </div>
    </div>
</template>


