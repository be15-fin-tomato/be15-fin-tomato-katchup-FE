<template>
  <div class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex justify-center items-center z-50">
    <div class="relative p-5 border w-96 shadow-lg rounded-md bg-white">
      <div class="text-center">
        <h3 class="text-xl leading-6 font-medium text-gray-900 mb-4">인스타그램 계정 연동</h3>
        <div class="mt-2 px-7 py-3">
          <p class="text-sm text-gray-500 mb-4">
            연동할 인플루언서의 고유 ID를 입력해주세요.
          </p>
          <input
            type="text"
            v-model="influencerIdInput"
            placeholder="인플루언서 ID"
            class="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                   focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div class="items-center px-4 py-3">
          <button
            id="cancel-button"
            @click="closeModal"
            class="px-4 py-2 bg-gray-200 text-gray-800 text-base font-medium rounded-md w-24 mr-2 shadow-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-300"
          >
            취소
          </button>
          <button
            id="confirm-button"
            @click="confirmId"
            class="px-4 py-2 bg-indigo-600 text-white text-base font-medium rounded-md w-24 shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            확인
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  influencerId: {
    type: String,
    default: ''
  }
});

const emits = defineEmits(['close', 'confirm']);

const influencerIdInput = ref(props.influencerId);

const closeModal = () => {
  emits('close');
};

const confirmId = () => {
  if (influencerIdInput.value) {
    emits('confirm', influencerIdInput.value);
  } else {
    alert('인플루언서 ID를 입력해주세요.');
  }
};
</script>

<style scoped>

</style>
