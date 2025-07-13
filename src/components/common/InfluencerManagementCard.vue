<script setup>
import { ref } from 'vue';
import defaultThumbnail from '@/assets/images/logo.png';
import { Icon } from '@iconify/vue';
import { TAG_COLOR_MAP } from '@/constants/tags.js';
import InstagramConnectModal from '@/features/influencer/components/InstagramConnectModal.vue';
import YoutubeConnectIdModal from '@/features/influencer/components/YoutubeConnectModal.vue';

const props = defineProps({
    id: Number,
    name: String,
    realName: String,
    subscribers: String,
    instagram: String,
    instaFollowers: String, // 이제 null일 수 있음
    tags: Array,
    ownerName: String,
    thumbnail: String,
    _originalData: Object,
});

const emit = defineEmits(['edit', 'delete']);

const showDropdown = ref(false);

const isYoutubeConnectIdModalOpen = ref(false);
const currentInfluencerIdForYoutube = ref(null);

const isInstagramConnectModalOpen = ref(false);
const currentInfluencerIdForInstagram = ref(null);

const handleEdit = () => {
    emit('edit', { ...props, _originalData: props._originalData });
    showDropdown.value = false;
};

const handleDelete = () => {
    emit('delete', props.id);
    showDropdown.value = false;
};

const handleInfluencerIdConfirmed = (id) => {
    currentInfluencerIdForYoutube.value = id;
    isYoutubeConnectIdModalOpen.value = false;

    // Google OAuth URL 생성
    const clientId = '649795017530-hl28hn859rb4is4u6er6lukrokhafibt.apps.googleusercontent.com';
    const redirectUri = 'http://localhost:8080/api/v1/oauth2/youtube/callback';
    const scope =
        'https://www.googleapis.com/auth/youtube.readonly https://www.googleapis.com/auth/yt-analytics.readonly';
    const accessType = 'offline';
    const prompt = 'consent';

    window.location.href =
      `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}
      &redirect_uri=${redirectUri}
      &response_type=code
      &scope=${encodeURIComponent(scope)}
      &access_type=${accessType}
      &prompt=${prompt}
      &state=${id}`;
};

const openInstagramConnectModal = () => {
    isInstagramConnectModalOpen.value = true;
};

const handleInstagramIdConfirmed = (id) => {
    currentInfluencerIdForInstagram.value = id;
    isInstagramConnectModalOpen.value = false;
    console.log('Instagram 연동을 위한 인플루언서 ID 확인:', id);
    alert(`인스타그램 연동: 인플루언서 ID ${id} 확인. (실제 연동 로직 추가 필요)`);
};
</script>

<template>
    <div
        class="flex flex-col gap-3 relative w-full p-4 border border-gray-dark rounded-xl min-h-[240px]"
    >
        <div class="flex items-center justify-between">
            <div class="flex items-center">
                <img
                    :src="thumbnail || defaultThumbnail"
                    alt="thumbnail"
                    class="w-[70px] h-[70px] rounded-full object-cover border border-color-gray-light"
                />
                <div class="flex flex-col ml-3">
                    <div class="flex items-center gap-1">
                        <Icon icon="stash:star-duotone" class="w-5 h-5" />
                        <span v-if="realName">{{ realName }}</span>
                    </div>
                    <div class="flex flex-wrap items-center gap-2 text-gray-dark">
                        <Icon icon="tdesign:user" class="w-4 h-4" />
                        <span class="truncate">담당자 : {{ ownerName }}</span>
                    </div>
                </div>
            </div>
            <div class="flex gap-2">
                <button
                    class="px-3 h-[40px] text-sm rounded-md text-center text-black whitespace-nowrap bg-btn-blue drop-shadow-md border border-gray-medium hover:bg-btn-sky cursor-pointer"
                    @click="handleEdit"
                >
                    수정
                </button>
                <button
                    class="px-3 h-[40px] text-sm rounded-md text-center text-black whitespace-nowrap bg-gray-light border border-gray-medium drop-shadow-md hover:bg-btn-sky cursor-pointer"
                    @click="handleDelete"
                >
                    삭제
                </button>
            </div>
        </div>
        <div class="flex-1 flex-wrap min-w-0">
            <!-- 유튜브 영역 -->
            <div
                class="flex flex-wrap gap-1 mb-2 border px-3 py-2 rounded-lg justify-between items-center"
            >
                <div class="flex flex-col flex-wrap">
                    <div class="flex items-center gap-2 text-base font-medium">
                        <Icon icon="logos:youtube-icon" class="w-7 h-7" />
                        <span class="font-bold truncate max-w-[155px]" :title="name">
                            {{ name }}
                        </span>
                    </div>
                    <div v-if="subscribers" class="text-sm text-gray-dark truncate">
                        구독자 {{ subscribers }}
                    </div>
                </div>
                <button
                    @click="isYoutubeConnectIdModalOpen = true"
                    class="flex px-2 h-[40px] border-[1px] border-blue-600 rounded-lg items-center justify-center gap-1 font-bold text-blue-600"
                >
                    <Icon icon="solar:link-round-bold" width="20" height="20" />
                    연동
                </button>
            </div>

            <!-- 인스타그램 영역 -->
            <div class="flex gap-1 border px-3 py-2 rounded-lg justify-between items-center">
                <div class="flex flex-col">
                    <div class="flex items-center gap-2 text-base font-medium">
                        <Icon icon="skill-icons:instagram" class="w-7 h-7" />
                        <span class="font-bold truncate" :title="instagram">{{ instagram }}</span>
                    </div>
                    <div v-if="instaFollowers" class="text-sm text-gray-dark truncate">
                        팔로워 {{ instaFollowers }}
                    </div>
                </div>
                <button
                    @click="openInstagramConnectModal"
                    class="flex px-2 h-[40px] border-[1px] border-blue-600 rounded-lg items-center justify-center gap-1 font-bold text-blue-600"
                >
                    <Icon icon="solar:link-round-bold" width="20" height="20" />
                    연동
                </button>
            </div>
        </div>

        <YoutubeConnectIdModal
            v-if="isYoutubeConnectIdModalOpen"
            @close="isYoutubeConnectIdModalOpen = false"
            @confirm="handleInfluencerIdConfirmed"
        />

        <InstagramConnectModal
            v-if="isInstagramConnectModalOpen"
            @close="isInstagramConnectModalOpen = false"
            @confirm="handleInstagramIdConfirmed"
            :influencerId="currentInfluencerIdForInstagram"
        />
        <div class="flex flex-wrap gap-1 text-xs font-bold leading-snug text-black">
            <span
                v-for="(tag, index) in tags"
                :key="index"
                :class="[TAG_COLOR_MAP[tag] || 'bg-gray-200 text-black', 'px-2 py-1 rounded-full']"
            >
                #{{ tag }}
            </span>
        </div>
    </div>
</template>
