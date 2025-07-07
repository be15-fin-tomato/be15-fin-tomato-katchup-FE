<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white p-6 rounded-lg w-[360px] text-center">
      <h2 class="text-xl font-bold mb-4">계약서 등록</h2>

      <!-- 비밀번호 입력 -->
      <input
        v-model="password"
        type="password"
        placeholder="비밀번호 입력"
        class="w-full border px-4 py-2 rounded mb-4"
      />

      <label class="block w-full mb-2">
        <input
          type="file"
          class="hidden"
          @change="handleFileChange"
        />
        <div class="border rounded px-4 py-2 bg-gray-100 hover:bg-gray-200 cursor-pointer">
          {{ selectedFileName || '파일 선택' }}
        </div>
      </label>

      <!-- 버튼 영역 -->
      <div class="mt-4 flex justify-center gap-3">
        <button @click="handleSubmit" class="btn-create">
          등록
        </button>
        <button @click="$emit('close')" class="btn-delete">
          취소
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { uploadContractFile } from '@/features/contract/api';

const props = defineProps({
  contractId: Number,
});
const emit = defineEmits(['uploaded', 'close']);

const password = ref('');
const selectedFile = ref(null);
const selectedFileName = ref('');

const handleFileChange = (event) => {
  const file = event.target.files[0];
  selectedFile.value = file;
  selectedFileName.value = file ? file.name : '';
};

const handleSubmit = async () => {
  if (!selectedFile.value || !password.value) {
    alert('비밀번호와 파일을 모두 입력해주세요.');
    return;
  }

  try {
    const formData = new FormData();
    formData.append('password', password.value);
    formData.append('files', selectedFile.value);

    await uploadContractFile(props.contractId, formData);
    emit('uploaded');
  } catch (err) {
    console.error('업로드 실패:', err);
    alert('업로드 실패');
  }
};
</script>
