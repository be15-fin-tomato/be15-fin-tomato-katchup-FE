<script setup>
import { ref } from 'vue'


const props = defineProps({
  selectedBig: Object, // 큰 틀 선택된 값
  show: Boolean,       // 모달 표시 여부
})

const emit = defineEmits(['close', 'submit'])

const name = ref('')
const content = ref('')
const template = ref('')

function closeModal() {
  name.value = ''
  content.value = ''
  template.value = ''
  emit('close')
}

function submitTemplate() {
  console.log("dd")
  if (!name.value.trim()) {
    alert('이름을 입력해주세요.')
    return
  }
  emit('submit', {
    id: Date.now(),
    name: name.value,
    parentId: props.selectedBig?.id,
    template: template.value,
    content: content.value,
    createdAt: '2025-06-20',
    active: false
  })
  closeModal()
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
    <div class="bg-white w-[400px] rounded-lg shadow-lg p-6">
      <div class="font-bold text-lg mb-4">템플릿 등록</div>

      <!-- 큰 틀 (읽기전용) -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">종류</label>
        <input type="text" :value="selectedBig?.name" class="w-full border px-2 py-1 rounded text-sm bg-gray-100" disabled />
      </div>

      <!-- 이름 -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">이름</label>
        <input v-model="name" placeholder="이름 입력" class="w-full border px-2 py-1 rounded text-sm" />
      </div>

      <!-- 템플릿 유형 버튼 (임시버튼 예시용) -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">템플릿 유형</label>
        <input v-model="template" placeholder="템플릿 입력" class="w-[280px] border px-2 py-1 rounded text-sm mb-1" />
        <button class="px-4 py-1 rounded text-white bg-btn-blue text-sm mx-1.5">입력</button>
      </div>

      <!-- 내용 -->
      <div class="mb-6">
        <label class="block font-semibold mb-1">내용</label>
        <textarea v-model="content" placeholder="내용 입력" class="w-full border px-2 py-1 rounded text-sm h-24"></textarea>
      </div>

      <!-- 하단 버튼 -->
      <div class="flex justify-end gap-2">
        <button class="btn-delete" @click="closeModal">취소</button>
        <button class="btn-create" @click="submitTemplate">등록</button>
      </div>
    </div>
  </div>
</template>
