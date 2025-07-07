<script setup>
import { ref, watch } from 'vue';
import QuillEditor from '@/components/common/QuillEditor.vue';
import { Icon } from '@iconify/vue';
import { sendContractEmail } from '@/features/contract/api.js';

const props = defineProps({
  name: String,
  email: String,
  title: Object, // selectedSmall 객체 전체
  initialContent: String,
  initialFile: Object, // 첨부 파일 메타데이터 객체 (fileUrl 또는 filePath 포함 가정)
});

const editorContent = ref('');
const title = ref('');

const name = ref('');
const email = ref('');

const currentFieldKey = ref('');
const form = ref({
  email: null,
});

const attachedFile = ref(null); // 실제 File 객체 또는 파일 메타데이터 객체
const fileInput = ref(null);
const loadingFile = ref(false); // 파일 다운로드 로딩 상태

// props.name이 변경될 때마다 로컬 name ref 업데이트
watch(() => props.name, (newName) => {
  name.value = newName || '';
}, { immediate: true });

// props.email이 변경될 때마다 로컬 email ref 업데이트
watch(() => props.email, (newEmail) => {
  email.value = newEmail || '';
  if (newEmail) {
    form.value.email = { email: newEmail };
  } else {
    form.value.email = null;
  }
}, { immediate: true });

// props.title (selectedSmall)이 변경될 때마다 이메일 제목을 업데이트
watch(() => props.title, (newTitle) => {
  if (newTitle && newTitle.name) {
    title.value = `[계약서] ${newTitle.name}`;
  } else {
    title.value = '';
  }
}, { immediate: true });

// props.initialContent가 변경될 때마다 QuillEditor 내용을 업데이트
watch(() => props.initialContent, (newContent) => {
  editorContent.value = newContent || '';
}, { immediate: true });

// props.initialFile이 변경될 때마다 해당 파일을 다운로드하여 attachedFile에 할당
watch(() => props.initialFile, async (newFile) => {
  if (newFile && (newFile.fileUrl || newFile.filePath)) { // fileUrl 또는 filePath가 있는지 확인
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

      attachedFile.value = new File([blob], newFile.originalName, { type: mimeType });
      console.log('첨부 파일 성공적으로 로드:', attachedFile.value);

    } catch (error) {
      console.error('템플릿 첨부 파일 로드 중 오류 발생:', error);
      alert('템플릿 첨부 파일을 불러오는 데 실패했습니다. 파일을 다시 첨부하거나 직접 선택해주세요.');
      attachedFile.value = null;
    } finally {
      loadingFile.value = false;
    }
  } else {
    attachedFile.value = null;
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

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    attachedFile.value = file;
  } else {
    attachedFile.value = null;
  }
};

const removeAttachedFile = () => {
  attachedFile.value = null;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

// Quill 에디터 내용이 비어있는지 확인하는 헬퍼 함수
const isQuillContentEffectivelyEmpty = (htmlContent) => {
  if (!htmlContent) return true;

  const textContent = htmlContent.replace(/<[^>]*>/g, '').trim();
  if (textContent.length > 0) return false;

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlContent;
  const hasMeaningfulEmbeds = tempDiv.querySelector('img, a[href]');

  return !hasMeaningfulEmbeds;
};

// editorContent의 변화를 감지하는 watch 추가 (디버깅용)
watch(editorContent, (newValue) => {
  console.log('editorContent changed in SendEmail.vue:', newValue);
});


const sendEmail = async () => {
  console.log("--- 전송 버튼 클릭됨 ---");
  console.log("수신자 이메일:", form.value.email?.email);
  console.log("제목:", title.value);
  console.log("Quill Editor 내용 (HTML):", editorContent.value); // 이 값을 확인해주세요.
  console.log("첨부 파일:", attachedFile.value); // 이 값을 확인해주세요.
  console.log("-----------------------");


  if (!form.value.email?.email.trim()) {
    alert('수신자 이메일을 선택하거나 입력해주세요.');
    return;
  }
  if (!title.value.trim()) {
    alert('이메일 제목을 입력해주세요.');
    return;
  }

  // Quill 에디터 내용 유효성 검사 강화
  if (isQuillContentEffectivelyEmpty(editorContent.value)) {
    alert('이메일 내용을 입력해주세요.');
    return;
  }

  const requestData = {
    content: editorContent.value,
    title: title.value,
    targetEmail: form.value.email.email,
  };

  const fileToUpload = attachedFile.value instanceof File ? attachedFile.value : null;

  try {
    const response = await sendContractEmail(requestData, fileToUpload);
    if (response.success) {
      alert('이메일이 성공적으로 전송되었습니다.');
      name.value = '';
      email.value = '';
      title.value = '';
      editorContent.value = '';
      form.value.email = null;
      attachedFile.value = null;
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    } else {
      alert(`이메일 전송 실패: ${response.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    alert('이메일 전송 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    console.error('이메일 전송 API 호출 중 에러:', error);
  }
};
</script>

<template>
  <div class="border border-gray-dark rounded-lg bg-white p-6 mt-6">
    <h3 class="font-bold text-lg mb-4">이메일 전송</h3>

    <!-- 이름 -->
    <div class="mb-4 flex items-center gap-2">
      <label class="w-[76px] font-semibold">이름</label>
      <input
        type="text"
        :value="name"
        disabled
        class="border px-2 py-1 rounded w-[10%] bg-gray-100 border-gray-dark"
      />
    </div>

    <!-- 이메일 -->
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
      >
        검색
      </button>
    </div>

    <!-- 제목 -->
    <div class="mb-4 flex items-start gap-2">
      <label class="w-[75px] font-semibold">제목</label>
      <input type="text" v-model="title" class="input-form-box flex-1 border-gray-dark" />
    </div>

    <!-- 내용 (QuillEditor) -->
    <div class="mb-4 flex items-start gap-2">
      <label class="w-[75px] font-semibold pt-2">내용</label>
      <div class="flex-1">
        <!-- QuillEditor 바인딩 방식 변경 -->
        <QuillEditor
          :content="editorContent"
          @update:content="editorContent = $event"
        />

        <!-- 파일 첨부 섹션 -->
        <div class="flex items-center gap-2 mt-4">
          <button
            @click="triggerFileInput"
            type="button"
            class="px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            <Icon icon="codex:file" class="inline-block mr-1" /> 파일 첨부
          </button>
          <!-- 실제 파일 입력 필드 (숨김) -->
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="handleFileChange"
            accept="*/*"
          />

          <!-- 첨부된 파일 이름 표시 및 삭제 버튼 -->
          <span v-if="loadingFile" class="text-gray-500 text-sm">첨부파일 로드 중...</span>
          <span v-else-if="attachedFile" class="text-gray-700 text-sm">
                        <!-- initialFile이 File 객체가 아닐 경우 originalName을 사용 -->
                        {{ attachedFile.name || attachedFile.originalName }}
                        <button @click="removeAttachedFile" class="text-xs text-red-500 ml-1 hover:underline">삭제</button>
                    </span>
          <span v-else class="text-gray-500 text-sm">첨부된 파일 없음</span>
        </div>

        <div class="flex justify-end mt-4">
          <button class="btn-create" @click="sendEmail">전송</button>
        </div>
      </div>
    </div>
  </div>
</template>
