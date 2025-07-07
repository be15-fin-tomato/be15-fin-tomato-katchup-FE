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
  initialFile: Object, // 새로 추가된 prop: selectedSmall.file (파일 메타데이터 객체)
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

// props.title (selectedSmall)이 변경될 때마다 이메일 제목을 업데이트
watch(() => props.title, (newTitle) => {
  if (newTitle && newTitle.name) {
    title.value = `[계약서] ${newTitle.name}`; // 이메일 제목에 계약서명 반영
  } else {
    title.value = '';
  }
}, { immediate: true });

// props.initialContent가 변경될 때마다 QuillEditor 내용을 업데이트
watch(() => props.initialContent, (newContent) => {
  editorContent.value = newContent || '';
}, { immediate: true });

// props.initialFile이 변경될 때마다 attachedFile을 업데이트
watch(() => props.initialFile, (newFile) => {
  if (newFile) {
    // initialFile은 File 객체가 아닌 파일 메타데이터 객체일 가능성이 높습니다.
    // UI에 표시하기 위해 그대로 할당합니다.
    attachedFile.value = newFile;
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
    attachedFile.value = file; // 사용자가 새로 파일을 선택하면 실제 File 객체로 업데이트
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

const sendEmail = async () => {
  if (!form.value.email?.email.trim()) {
    alert('수신자 이메일을 선택하거나 입력해주세요.');
    return;
  }
  if (!title.value.trim()) {
    alert('이메일 제목을 입력해주세요.');
    return;
  }
  if (!editorContent.value.trim()) {
    alert('이메일 내용을 입력해주세요.');
    return;
  }

  const requestData = {
    content: editorContent.value,
    title: title.value,
    targetEmail: form.value.email.email,
  };

  // attachedFile.value가 실제 File 객체인지 확인하여 API에 전달
  // 만약 initialFile로 받은 메타데이터 객체라면 전송하지 않도록 합니다.
  const fileToUpload = attachedFile.value instanceof File ? attachedFile.value : null;

  try {
    const response = await sendContractEmail(requestData, fileToUpload);
    if (response.success) {
      alert('이메일이 성공적으로 전송되었습니다.');
      // 전송 후 필드 초기화
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
      >
        검색
      </button>
    </div>

    <div class="mb-4 flex items-start gap-2">
      <label class="w-[75px] font-semibold">제목</label>
      <input type="text" v-model="title" class="input-form-box flex-1 border-gray-dark" />
    </div>

    <div class="mb-4 flex items-start gap-2">
      <label class="w-[75px] font-semibold pt-2">내용</label>
      <div class="flex-1">
        <QuillEditor v-model:content="editorContent" />

        <div class="flex items-center gap-2 mt-4">
          <button
            @click="triggerFileInput"
            type="button"
            class="px-3 py-2 rounded-md bg-gray-100 text-gray-700 text-sm hover:bg-gray-200"
          >
            <Icon icon="codex:file" class="inline-block mr-1" /> 파일 첨부
          </button>
          <input
            type="file"
            ref="fileInput"
            class="hidden"
            @change="handleFileChange"
            accept="*/*"
          />

          <span v-if="attachedFile" class="text-gray-700 text-sm">
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
