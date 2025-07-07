<script setup>
import { ref } from 'vue'


const props = defineProps({
  selectedBig: Object,
  show: Boolean,
})

const emit = defineEmits(['close', 'submit'])

const name = ref('')
const content = ref('')

const template = ref('')

const attachedFile = ref(null)

const fileInput = ref(null)

function closeModal() {
  name.value = ''
  content.value = ''
  template.value = '' // 파일 이름 표시 필드 초기화
  attachedFile.value = null // 첨부 파일 객체 초기화
  emit('close')
}

function triggerFileInput() {
  fileInput.value.click()
}

function handleFileChange(event) {
  const file = event.target.files[0]
  if (file) {
    attachedFile.value = file
    template.value = file.name
  } else {
    attachedFile.value = null
    template.value = ''
  }
}

function submitTemplate() {
  if (!name.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }
  if (!content.value.trim()) {
    alert('내용을 입력해주세요.')
    return
  }

  emit('submit', {
    name: name.value,
    content: content.value,
    file: attachedFile.value
  })
  closeModal()
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
    <div class="bg-white w-[400px] rounded-lg shadow-lg p-6">
      <div class="font-bold text-lg mb-4">템플릿 등록</div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">종류</label>
        <input type="text" :value="selectedBig?.name" class="w-full border px-2 py-1 rounded text-sm bg-gray-100" disabled />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">이름</label>
        <input v-model="name" placeholder="이름 입력" class="w-full border px-2 py-1 rounded text-sm" />
      </div>

      <div class="mb-4">
        <label class="block font-semibold mb-1">템플릿 유형</label>
        <div class="flex items-center gap-2">
          <input
            v-model="template"
            placeholder="파일을 선택하세요."
            class="w-[280px] border px-2 py-1 rounded text-sm bg-gray-50"
            readonly
          />
          <button class="px-4 py-1 rounded text-white bg-blue-500 hover:bg-blue-600 text-sm" @click="triggerFileInput">
            입력
          </button>
          <input type="file" ref="fileInput" class="hidden" @change="handleFileChange" />
        </div>
      </div>

      <div class="mb-6">
        <label class="block font-semibold mb-1">내용</label>
        <textarea v-model="content" placeholder="내용 입력" class="w-full border px-2 py-1 rounded text-sm h-24"></textarea>
      </div>

      <div class="flex justify-end gap-2">
        <button class="btn-delete" @click="closeModal">취소</button>
        <button class="btn-create" @click="submitTemplate">등록</button>
      </div>
    </div>
  </div>
</template>
