<template>
  <div class="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
    <div class="bg-white rounded-xl p-6 w-[554px] h-[720px] overflow-y-auto font-display">
      <h2 class="text-lg font-semibold mb-6">인플루언서 등록</h2>

      <!-- 본명 -->
      <div class="mb-4">
        <label class="text-sm font-medium mb-1 block">본명 <span class="text-red-500">*</span></label>
        <input
          type="text"
          class="w-full h-[44px] border border-gray-medium rounded px-3 text-sm"
          v-model="form.realName"
          required
        />
      </div>

      <!-- 드롭다운 -->
      <div class="grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
        <select class="h-[44px] border border-gray-medium rounded px-3 text-sm" v-model="form.gender">
          <option disabled value="">성별을 선택하세요.</option>
          <option>남성</option>
          <option>여성</option>
          <option>기타</option>
        </select>

        <select class="h-[44px] border border-gray-medium rounded px-3 text-sm" v-model="form.manager">
          <option disabled value="">담당자를 선택하세요.</option>
          <option>오유경</option>
          <option>박준서</option>
          <option>박장우</option>
          <option>윤채영</option>
          <option>이승재</option>
          <option>조현승</option>
        </select>

        <select class="h-[44px] border border-gray-medium rounded px-3 text-sm" v-model="form.region">
          <option disabled value="">주요 지역</option>
          <option>국내</option>
          <option>국외</option>
        </select>

        <input
          type="text"
          placeholder="광고 단가를 입력하세요."
          class="h-[44px] border border-gray-medium rounded px-3 text-sm"
          v-model="form.fee"
        />
      </div>

      <!-- 연동 필드 -->
      <div class="flex flex-col gap-3 mb-6">
        <!-- 유튜브 -->
        <div class="flex items-center justify-start">
          <div class="w-full">
            <label class="text-sm font-medium mb-1 block">유튜브 채널 ID</label>
            <input
              type="text"
              class="w-full h-[44px] border border-gray-medium rounded px-3 text-sm"
              v-model="form.channelId"
              disabled
              placeholder="유튜브 계정을 연동하세요."
            />
          </div>
        </div>

        <!-- 인스타그램 -->
        <div class="flex items-center justify-start">
          <div class="w-full">
            <label class="text-sm font-medium mb-1 block">인스타그램 아이디</label>
            <input
              type="text"
              class="w-full h-[44px] border border-gray-medium rounded px-3 text-sm"
              v-model="form.instagramId"
              disabled
              placeholder="인스타그램 계정을 연동하세요."
            />
          </div>
        </div>
      </div>

      <!-- 태그 선택 -->
      <div
        class="w-full min-h-[80px] border border-gray-medium rounded px-3 py-2 text-sm mb-4 flex flex-wrap gap-2 items-start"
        id="categoryInput"
      >
        <span
          v-for="tag in selectedTags"
          :key="tag"
          class="px-2 py-1 rounded-full cursor-pointer"
          :class="TAG_COLOR_MAP[tag] || 'bg-gray-200 text-black'"
          @click="returnTag(tag)"
        >
          # {{ tag }}
        </span>
      </div>

      <div id="categoryTags" class="border border-gray-medium rounded px-3 py-2">
        <div class="flex flex-wrap gap-2">
          <span
            v-for="tag in availableTags"
            :key="tag"
            class="text-sm px-2 py-1 rounded-full cursor-pointer"
            :class="TAG_COLOR_MAP[tag] || 'bg-gray-200 text-black'"
            @click="moveTagToSelected(tag)"
          >
            # {{ tag }}
          </span>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="flex justify-end gap-2 mt-6">
        <button @click="$emit('close')" class="bg-[color:var(--color-gray-dark)] text-white px-6 py-2 rounded">
          취소
        </button>
        <button class="bg-[color:var(--color-btn-blue)] text-white px-6 py-2 rounded" @click="handleSave">
          저장
        </button>
      </div>
    </div>

    <!-- 연동 여부 확인 모달 -->
    <div
      v-if="showConfirmModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-[360px]">
        <h3 class="text-lg font-semibold mb-4">
          {{ currentPlatform }} 계정을 연동하시겠습니까?
        </h3>
        <div class="flex justify-end gap-2 mt-4">
          <button class="px-4 py-2 bg-gray-300 rounded" @click="cancelConfirm">
            아니오
          </button>
          <button class="px-4 py-2 bg-blue-500 text-white rounded" @click="handleConfirm">
            예
          </button>
        </div>
      </div>
    </div>

    <!-- API 연동 모달 (Instagram) -->
    <div
      v-if="showApiModal"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-50"
    >
      <div class="bg-white p-6 rounded-lg w-[400px]">
        <h3 class="text-lg font-semibold mb-4">{{ currentPlatform }} 연동 정보 입력</h3>

        <label class="text-sm font-medium block mb-1">
          채널 ID <span class="text-red-500">*</span>
        </label>
        <input
          v-model="channelIdInput"
          placeholder="채널 ID를 입력하세요"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
        />

        <label class="text-sm font-medium block mb-1">API 키 (선택)</label>
        <input
          v-model="apiKeyInput"
          placeholder="API 키를 입력하세요"
          class="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
        />

        <div class="flex justify-end gap-2">
          <button class="px-4 py-2 bg-gray-300 rounded" @click="closeApiModal">
            취소
          </button>
          <button class="px-4 py-2 bg-blue-500 text-white rounded" @click="submitApiKey">
            등록
          </button>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { TAG_COLOR_MAP, TAGS } from '@/constants/tags';
import { connectYoutube, postToken } from '@/features/user/api.js';

const props = defineProps({ initialData: Object });
const emit = defineEmits(['close', 'save']);

const form = ref({
    realName: '',
    youtubeName: '',
    instagramId: '',
    gender: '',
    manager: '',
    region: '',
    fee: '',
    channelId: '',
});

const youtubeToggle = ref(false);
const instagramToggle = ref(false);

const showApiModal = ref(false);
const currentPlatform = ref('');
const apiKeyInput = ref('');
const channelIdInput = ref('');

const toggleYoutube = async () => {
    if (youtubeToggle.value) {
        youtubeToggle.value = false;
        form.value.youtubeName = '';
        form.value.channelId = '';
    } else {
        const res = await connectYoutube();
        const authUrl = res.data.data;
        window.open(authUrl, 'YouTubeAuth', 'width=500,height=600');
    }
};

const toggleInstagram = () => {
    if (instagramToggle.value) {
        instagramToggle.value = false;
        form.value.instagramId = '';
    } else {
        currentPlatform.value = 'Instagram';
        showApiModal.value = true;
    }
};

const closeApiModal = () => {
    showApiModal.value = false;
    apiKeyInput.value = '';
    channelIdInput.value = '';
};

const submitApiKey = () => {
    if (!channelIdInput.value.trim()) {
        alert('채널 ID를 입력해주세요.');
        return;
    }

    if (currentPlatform.value === 'YouTube') {
        form.value.youtubeName = channelIdInput.value;
        youtubeToggle.value = true;
    } else if (currentPlatform.value === 'Instagram') {
        form.value.instagramId = channelIdInput.value;
        instagramToggle.value = true;
    }

    closeApiModal();
};

const selectedTags = ref([]);
const availableTags = ref([...TAGS]);

const moveTagToSelected = (tag) => {
    availableTags.value = availableTags.value.filter((t) => t !== tag);
    selectedTags.value.push(tag);
};

const returnTag = (tag) => {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
    availableTags.value.push(tag);
};
const handleMessage = async (event) => {
    if (event.origin !== window.location.origin) return;

    const { code } = event.data;
    if (!code) return;

    try {
        const res = await postToken(code); // 백엔드로 code 전달하여 토큰 요청 및 채널 ID 획득

        console.log(res.data.data.channelId);

        form.value.channelId = res.data.data.channelId;
        youtubeToggle.value = true;
    } catch (e) {
        console.error('유튜브 토큰 요청 실패:', e);
        alert('유튜브 연동에 실패했습니다.');
    }
};
const handleSave = () => {
  if (!form.value.realName) {
    alert('본명을 입력해주세요.');
    return;
  }

  // 1. 일단 기본 정보 저장
  const data = {
    id: props.initialData?.id ?? Date.now(),
    realName: form.value.realName,
    name: form.value.youtubeName,
    instagram: form.value.instagramId,
    gender: form.value.gender,
    region: form.value.region,
    fee: form.value.fee,
    ownerName: form.value.manager,
    tags: selectedTags.value,
    thumbnail: '/src/assets/icons/logo.png',
  };

  emit('save', data);

  // 2. 유튜브 연동 모달 띄우기
  currentPlatform.value = 'YouTube';
  showConfirmModal.value = true;
};


onMounted(() => {
    window.addEventListener('message', handleMessage);

    if (props.initialData) {
        Object.assign(form.value, {
            ...props.initialData,
            youtubeName: props.initialData.name || '',
            instagramId: props.initialData.instagram || '',
        });

        youtubeToggle.value = !!form.value.youtubeName;
        instagramToggle.value = !!form.value.instagramId;

        selectedTags.value = props.initialData.tags?.slice() || [];
        availableTags.value = TAGS.filter((tag) => !selectedTags.value.includes(tag));
    }
});
const showConfirmModal = ref(false);

const handleConfirm = async () => {
  showConfirmModal.value = false;

  if (currentPlatform.value === 'YouTube') {
    const res = await connectYoutube();
    const authUrl = res.data.data;
    window.open(authUrl, 'YouTubeAuth', 'width=500,height=600');

  } else if (currentPlatform.value === 'Instagram') {
    showApiModal.value = true;
  }
};

const cancelConfirm = () => {
  showConfirmModal.value = false;

  if (currentPlatform.value === 'YouTube') {
    // 유튜브 스킵 후 인스타로 이동
    currentPlatform.value = 'Instagram';
    showConfirmModal.value = true;
  } else {
    // 인스타도 스킵
    emit('close');
  }
};


onUnmounted(() => {
    window.removeEventListener('message', handleMessage);
});
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
@import 'tailwindcss';
</style>
