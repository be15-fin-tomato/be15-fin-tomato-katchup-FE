<script setup>
import { TAG_COLOR_MAP } from '@/constants/tags.js'
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { computed } from 'vue';
import defaultProfileImage from '@/assets/images/logofinal.png'; // '@'는 src 폴더의 별칭 (alias) 입니다.

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
    return num.toLocaleString()
  }

  return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만' // 소수점 첫째자리, .0 제거
}

function goToDashboard(target)  {
  switch (target) {
    case 'youtube':
      router.push(`/influencer/dashboard/youtube?id=${props.influencer.influencerId}`)
      break;
    case 'instagram':
      router.push(`/influencer/dashboard/instagram?id=${props.influencer.influencerId}`)
      break;
  }
}

const profileImageUrl = computed(() => {
  if (props.influencer?.youtube?.thumbnailUrl) {
    return props.influencer.youtube.thumbnailUrl;
  }
  return defaultProfileImage;
});
</script>

<template>
    <div class="border-[1px] rounded-lg px-5 py-4 shadow-sm mb-5">
        <div class="grid w-full grid-cols-11 items-center">

            <!-- 유튜브 프로필 (썸네일, 채널명) -->
            <div class="flex items-center gap-7 col-span-3">
              <img :src="profileImageUrl" alt="프로필" class="w-[75px] rounded-full object-cover" />
                <div class="max-w-[125px] font-bold text-sm truncate" :title="influencer?.name">
                    <template v-if="influencer?.youtube?.name">
                        {{ influencer?.youtube?.name }}
                    </template>
                    <template v-else>
                      <div class="flex items-center gap-1 max-w-[125px] font-bold text-sm truncate">
                        <p class="truncate">{{ influencer?.name }}</p>
                        <p class="text-[14px] text-gray-400 font-normal">(연동x)</p>
                      </div>
                    </template>
                </div>
            </div>

            <!-- 인스타 아이디 -->
            <div class="max-w-[130px] text-left text-sm font-semibold truncate col-span-2">
              <template v-if="influencer?.youtube?.name">
                @{{ influencer?.instagram?.name }}
              </template>
              <template v-else>
                <div class="flex items-center gap-1 max-w-[125px] font-bold text-sm truncate">
                  <p class="truncate">{{ influencer?.name }}</p>
                  <p class="text-[14px] text-gray-400 font-normal">(연동x)</p>
                </div>
              </template>
            </div>

            <!-- 유튜브 구독자 -->
            <div class="flex flex-col items-center justify-center col-span-2">
              <div
                v-if="influencer?.youtube?.subscriber !== null && influencer?.youtube?.subscriber !== undefined"
                class="flex flex-col items-center justify-center"
              >
                <span class=" text-sm font-semibold truncate mb-2">
                  {{ formatCount(influencer?.youtube?.subscriber) }}
                </span>
                <button
                  @click="goToDashboard('youtube')"
                  class="flex items-center justify-center bg-white text-black border border-black rounded-lg text-xs font-bold p-1.5 whitespace-nowrap w-[130px]"
                >
                  <Icon icon="logos:youtube-icon" width="24" height="24" class="mr-2" />
                  <span class="hidden md:inline">유튜브 대시보드</span>
                </button>
              </div>
            <div v-else class="text-sm text-gray-500 py-2">
              <button
                @click="router.push('/management/influencer')"
                class="flex items-center justify-center bg-white text-black border border-black rounded-lg text-xs font-bold p-1.5 whitespace-nowrap w-[130px]"
              >
                <Icon icon="logos:youtube-icon" width="24" height="24" class="mr-2" />
                <span class="hidden md:inline">유튜브 연동</span>
              </button>
            </div>
          </div>

            <!-- 인스타 팔로워 -->
            <div class="flex flex-col items-center col-span-2">
              <div
                v-if="influencer?.youtube?.subscriber !== null && influencer?.youtube?.subscriber !== undefined"
                class="flex flex-col items-center justify-center"
              >
                <span class="text-sm font-semibold truncate mb-2">
                    {{ formatCount(influencer?.instagram?.follower) || "해당 없음" }}
                </span>
                <button
                  @click="goToDashboard('instagram')"
                  class="flex items-center justify-center bg-white text-black border border-black rounded-lg text-xs font-bold p-1.5 whitespace-nowrap w-[130px]"
                >
                    <Icon icon="skill-icons:instagram" width="24" height="24" class="mr-2" />
                    <span class="hidden md:inline">인스타 대시보드</span>
                </button>
              </div>
              <div v-else class="text-sm text-gray-500 py-2">
                <button
                  @click="router.push('/management/influencer')"
                  class="flex items-center justify-center bg-white text-black border border-black rounded-lg text-xs font-bold p-1.5 whitespace-nowrap w-[130px]"
                >
                  <Icon icon="skill-icons:instagram" width="24" height="24" class="mr-2" />
                  <span class="hidden md:inline">인스타그램 연동</span>
                </button>
              </div>
            </div>

            <!-- 성별 -->
            <div class="col-span-1 flex justify-center items-center">
                <div :class="[genderColor(influencer?.targetGender), 'px-2 rounded-2xl font-semibold text-sm text-center']">
                    {{ genderLabel(influencer?.targetGender) }}
                </div>
            </div>

            <!-- 연령대 -->
            <div class="col-span-1 flex justify-center items-center">
                <div class="bg-green-100 text-black px-2 rounded-xl font-semibold text-sm text-center">
                    {{ influencer?.ageRange }}
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


