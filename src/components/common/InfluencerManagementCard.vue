<script setup>
import { ref } from 'vue';
import defaultThumbnail from '@/assets/images/logo.png';
import { Icon } from '@iconify/vue';
import { TAG_COLOR_MAP } from '@/constants/tags.js';
import InstagramConnectModal from '@/features/influencer/components/InstagramConnectModal.vue';
import {
  disconnectInstagram,
  disconnectYoutube,
  requestInstagramAuthUrl,
  requestYoutubeAuthUrl
} from '@/features/influencer/api.js';
import { useToast } from 'vue-toastification';

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

const toast = useToast();

const emit = defineEmits(['edit', 'delete']);

const isInstagramConnectModalOpen = ref(false);
const currentInfluencerIdForInstagram = ref(null);

const handleEdit = () => {
    emit('edit', { ...props, _originalData: props._originalData });
};

const handleDelete = () => {
    emit('delete', props.id);
};

const handleYoutubeConnect = async () => {
  try {
    const authUrl = await requestYoutubeAuthUrl(props.id);

    if (authUrl) {
      console.log('유튜브 인증 URL:', authUrl);
      window.location.href = authUrl;
    } else {
      toast.error('유튜브 인증 URL을 가져오지 못했습니다.');
    }
  } catch (error) {
    console.error('YouTube 연동 중 오류 발생:', error);
    toast.error('유튜브 연동에 실패했습니다. 다시 시도해주세요.');
  }
};

const handleYoutubeDisconnect = async () => {
    if (confirm('유튜브 연동을 정말로 해제하시겠습니까? 연동 해제 시 관련 데이터는 더 이상 업데이트되지 않습니다.')) {
        try {
            await disconnectYoutube(props.id);
            toast.success('유튜브 연동이 성공적으로 해제되었습니다!');
            console.log('YouTube 연동 해제 성공');
            window.location.reload();
        } catch (error) {
            toast.error('유튜브 연동 해제에 실패했습니다. 다시 시도해주세요.');
            console.error('YouTube 연동 해제 중 오류 발생:', error);
        }
    }
};

const handleInstagramConnect = async () => {
  try {
    const authUrl = await requestInstagramAuthUrl(props.id);

    if (authUrl) {
      console.log('인스타그램 인증 URL:', authUrl);
      window.location.href = authUrl;
    } else {
      toast.error('인스타그램 인증 URL을 가져오지 못했습니다.');
    }
  } catch (error) {
    console.error('인스타그램 연동 중 오류 발생:', error);
    toast.error('인스타그램 연동에 실패했습니다. 다시 시도해주세요.');
  }
};

const handleInstagramDisconnect = async () => {
    if (confirm('인스타그램 연동을 정말로 해제하시겠습니까? 연동 해제 시 관련 데이터는 더 이상 업데이트되지 않습니다.')) {
        try {
            await disconnectInstagram(props.id);
            toast.success('인스타그램 연동이 성공적으로 해제되었습니다!');
            console.log('인스타그램 연동 해제 성공');
        } catch (error) {
            toast.error('인스타그램 연동 해제에 실패했습니다. 다시 시도해주세요.');
            console.error('인스타그램 연동 해제 중 오류 발생:', error);
        }
    }
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
      <!-- 인스타그램 -->
      <div
        class="flex flex-wrap gap-1 mb-2 border px-3 py-2 rounded-lg justify-between items-center"
      >
        <div class="flex flex-col flex-wrap">
          <div class="flex flex-wrap items-center gap-2 text-base font-medium">
            <Icon icon="logos:youtube-icon" class="w-7 h-7" />
            <span
              class="font-bold truncate max-w-[155px]"
              :title="name"
              :class="{'text-gray-500': name === '미연결'}"
            >
              {{ name }}
            </span>
          </div>
          <div v-if="subscribers" class="text-sm text-gray-dark truncate">
            구독자 {{ subscribers }}
          </div>
        </div>
        <button
          v-if="name === '미연결'"
          @click="handleYoutubeConnect"
          class="flex px-2 h-[40px] border-[1px] border-blue-600 rounded-lg items-center justify-center gap-1 font-bold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Icon icon="solar:link-round-bold" width="20" height="20" />
          연동
        </button>

        <button
          v-else
          @click="handleYoutubeDisconnect"
          class="flex px-2 h-[40px] border-[1px] border-red-600 rounded-lg items-center justify-center gap-1 font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
          <Icon icon="solar:link-round-bold" width="20" height="20" />
          해제
        </button>
      </div>

      <!-- 인스타그램 -->
      <div
        class="flex flex-wrap gap-1 border px-3 py-2 rounded-lg justify-between items-center"
      >
        <div class="flex flex-col">
          <div class="flex items-center gap-2 text-base font-medium">
            <Icon icon="skill-icons:instagram" class="w-7 h-7" />
            <span
              class="font-bold truncate"
              :title="instagram"
              :class="{'text-gray-500': instagram === '미연결'}"
            >
                            {{ instagram }}
                        </span>
          </div>
          <div v-if="instaFollowers" class="text-sm text-gray-dark truncate">
            팔로워 {{ instaFollowers }}
          </div>
        </div>
        <button
          v-if="instagram === '미연결'"
          @click="handleInstagramConnect"
          class="flex px-2 h-[40px] border-[1px] border-blue-600 rounded-lg items-center justify-center gap-1 font-bold text-blue-600 hover:bg-blue-50 transition-colors"
        >
          <Icon icon="solar:link-round-bold" width="20" height="20" />
          연동
        </button>
        <button
          v-else @click="handleInstagramDisconnect"
          class="flex px-2 h-[40px] border-[1px] border-red-600 rounded-lg items-center justify-center gap-1 font-bold text-red-600 hover:bg-red-50 transition-colors"
        >
          <Icon icon="solar:link-round-bold" width="20" height="20" />
          해제
        </button>
      </div>
    </div>

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
