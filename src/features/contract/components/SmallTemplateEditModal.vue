<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  show: Boolean,
  item: Object // 수정 대상 작은 틀 항목
})

const emit = defineEmits(['close', 'submit'])

const name = ref('')
const content = ref('')

const templateFile = ref('')
const parentName = ref('')

const attachedFile = ref(null)

const fileInput = ref(null)

watch(() => props.item, (val) => {
  if (val) {
    name.value = val.name || ''
    content.value = val.content || ''
    // 기존 파일이 있다면 파일 이름 표시
    templateFile.value = val.file?.originalName || ''
    parentName.value = val.parentName || ''
    attachedFile.value = null
  }
}, { immediate: true })

function closeModal() {
  name.value = ''
  content.value = ''
  templateFile.value = ''
  parentName.value = ''
  attachedFile.value = null
  emit('close')
}

function triggerFileInput() {
  fileInput.value.click()
}

// 파일 선택 시 호출되는 핸들러
function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    attachedFile.value = file
    templateFile.value = file.name
  } else {
    attachedFile.value = null
    templateFile.value = props.item.file?.originalName || ''
  }
}

async function updateTemplate() {
  if (!name.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }
  if (!content.value.trim()) {
    alert('내용을 입력해주세요.')
    return
  }

  const requestData = {
    subTitle: name.value,
    content: content.value,
  };

  emit('submit', {
    detailId: props.item.id,
    requestData: requestData,
    file: attachedFile.value
  })
  closeModal()
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
    <div class="bg-white w-[400px] rounded-lg shadow-lg p-6">
      <div class="font-bold text-lg mb-4">목록 수정</div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">종류</label>
        <input type="text" :value="parentName" disabled class="w-full border px-2 py-1 rounded text-sm bg-gray-100" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">이름</label>
        <input v-model="name" placeholder="이름 입력" class="w-full border px-2 py-1 rounded text-sm" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">템플릿 유형</label>
        <div class="flex items-center gap-2">
          <input
            v-model="templateFile"
            placeholder="파일을 선택하세요."
            class="w-[280px] border px-2 py-1 rounded text-sm bg-gray-50"
            readonly
          />

          <button class="px-4 py-1 rounded text-white bg-blue-500 hover:bg-blue-600 text-sm" @click="triggerFileInput">
            입력
          </button>
          <!-- 실제 파일 입력 필드 (숨김) -->
          <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" />
        </div>
        <div v-if="props.item.file && !attachedFile" class="mt-2 text-xs text-gray-600">
          기존 파일: {{ props.item.file.originalName }}
        </div>
        <div v-else-if="attachedFile" class="mt-2 text-xs text-gray-600">
          새 파일: {{ attachedFile.name }}
        </div>
      </div>

      <div class="mb-6">
        <label class="block font-semibold mb-1">내용</label>
        <textarea v-model="content" placeholder="내용 입력" class="w-full border px-2 py-1 rounded text-sm h-24"></textarea>
      </div>

      <div class="flex justify-end gap-2">
        <button class="btn-delete" @click="closeModal">취소</button>
        <button class="btn-create" @click="updateTemplate">등록</button>
      </div>
    </div>
  </div>
</template>
