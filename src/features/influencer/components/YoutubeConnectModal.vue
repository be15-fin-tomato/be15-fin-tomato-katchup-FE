<template>
  <div class="fixed inset-0 bg-black/30 flex justify-center items-center z-50 p-4">
    <div class="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm mx-auto font-display transform transition-all duration-300 ease-out scale-95 opacity-0"
         :class="{'scale-100 opacity-100': isOpen}"
         ref="modalContent">
      <h2 class="text-xl font-bold text-gray-800 mb-4 text-center">
        유튜브 계정 연동
      </h2>
      <p class="text-sm text-gray-600 mb-6 text-center">
        연동할 인플루언서의 고유 ID를 입력해주세요.
      </p>

      <div class="mb-6">
        <label for="influencerId" class="block text-sm font-medium text-gray-700 mb-2">
          인플루언서 ID
        </label>
        <input
          type="number"
          id="influencerId"
          class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm placeholder-gray-400"
          placeholder="예: 1234"
          v-model.number="influencerId"
          @keyup.enter="handleConfirm"
        />
        <p v-if="idError" class="mt-2 text-sm text-red-600">{{ idError }}</p>
      </div>

      <div class="flex justify-end gap-3">
        <button
          @click="closeModal"
          class="px-5 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors duration-200"
        >
          취소
        </button>
        <button
          @click="handleConfirm"
          class="px-5 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors duration-200"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { requestYoutubeAuthUrl } from '@/features/influencer/api.js';

const emit = defineEmits(['close']);

const influencerId = ref(null);
const idError = ref('');
const isOpen = ref(false);

const modalContent = ref(null);
const handleClickOutside = (event) => {
  if (modalContent.value && !modalContent.value.contains(event.target)) {
    closeModal();
  }
};

onMounted(() => {
  isOpen.value = true;
  document.addEventListener('mousedown', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('mousedown', handleClickOutside);
});

const closeModal = () => {
  isOpen.value = false;
  setTimeout(() => emit('close'), 300);
};

const handleConfirm = async () => { // async 키워드 추가
  if (influencerId.value === null || influencerId.value <= 0 || !Number.isInteger(influencerId.value)) {
    idError.value = '유효한 인플루언서 ID (양의 정수)를 입력해주세요.';
    return;
  }
  idError.value = '';

  try {
    const authUrl = await requestYoutubeAuthUrl(influencerId.value);
    if (authUrl) {
      window.location.href = authUrl;

      closeModal();
    } else {
      alert('유튜브 연동 URL을 가져오지 못했습니다.');
      closeModal();
    }
  } catch (error) {
    console.error('유튜브 연동 요청 중 오류 발생:', error);
    alert('유튜브 연동을 시작하는 데 실패했습니다. 다시 시도해주세요.');
    closeModal();
  }
};
</script>

<style scoped>
</style>
