<script setup>
import { TAG_COLOR_MAP } from '@/constants/tags.js';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import { requestInstagramAuthUrl, requestYoutubeAuthUrl } from '@/features/influencer/api.js';
import { useToast } from 'vue-toastification';
import { formatNumber } from '@/utils/fomatters.js';

const props = defineProps({
    influencer: Object,
});

const router = useRouter();
const toast = useToast();

const tagStyle = (tag) => {
    return TAG_COLOR_MAP[tag] ?? 'bg-gray-200 text-black';
};

const genderColor = (gender) => {
    switch (gender) {
        case 'M':
            return 'bg-blue-200';
        case 'F':
            return 'bg-pink-200';
        case 'O':
            return 'bg-purple-200';
        default:
            return 'bg-gray-200';
    }
};

const genderLabel = (gender) => {
    switch (gender) {
        case 'M':
            return '남성';
        case 'F':
            return '여성';
        case 'O':
            return '혼합';
        default:
            return '기타';
    }
};

function goToDashboard(target) {
    switch (target) {
        case 'youtube':
            router.push(`/influencer/dashboard/youtube?id=${props.influencer.influencerId}`);
            break;
        case 'instagram':
            router.push(`/influencer/dashboard/instagram?id=${props.influencer.influencerId}`);
            break;
    }
}

const handleInstagramConnect = async () => {
  try {
    const authUrl = await requestInstagramAuthUrl(props.influencer.influencerId);

    if (authUrl) {
      window.location.href = authUrl;
    } else {
      toast.error('인스타그램 인증 URL을 가져오지 못했습니다.');
    }
  } catch (error) {
    console.error('인스타그램 연동 중 오류 발생:', error);
    toast.error('인스타그램 연동에 실패했습니다. 다시 시도해주세요.');
  }
};

const handleYoutubeConnect = async () => {
  try {
    const authUrl = await requestYoutubeAuthUrl(props.influencer.influencerId);

    if (authUrl) {
      window.location.href = authUrl;
    } else {
      toast.error('유튜브 인증 URL을 가져오지 못했습니다.');
    }
  } catch (error) {
    console.error('YouTube 연동 중 오류 발생:', error);
    toast.error('유튜브 연동에 실패했습니다. 다시 시도해주세요.');
  }
};
</script>

<template>
    <div class=" flex flex-col border-[1px] rounded-lg px-5 py-4 shadow-sm mb-5">
        <div class="grid w-full grid-cols-11 items-center">
            <!-- 유튜브 프로필 (썸네일, 채널명) -->
            <div class="flex items-center gap-7 col-span-3">
                <img
                    :src="
                        influencer.youtube?.thumbnailUrl?.includes('ggpht')
                            ? influencer?.youtube?.thumbnailUrl
                            : '/tomato.png'
                    "
                    alt="프로필"
                    class="w-[75px] rounded-full object-cover"
                />
                <div class="max-w-[125px] font-bold text-sm truncate" :title="influencer?.name">
                    <template v-if="influencer?.youtube?.name">
                        {{ influencer?.youtube?.name }}
                    </template>
                    <template v-else>
                        <div
                            class="flex items-center gap-1 max-w-[125px] font-bold text-sm truncate"
                        >
                            <p class="truncate">{{ influencer?.name }}</p>
                            <p class="text-xs text-gray-medium font-normal">(미연결)</p>
                        </div>
                    </template>
                </div>
            </div>

            <!-- 인스타 아이디 -->
            <div class="max-w-[130px] text-left text-sm font-semibold truncate col-span-2">
                <template v-if="influencer?.instagram?.name">
                    @{{ influencer?.instagram?.name }}
                </template>
                <template v-else>
                    <div class="flex items-center gap-1 max-w-[125px] font-bold text-sm truncate">
                        <p class="truncate">{{ influencer?.name }}</p>
                        <p class="text-xs text-gray-medium font-normal">(미연결)</p>
                    </div>
                </template>
            </div>

            <!-- 유튜브 구독자 -->
            <div class="flex flex-col items-center justify-center col-span-2">
                <div
                    v-if="
                        influencer?.youtube?.subscriber !== null &&
                        influencer?.youtube?.subscriber !== undefined
                    "
                    class="flex flex-col items-center justify-center"
                >
                    <span class="text-sm font-semibold truncate mb-2">
                        {{ formatNumber(influencer?.youtube?.subscriber) }}
                    </span>
                    <button
                        @click="goToDashboard('youtube')"
                        class="flex items-center justify-center bg-white text-black border border-black
                        rounded-lg text-xs font-bold p-1.5 whitespace-nowrap w-[130px] hover:bg-btn-sky/30"
                    >
                        <Icon icon="logos:youtube-icon" width="24" height="24" class="mr-2" />
                        <span class="hidden md:inline">유튜브 대시보드</span>
                    </button>
                </div>
                <div v-else class="flex flex-col items-center justify-center">
                      <span class="text-sm text-gray-medium font-semibold truncate mb-2">
                          해당 없음
                      </span>
                      <button
                          @click="handleYoutubeConnect"
                          class="flex items-center justify-around bg-white text-blue-600 border border-blue-600
                          rounded-lg text-xs font-bold p-2 whitespace-nowrap w-[130px] hover:bg-btn-sky/30"
                      >
                          <Icon icon="solar:link-round-bold" width="20" height="20" />
                          <span class="hidden md:inline">유튜브 연동</span>
                      </button>
                  </div>
            </div>

            <!-- 인스타 팔로워 -->
            <div class="flex flex-col items-center col-span-2">
                <div
                    v-if="influencer?.instagram?.follower !== null && influencer?.instagram?.follower !== undefined"
                    class="flex flex-col items-center justify-center"
                >
                    <span class="text-sm font-semibold truncate mb-2">
                        {{ formatNumber(influencer?.instagram?.follower) }}
                    </span>
                    <button
                        @click="goToDashboard('instagram')"
                        class="flex items-center justify-center bg-white text-black border border-black
                        rounded-lg text-xs font-bold p-1.5 whitespace-nowrap w-[130px] hover:bg-btn-sky/30"
                    >
                        <Icon icon="skill-icons:instagram" width="24" height="24" class="mr-2" />
                        <span class="hidden md:inline">인스타 대시보드</span>
                    </button>
                </div>
                <div v-else class="flex flex-col items-center justify-center">
                    <span class="text-sm text-gray-medium font-semibold truncate mb-2">
                        해당 없음
                    </span>
                    <button
                        @click="handleInstagramConnect"
                        class="flex items-center justify-around bg-white text-blue-600 border border-blue-600
                        rounded-lg text-xs font-bold p-2 whitespace-nowrap w-[130px] hover:bg-btn-sky/30"
                    >
                        <Icon icon="solar:link-round-bold" width="20" height="20" />
                        <span class="hidden md:inline">인스타그램 연동</span>
                    </button>
                </div>
            </div>

            <!-- 성별 -->
            <div class="col-span-1 flex justify-center items-center">
                <div
                    :class="[
                        genderColor(influencer?.targetGender),
                        'px-2 rounded-2xl font-semibold text-sm text-center',
                    ]"
                >
                    {{ genderLabel(influencer?.targetGender) }}
                </div>
            </div>

            <!-- 연령대 -->
            <div
              v-if="influencer?.ageRange !== null && influencer?.ageRange !== undefined"
              class="col-span-1 flex justify-center items-center"
            >
                <div
                    class="bg-green-100 text-black px-2 rounded-xl font-semibold text-sm text-center"
                >
                    {{ influencer?.ageRange }}
                </div>
            </div>
            <div v-else class="col-span-1 flex justify-center items-center">
                <div
                  class="bg-gray-200 text-black px-2 rounded-xl font-semibold text-sm text-center"
                >
                    기타
                </div>
            </div>
        </div>

        <!-- 태그 -->
        <div class="flex flex-wrap gap-2 mt-3">
            <span
                v-for="tag in influencer?.tags ?? []"
                :key="tag.categoryId"
                class="text-xs rounded-lg px-1 py-0.5"
                :class="tagStyle(tag.categoryName)"
            >
                # {{ tag.categoryName }}
            </span>
        </div>
    </div>
</template>
