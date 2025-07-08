<script setup>
import { ref, watch } from 'vue';
import { fetchContractFile } from '@/features/contract/api';

const props = defineProps({
  pdfUrl: String,
});
const emit = defineEmits(['close']);

const pdfUrl = ref('');
const error = ref('');

watch([() => props.contractId, () => props.password], async ([id, pw]) => {
  if (!id || !pw) return;
  try {
    const { data } = await fetchContractFile(id, pw);
    pdfUrl.value = data.data.contractView[0].filePath;
  } catch (err) {
    error.value = '계약서 조회 실패';
  }
});
</script>

<template>
  <div class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div class="bg-white w-[90%] h-[90%] rounded-xl shadow-lg relative">
      <button
        @click="$emit('close')"
        class="absolute top-3 right-3 text-sm px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        닫기
      </button>

      <div v-if="error" class="text-red-500 text-center mt-10">{{ error }}</div>
      <iframe
        v-else-if="pdfUrl"
        :src="pdfUrl"
        class="w-full h-full rounded-b-xl"
        frameborder="0"
      ></iframe>
    </div>
  </div>
</template>
