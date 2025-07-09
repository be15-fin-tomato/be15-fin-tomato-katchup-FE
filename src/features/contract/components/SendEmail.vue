<template>
  <div class="border border-gray-dark rounded-lg bg-white p-6 mt-6">
    <h3 class="font-bold text-lg mb-4">이메일 전송</h3>

    <div class="mb-4 flex items-center gap-2">
      <label class="w-[76px] font-semibold">이름</label>
      <input
        type="text"
        :value="name"
        disabled
        class="border px-2 py-1 rounded w-[10%] bg-gray-100 border-gray-dark"
      />
    </div>

    <div class="mb-4 flex items-center gap-2">
      <label class="w-[75px] font-semibold">이메일</label>
      <input
        type="email"
        :value="form.email?.email ?? ''"
        disabled
        class="border px-2 py-1 rounded w-[20%] bg-gray-100 border-gray-dark"
      />
      <button
        type="button"
        class="btn-open-popup"
        @click="openSearchPopup('email', 'manager')"
        :disabled="isSending"
      >
        검색
      </button>
    </div>

    <div class="mb-4 flex items-start gap-2">
      <label class="w-[75px] font-semibold">제목</label>
      <input
        type="text"
        v-model="title"
        class="input-form-box flex-1 border-gray-dark"
        :disabled="isSending"
      />
    </div>

    <div class="mb-4 flex items-start gap-2">
      <label class="w-[75px] font-semibold pt-2">내용</label>
      <div class="flex-1">
        <QuillEditor
          :content="editorContent"
          @update:content="editorContent = $event"
          :readonly="isSending"
        />

        <div class="flex items-center gap-2 mt-4">
          <button
            @click="triggerFileInput"
            type="button"
            class="px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
            :disabled="isSending"
          >
            <Icon icon="codex:file" class="inline-block mr-1" /> 파일 첨부
          </button>
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="handleFilesChange"
            accept="*/*"
            multiple
            :disabled="isSending"
          />
        </div>

        <div class="mt-2" v-if="attachedFiles.length > 0 || loadingFile">
          <span v-if="loadingFile" class="text-gray-500 text-sm">첨부파일 로드 중...</span>
          <div v-else>
            <div v-for="(file, index) in attachedFiles" :key="index"
                 class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm mb-1">
              <Icon icon="codex:file" class="text-blue-500 w-4 h-4" />
              <span class="text-gray-700 truncate max-w-xs">
                {{ file.name || file.originalName }}
              </span>
              <button
                @click="removeAttachedFile(index)"
                class="text-xs text-red-500 ml-1 hover:underline"
                :disabled="isSending"
              >삭제</button>
            </div>
          </div>
        </div>
        <span v-else class="text-gray-500 text-sm mt-2 block">첨부된 파일 없음</span>

        <div class="flex justify-end mt-4">
          <button class="btn-create" @click="sendEmail" :disabled="isSending">
            <span v-if="isSending" class="flex items-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              전송 중...
            </span>
            <span v-else>전송</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import QuillEditor from '@/components/common/QuillEditor.vue';
import { Icon } from '@iconify/vue';
import { sendContractEmail } from '@/features/contract/api.js';

// useToast를 import 합니다.
import { useToast } from "vue-toastification";

const props = defineProps({
  name: String,
  email: String,
  title: Object,
  initialContent: String,
  initialFile: Object,
});

const editorContent = ref('');
const title = ref('');

const name = ref('');
const email = ref('');

const currentFieldKey = ref('');
const form = ref({
  email: null,
});

const attachedFiles = ref([]);
const fileInput = ref(null);
const loadingFile = ref(false);
const isSending = ref(false); // 이메일 전송 중 상태

// Toast 인스턴스를 가져옵니다.
const toast = useToast();

watch(() => props.name, (newName) => {
  name.value = newName || '';
}, { immediate: true });

watch(() => props.email, (newEmail) => {
  email.value = newEmail || '';
  if (newEmail) {
    form.value.email = { email: newEmail };
  } else {
    form.value.email = null;
  }
}, { immediate: true });

watch(() => props.title, (newTitleProp) => {
  if (newTitleProp && newTitleProp.name) {
    title.value = `[계약서] ${newTitleProp.name}`;
  } else {
    title.value = '';
  }
}, { immediate: true });

watch(() => props.initialContent, (newContent) => {
  editorContent.value = newContent || '';
}, { immediate: true });

watch(() => props.initialFile, async (newFile) => {
  if (newFile && (newFile.fileUrl || newFile.filePath)) {
    loadingFile.value = true;
    try {
      const fileDownloadUrl = newFile.fileUrl || newFile.filePath;
      if (!fileDownloadUrl) {
        throw new Error('첨부 파일 다운로드 URL이 없습니다.');
      }

      const response = await fetch(fileDownloadUrl);
      if (!response.ok) {
        throw new Error(`파일 다운로드 실패: ${response.status} ${response.statusText}`);
      }
      const blob = await response.blob();

      const mimeType = newFile.mimeType || response.headers.get('Content-Type') || 'application/octet-stream';
      const downloadedFile = new File([blob], newFile.originalName, { type: mimeType });

      attachedFiles.value = [downloadedFile];
    } catch (error) {
      console.error('템플릿 첨부 파일 로드 중 오류 발생:', error);
      toast.error('템플릿 첨부 파일을 불러오는 데 실패했습니다.'); // alert 대신 toast
      attachedFiles.value = [];
    } finally {
      loadingFile.value = false;
    }
  } else {
    attachedFiles.value = [];
  }
}, { immediate: true });

const openSearchPopup = (key, type) => {
  currentFieldKey.value = key;
  const currentValue = form.value[key];
  const selected = currentValue?.id ?? '';

  const popup = window.open(
    `/search-popup?type=${type}&selected=${encodeURIComponent(selected)}&labelKey=fullLabel`,
    'SearchPopup',
    'width=500,height=600',
  );

  window.handleUserSelect = (selectedItem) => {
    form.value[currentFieldKey.value] = selectedItem;

    if (key === 'email') {
      name.value = selectedItem.name;
      email.value = selectedItem.email;
    }

    popup.close();
  };
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFilesChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    attachedFiles.value = [...attachedFiles.value, ...Array.from(files)];
  }
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const removeAttachedFile = (indexToRemove) => {
  attachedFiles.value.splice(indexToRemove, 1);
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const isQuillContentEffectivelyEmpty = (htmlContent) => {
  if (!htmlContent) return true;

  const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
  if (textContent.length > 0) return false;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const hasMeaningfulEmbeds = tempDiv.querySelector('img, a[href]');

  return !hasMeaningfulEmbeds;
};

watch(editorContent, (newValue) => {
  console.log('editorContent changed in SendEmail.vue:', newValue);
});

const sendEmail = async () => {
  console.log("--- 전송 버튼 클릭됨 ---");
  console.log("수신자 이메일:", form.value.email?.email);
  console.log("제목:", title.value);
  console.log("Quill Editor 내용 (HTML):", editorContent.value);
  console.log("첨부 파일들:", attachedFiles.value);
  console.log("-----------------------");

  // 유효성 검사
  if (!form.value.email?.email.trim()) {
    toast.error('수신자 이메일을 선택하거나 입력해주세요.'); // alert 대신 toast
    return;
  }
  if (!title.value.trim()) {
    toast.error('이메일 제목을 입력해주세요.'); // alert 대신 toast
    return;
  }
  if (isQuillContentEffectivelyEmpty(editorContent.value)) {
    toast.error('이메일 내용을 입력해주세요.'); // alert 대신 toast
    return;
  }

  // 전송 중 상태 활성화
  isSending.value = true;
  // 전송 시작을 사용자에게 알림 (비침습적인 Toast 사용)
  const sendingToastId = toast.info('메일을 전송 중입니다...', { timeout: false, closeButton: false }); // 무한 타임아웃, 닫기 버튼 없음

  const requestData = {
    content: editorContent.value,
    title: title.value,
    targetEmail: form.value.email.email,
  };

  try {
    const response = await sendContractEmail(requestData, attachedFiles.value);
    toast.dismiss(sendingToastId); // 전송 중 토스트 닫기

    if (response.success) {
      toast.success('이메일이 성공적으로 전송되었습니다.'); // 성공 Toast
      // 폼 초기화
      name.value = '';
      email.value = '';
      title.value = '';
      editorContent.value = '';
      form.value.email = null;
      attachedFiles.value = [];
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    } else {
      toast.error(`이메일 전송 실패: ${response.message || '알 수 없는 오류'}`); // 실패 Toast
    }
  } catch (error) {
    toast.dismiss(sendingToastId); // 전송 중 토스트 닫기
    toast.error('이메일 전송 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.'); // 오류 Toast
    console.error('이메일 전송 API 호출 중 에러:', error);
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>

</style>
