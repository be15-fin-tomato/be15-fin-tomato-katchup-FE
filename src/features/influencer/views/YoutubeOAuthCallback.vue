<script setup>
import { onMounted, ref } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();
const message = ref('유튜브 계정 연동 처리 중...');
const error = ref(false);

onMounted(() => {
  const statusParam = route.query.status;
  const errorMessageParam = route.query.error_message;

  if (statusParam === 'success') {
    message.value = '유튜브 계정 연동이 성공적으로 완료되었습니다!';
    error.value = false;
    setTimeout(() => {
      router.push('/management/influencer');
    }, 3000);
  } else if (statusParam === 'fail') {
    const decodedErrorMessage = errorMessageParam ?
      decodeURIComponent(errorMessageParam.replace(/\+/g, ' ')) :
      '알 수 없는 오류가 발생했습니다.';
    message.value = `유튜브 계정 연동 실패: ${decodedErrorMessage}`;
    error.value = true;
  } else {
    message.value = '유튜브 계정 연동 상태를 알 수 없습니다. 다시 시도해주세요.';
    error.value = true;
  }
});
</script>

<template>
  <div class="flex flex-col items-center justify-center bg-gray-100 p-4">
    <div :class="{'text-blue-500': !error, 'text-red-500': error}" class="text-xl font-bold mb-4">
      {{ message }}
    </div>
    <p v-if="!error" class="text-gray-dark">잠시 후 인플루언서 목록 페이지로 이동합니다.</p>
    <button @click="router.push('/management/influencer')" class="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600">
      인플루언서 목록으로 돌아가기
    </button>
  </div>
</template>
