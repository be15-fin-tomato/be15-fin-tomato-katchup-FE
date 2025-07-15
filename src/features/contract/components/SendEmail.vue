<template>
  <div class="border border-gray-dark rounded-lg bg-white p-6 mt-6">
    <h3 class="font-bold text-lg mb-4">이메일 전송</h3>

    <div class="mb-4 flex items-center gap-2">
      <label class="w-[76px] font-semibold">이름</label>
      <input
        type="text"
        :value="form.email?.name ?? ''" disabled
        class="border px-2 py-1 rounded w-[10%] bg-gray-100 border-gray-dark"
      />
    </div>

    <div class="mb-4 flex items-center gap-2">
      <label class="w-[75px] font-semibold">이메일</label>
      <input
        type="email"
        :value="form.email?.email ?? ''" disabled
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
        v-model="emailTitle" class="input-form-box flex-1 border-gray-dark"
        :disabled="isSending"
      />
    </div>

    <div class="mb-4 flex items-start gap-2">
      <label class="w-[75px] font-semibold pt-2">내용</label>
      <div class="flex-1">
        <QuillEditor
          :content="editorContent"
          @update:content="editorContent = $event"
          :readonly="isSending" />

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
import { useToast } from "vue-toastification";

const props = defineProps({
  name: String,
  email: String,
  title: Object,
  initialContent: String,
  initialFile: Object,
});

const editorContent = ref('');
const emailTitle = ref('');

const currentFieldKey = ref('');
const form = ref({
  email: null,
});

const attachedFiles = ref([]); // 로컬 파일 (File 객체) 또는 S3 파일 메타데이터 (Object)
const fileInput = ref(null);
const loadingFile = ref(false);
const isSending = ref(false);

const toast = useToast();

// 파일 용량 계산 (바이트 단위)
const getTotalFilesize = () => {
  let totalSize = 0;
  console.log('--- Checking attachedFiles for total size ---'); // 디버깅용 로그
  attachedFiles.value.forEach((file, index) => {
    console.log(`  Processing File ${index}:`, file); // 각 파일 객체 확인
    if (file instanceof File) {
      console.log(`    Type: Local File, Size: ${file.size} bytes`); // 로컬 파일 크기
      totalSize += file.size;
    } else if (file.isS3File && typeof file.size === 'number') {
      console.log(`    Type: S3 File, Size: ${file.size} bytes`); // S3 파일 크기
      totalSize += file.size;
    } else {
      console.log(`    Type: Unknown/Missing Size, File Object:`, file); // size 정보가 없거나 타입이 다른 경우
    }
  });
  console.log('--- Finished checking attachedFiles --- Total:', totalSize, 'bytes'); // 최종 계산된 총 용량
  return totalSize;
};

// 바이트를 읽기 쉬운 형식으로 변환 (KB, MB 등)
const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};


watch(() => [props.name, props.email], ([newName, newEmail]) => {
  if (newEmail) {
    form.value.email = { email: newEmail, name: newName || '' };
  } else {
    form.value.email = null;
  }
}, { immediate: true });

watch(() => props.title, (newTitleProp) => {
  if (newTitleProp && newTitleProp.name) {
    emailTitle.value = `[계약서] ${newTitleProp.name}`;
  } else {
    emailTitle.value = '';
  }
}, { immediate: true });

watch(() => props.initialContent, (newContent) => {
  editorContent.value = newContent || '';
}, { immediate: true });

watch(() => props.initialFile, async (newFile) => {
  if (newFile && newFile.fileId) {
    loadingFile.value = true;
    try {
      const isS3FileAlreadyAttached = attachedFiles.value.some(
        (f) => f.fileId === newFile.fileId && f.isS3File
      );

      if (!isS3FileAlreadyAttached) {
        // S3 파일 추가 시, 어떤 데이터가 들어오는지 콘솔에 찍어봅니다.
        console.log('--- S3 File Watch Triggered ---');
        console.log('newFile:', newFile);
        console.log('newFile.size:', newFile.size, typeof newFile.size);
        console.log('------------------------------');

        attachedFiles.value.push({
          name: newFile.originalName,
          originalName: newFile.originalName,
          fileId: newFile.fileId,
          program: newFile.program,
          isS3File: true,
          size: newFile.size || 0 // S3 파일에도 size 정보가 있다면 사용, 없으면 0
        });
      }
    } catch (error) {
      console.error('템플릿 첨부 파일 처리 중 오류 발생:', error);
      toast.error('템플릿 첨부 파일을 불러오는 데 실패했습니다.');
    } finally {
      loadingFile.value = false;
    }
  } else {
    // initialFile이 없는 경우 S3 파일이 아닌 항목만 남김
    attachedFiles.value = attachedFiles.value.filter(file => !file.isS3File);
  }
}, { immediate: true });


const openSearchPopup = (key, type) => {
  currentFieldKey.value = key;
  const currentValue = form.value[key];
  const selected = currentValue?.id ?? '';

  const currentEmail = form.value.email?.email || '';
  const currentName = form.value.email?.name || '';

  const popup = window.open(
    `/search-popup?type=${type}&selected=${encodeURIComponent(selected)}&labelKey=fullLabel&email=${encodeURIComponent(currentEmail)}&name=${encodeURIComponent(currentName)}`,
    'SearchPopup',
    'width=500,height=600',
  );

  window.handleUserSelect = (selectedItem) => {
    form.value[currentFieldKey.value] = selectedItem;
    popup.close();
  };
};

const triggerFileInput = () => {
  fileInput.value.click();
};

const handleFilesChange = (event) => {
  const files = event.target.files;
  if (files && files.length > 0) {
    // 로컬 파일 추가 시, 어떤 데이터가 들어오는지 콘솔에 찍어봅니다.
    Array.from(files).forEach(file => {
      console.log('--- Local File Added ---');
      console.log('File Name:', file.name);
      console.log('File Size (bytes):', file.size);
      console.log('File Type:', file.type);
      console.log('------------------------');
    });
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
  console.log("수신자 이름:", form.value.email?.name);
  console.log("수신자 이메일:", form.value.email?.email);
  console.log("제목:", emailTitle.value);
  console.log("Quill Editor 내용 (HTML):", editorContent.value);
  console.log("첨부 파일들 (attachedFiles.value):", attachedFiles.value); // attachedFiles 전체 내용 확인
  console.log("-----------------------");

  if (!form.value.email?.email.trim()) {
    toast.error('수신자 이메일을 선택하거나 입력해주세요.');
    return;
  }
  if (!emailTitle.value.trim()) {
    toast.error('이메일 제목을 입력해주세요.');
    return;
  }
  if (isQuillContentEffectivelyEmpty(editorContent.value)) {
    toast.error('이메일 내용을 입력해주세요.');
    return;
  }

  // --- 여기부터 용량 경고 메시지 로직 ---
  const totalSize = getTotalFilesize();
  console.log('Calculated total file size (before threshold check):', totalSize, 'bytes'); // 최종 계산된 총 용량 확인
  console.log('Formatted total file size (before threshold check):', formatBytes(totalSize)); // 포맷된 용량 확인

  const SIZE_THRESHOLD_BYTES = 5 * 1024 * 1024; // 5MB
  console.log('Size threshold (5MB):', SIZE_THRESHOLD_BYTES, 'bytes'); // 임계값 확인

  if (totalSize > SIZE_THRESHOLD_BYTES) {
    console.log('Condition met: File size exceeds threshold. Displaying warning toast.'); // 조건 만족 시 메시지
    toast.info(
      `첨부 파일 총 용량(${formatBytes(totalSize)})이 커서 이메일 전송에 시간이 오래 걸릴 수 있습니다.`,
      { timeout: 5000 } // 5초 후 자동으로 사라지게
    );
  } else {
    console.log('Condition not met: File size is within threshold or no files attached. No warning toast.'); // 조건 불만족 시 메시지
  }
  // --- 용량 경고 메시지 로직 끝 ---

  isSending.value = true;
  const sendingToastId = toast.info('메일을 전송 중입니다...', { timeout: false, closeButton: false });

  let fileIdToSend = null;
  const localFilesToUpload = [];

  attachedFiles.value.forEach(file => {
    if (file.isS3File && file.fileId) {
      fileIdToSend = file.fileId;
    } else if (file instanceof File) {
      localFilesToUpload.push(file);
    }
  });

  const requestData = {
    content: editorContent.value,
    title: emailTitle.value,
    targetEmail: form.value.email.email,
    fileId: fileIdToSend,
  };

  try {
    const response = await sendContractEmail(requestData, localFilesToUpload);
    toast.dismiss(sendingToastId);

    if (response.success) {
      toast.success('이메일이 성공적으로 전송되었습니다.');
      emailTitle.value = '';
      editorContent.value = '';
      form.value.email = null;
      attachedFiles.value = [];
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    } else {
      toast.error(`이메일 전송 실패: ${response.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    toast.dismiss(sendingToastId);
    toast.error('이메일 전송 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    console.error('이메일 전송 API 호출 중 에러:', error);
  } finally {
    isSending.value = false;
  }
};
</script>

<style scoped>
</style>
