<script setup>
import kittyImg from '@/assets/images/mock/kitty.png';
const { influencer, isEditing } = defineProps({
    influencer: Object,
    isEditing: Boolean,
});

const platformLabels = {
    youtube: '유튜브',
    instagram: '인스타그램',
};

const platformBg = {
    instagram: 'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)',
};

const formatNumber = (val) => {
    if (val === undefined || val === null) return '-';
    return Number(val).toLocaleString();
};
</script>

<template>
    <div class="grid grid-cols-3 gap-6 p-4">
        <!-- 프로필 -->
        <div class="flex flex-col items-center col-span-1">
            <div class="w-28 h-28 rounded-full overflow-hidden mb-8">
                <img
                    :src="
                        influencer.imageUrl?.includes('ggpht') ? influencer.imageUrl : '/tomato.png'
                    "
                    class="w-full h-full object-cover"
                    alt="프로필 이미지"
                />
            </div>
            <div class="w-full mt-4">
                <div class="text-left text-sm font-semibold text-gray-dark">이력</div>
                <ul v-if="influencer.campaignHistory?.length" class="mt-1 space-y-1 text-sm">
                    <li
                        v-for="item in influencer.campaignHistory"
                        :key="item.id"
                        class="hover:underline cursor-pointer"
                    >
                        <a
                            :href="item.url"
                            target="_blank"
                            rel="noopener noreferrer"
                            class="block text-left"
                        >
                            {{ item.name }}
                        </a>
                    </li>
                </ul>
            </div>
        </div>

        <!-- 플랫폼별 상세 정보 -->
        <div class="col-span-2 w-full flex flex-col gap-6">
            <div
                v-for="(platformData, platformKey) in influencer.platform"
                :key="platformKey"
                class="p-4 border border-gray-medium rounded-lg shadow"
            >
                <!-- 플랫폼 헤더 -->
                <div
                    class="w-fit px-4 py-1 text-sm font-semibold rounded mb-2"
                    :class="platformKey === 'youtube' ? 'bg-[#FF0000] text-white' : 'text-white'"
                    :style="platformKey === 'instagram' ? { background: platformBg.instagram } : {}"
                >
                    {{ platformLabels[platformKey] }}
                </div>

                <!-- 2열 그리드로 분리 -->
                <div class="flex flex-col gap-6 text-sm">
                    <!-- 수치 정보: 위쪽 두 열 -->
                    <div class="grid grid-cols-2 gap-2">
                        <div class="flex gap-2">
                            <div class="w-32 font-semibold">평균 조회수</div>
                            <div>: {{ formatNumber(platformData.averageView) ?? '-' }}</div>
                        </div>
                        <div class="flex gap-2">
                            <div class="w-32 font-semibold">평균 좋아요 수</div>
                            <div>: {{ formatNumber(platformData.averageLike) ?? '-' }}</div>
                        </div>
                        <div class="flex gap-2">
                            <div class="w-32 font-semibold">평균 댓글 수</div>
                            <div>: {{ formatNumber(platformData.averageComment) ?? '-' }}</div>
                        </div>
                        <div v-if="platformKey === 'instagram'" class="flex gap-2">
                            <div class="w-32 font-semibold">팔로워 수</div>
                            <div>: {{ formatNumber(platformData.followers) ?? '-' }}</div>
                        </div>
                        <div v-else-if="platformKey === 'youtube'" class="flex gap-2">
                            <div class="w-32 font-semibold">구독자 수</div>
                            <div>: {{ formatNumber(platformData.subscribers) ?? '-' }}</div>
                        </div>
                    </div>

                    <!-- 분석 표: 아래쪽 두 열 -->
                    <div class="grid grid-cols-2 gap-6">
                        <!-- 연령대 -->
                        <div>
                            <div class="font-semibold mb-1">시청자 연령대</div>
                            <div class="space-y-1">
                                <div
                                    v-for="(age, idx) in [
                                        platformData.ageTop1,
                                        platformData.ageTop2,
                                        platformData.ageTop3,
                                    ]"
                                    :key="idx"
                                    class="grid grid-cols-3 gap-2 items-center"
                                >
                                    <div class="text-gray-500">{{ idx + 1 }}위</div>
                                    <div
                                        class="border border-gray-medium rounded px-2 py-1 bg-white text-center"
                                    >
                                        {{ age?.label ?? '-' }}
                                    </div>
                                    <div
                                        class="border border-gray-medium rounded px-2 py-1 bg-white text-center"
                                    >
                                        {{ age?.rate ?? '-' }}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <!-- 성비 -->
                        <div>
                            <div class="font-semibold mb-1">시청자 성비</div>
                            <div class="space-y-1">
                                <div
                                    v-for="(gender, idx) in [
                                        platformData.genderTop1,
                                        platformData.genderTop2,
                                    ]"
                                    :key="idx"
                                    class="grid grid-cols-3 gap-2 items-center"
                                >
                                    <div class="text-gray-500">{{ idx + 1 }}위</div>
                                    <div
                                        class="border border-gray-medium rounded px-2 py-1 bg-white text-center"
                                    >
                                        {{ gender?.label ?? '-' }}
                                    </div>
                                    <div
                                        class="border border-gray-medium rounded px-2 py-1 bg-white text-center"
                                    >
                                        {{ gender?.rate ?? '-' }}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 공통 항목 -->
            <div class="mt-2 space-y-4">
                <div>
                    <label class="text-sm font-medium">강점</label>
                    <textarea
                        v-model="influencer.strength"
                        class="border-gray-medium input-form-box mt-1"
                        rows="3"
                        :readonly="!isEditing"
                    />
                </div>
                <div>
                    <label class="text-sm font-medium">비고</label>
                    <textarea
                        v-model="influencer.note"
                        class="border-gray-medium input-form-box mt-1"
                        rows="3"
                        :readonly="!isEditing"
                    />
                </div>
            </div>
        </div>
    </div>
</template>
