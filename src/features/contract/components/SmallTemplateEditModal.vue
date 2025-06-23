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

watch(() => props.item, (val) => {
  if (val) {
    name.value = val.name || ''
    content.value = val.content || ''
    templateFile.value = val.template || val.templateFile || ''
    parentName.value = val.parentName || ''
  }
}, { immediate: true })

function closeModal() {
  emit('close')
}

function updateTemplate() {
  if (!name.value.trim()) return alert('이름을 입력해주세요.')
  emit('submit', {
    ...props.item,
    name: name.value,
    content: content.value,
    template: templateFile.value,
    parentName: parentName.value
  })
  closeModal()
}
</script>

<template>
  <div v-if="show" class="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
    <div class="bg-white w-[400px] rounded-lg shadow-lg p-6">
      <div class="font-bold text-lg mb-4">목록 수정</div>

      <!-- 큰 틀 (읽기전용) -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">종류</label>
        <input type="text" :value="parentName" disabled class="w-full border px-2 py-1 rounded text-sm bg-gray-100" />
      </div>

      <!-- 이름 -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">이름</label>
        <input v-model="name" placeholder="이름 입력" class="w-full border px-2 py-1 rounded text-sm" />
      </div>

      <!-- 템플릿 -->
      <div class="mb-4">
        <label class="block font-semibold mb-1">템플릿 유형</label>
        <input v-model="templateFile" placeholder="템플릿 입력" class="w-[280px] border px-2 py-1 rounded text-sm mb-1" />
        <button class="px-4 py-1 rounded text-white bg-btn-blue text-sm mx-1.5">입력</button>
      </div>

      <!-- 내용 -->
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
