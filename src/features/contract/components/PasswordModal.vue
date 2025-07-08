<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-[300px] p-6 shadow-md text-center">
      <div class="mb-4 text-sm font-medium">
        <span class="inline-flex items-center">
          🔒 비밀번호를 입력하세요
        </span>
      </div>
      <input
        v-model="password"
        type="password"
        placeholder="비밀번호 입력"
        class="w-full border rounded px-3 py-2 mb-4 text-sm"
        @keyup.enter="handleConfirm"
      />
      <div class="flex justify-center gap-2">
        <button @click="handleCancel" class="btn-delete">
          취소
        </button>
        <button @click="handleConfirm" class="btn-create">
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';

const emit = defineEmits(['submit', 'close']);
const password = ref('');

watch(() => password.value, () => {}, { immediate: true });

const handleConfirm = () => {
  if (!password.value.trim()) return;
  emit('submit', password.value);
  password.value = '';
};

const handleCancel = () => {
  password.value = '';
  emit('close');
};
</script>
