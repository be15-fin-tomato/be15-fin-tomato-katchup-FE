<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import ClientCompanyForm from '@/features/advertisement/components/ClientCompanyForm.vue';
import { createClientCompany } from '@/features/advertisement/api.js';
import { useToast } from 'vue-toastification';
import { Icon } from '@iconify/vue';

const router = useRouter();
const toast = useToast();
const formRef = ref(null);


const handleSave = async () => {
  if (!formRef.value || typeof formRef.value.getFormData !== 'function') {
    toast.error('폼 로딩에 실패했습니다.');
    console.error('formRef 또는 getFormData 문제', formRef.value);
    return;
  }

  const formData = formRef.value.getFormData();

  if (
    !formData.clientCompanyName ||
    !Array.isArray(formData.userIds) ||
    formData.userIds.length === 0
  ) {
    toast.error('고객사명과 담당자는 필수 항목입니다.');
    return;
  }

  try {
    await createClientCompany(formData);
    toast.success('등록이 완료되었습니다.');
    router.push('/management/client');
  } catch (err) {
    console.error('[등록 에러]', err.response?.data ?? err);
    toast.error('등록 실패했습니다.');
  }
};
</script>

<template>
  <div class="flex">
    <!-- 좌측 의견 바가 없으므로 오른쪽 전체 영역만 사용 -->
    <div class="flex-1 flex flex-col gap-8">
      <!-- 상단: 고객사 등록 폼 -->
      <div class="container">
        <!-- 상단 헤더 영역 -->
        <div class="page-header">
          <div class="page-title">고객사 등록</div>
          <div class="flex justify-end gap-2">
            <button class="btn-create" @click="handleSave">저장</button>
            <Icon
              icon="material-symbols:lists-rounded"
              width="48"
              height="48"
              class="text-btn-gray cursor-pointer"
              @click="router.push('/management/client')"
            />

          </div>
        </div>

        <!-- 구분선 -->
        <div class="blue-line"></div>

        <!-- 고객사 등록 폼 본문 -->
        <ClientCompanyForm ref="formRef" :isEditing="true" />
      </div>
    </div>
  </div>
</template>
