<template>
    <div class="bg-[#f4f8fc] p-6 rounded-xl border border-blue-200 flex gap-6">
        <!-- 좌측 필터 -->
        <div class="w-[360px] pr-4 border-r border-blue-300 space-y-3 min-h-full">
            <div
                v-for="(filter, index) in filterOptions"
                :key="index"
                class="flex items-center justify-between border border-gray-300 bg-white px-2 py-1 rounded"
            >
                <label class="flex items-center gap-2 text-sm">
                    <input type="checkbox" v-model="filter.checked" />
                    <span>{{ filter.label }}</span>
                </label>
                <select
                    v-if="filter.levels"
                    v-model="filter.level"
                    class="text-xs bg-white border rounded px-1 py-0.5"
                >
                    <option v-for="option in filter.levels" :key="option" :value="option">
                        {{ option }}
                    </option>
                </select>
            </div>
            <button
                class="btn-recommend"
                :disabled="isLoading"
                @click="getRecommendationsByCampaignId"
                :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
            >
                AI 추천 요청하기
            </button>
        </div>

        <!-- 우측 인플루언서 카드 리스트 -->
        <div class="flex-1 space-y-4 pl-2 overflow-y-auto max-h-[400px]">
            <template v-if="isLoading">
                <div
                    v-for="n in 5"
                    :key="n"
                    class="flex justify-between items-center p-4 bg-white border border-gray-300 rounded-lg animate-pulse"
                >
                    <div class="flex items-center gap-4">
                        <div class="w-12 h-12 rounded-full bg-gray-300"></div>
                        <div class="space-y-2">
                            <div class="h-4 bg-gray-300 rounded w-40"></div>
                            <div class="h-4 bg-gray-200 rounded w-24"></div>
                            <div class="flex gap-2">
                                <div class="h-4 w-12 bg-gray-200 rounded-full"></div>
                                <div class="h-4 w-16 bg-gray-200 rounded-full"></div>
                            </div>
                        </div>
                    </div>
                    <div class="flex flex-col gap-2 items-end text-sm">
                        <div class="h-4 w-16 bg-gray-300 rounded"></div>
                        <div class="h-4 w-16 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </template>

            <template v-else>
                <div
                    v-for="influencer in influencers"
                    :key="influencer.id"
                    :class="[
                        'flex justify-between items-center p-4 border border-gray-300 rounded-lg cursor-pointer hover:shadow-sm',
                        addedInfluencerIds?.includes(influencer.influencerId)
                            ? 'bg-indigo-50'
                            : 'bg-white',
                    ]"
                    @click="$emit('add-influencer', influencer)"
                >
                    <!-- 프로필 + 태그 -->
                    <div class="flex items-center gap-4">
                        <img
                            :src="
                                influencer.youtube?.thumbnailUrl?.includes('ggpht')
                                    ? influencer.youtube?.thumbnailUrl
                                    : '/tomato.png'
                            "
                            alt="profile"
                            class="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                            <div class="font-semibold text-black">
                                {{ influencer.youtube?.name || '해당 없음' }}
                                <span class="text-xs text-gray-500">({{ influencer.name }})</span>
                            </div>
                            <div class="font-semibold text-gray-500">
                                @{{ influencer.instagram?.name || '해당 없음' }}
                            </div>
                            <div class="flex flex-wrap gap-2 mt-1">
                                <span
                                    v-for="tag in influencer.categoryList"
                                    :key="tag"
                                    :class="`${TAG_COLOR_MAP[tag]} px-2 py-1 rounded-full text-xs`"
                                >
                                    #{{ tag }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <!-- 팔로워 -->
                    <div class="flex flex-col gap-2 items-end text-sm">
                        <div class="flex items-center gap-1 text-black">
                            <Icon icon="logos:youtube-icon" width="18" height="18" />
                            <span>{{
                                formatCount(influencer.youtube?.subscriber) || '해당 없음'
                            }}</span>
                        </div>
                        <div class="flex items-center gap-1 text-black">
                            <Icon icon="skill-icons:instagram" width="18" height="18" />
                            <span>{{
                                formatCount(influencer.instagram?.follower) || '해당 없음'
                            }}</span>
                        </div>
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';
import { TAG_COLOR_MAP } from '@/constants/tags';

defineProps({
    influencers: Array,
    filterOptions: Array,
    getRecommendationsByCampaignId: Function,
    isLoading: Boolean,
    addedInfluencerIds: Array,
});

defineEmits(['add-influencer']);

const formatCount = (value) => {
    if (!value || isNaN(value)) return '해당 없음';

    const num = Number(value);

    if (num < 10000) {
        return num.toLocaleString(); // 1,000처럼 쉼표 찍기
    }

    return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만'; // 소수점 첫째자리, .0 제거
};
</script>
