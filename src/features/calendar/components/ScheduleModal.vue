<script setup>
import { ref, watch, computed, nextTick } from 'vue'
import { useToast } from 'vue-toastification';

const props = defineProps({
  date: String,
  eventData: Object
})

const emit = defineEmits(['close', 'save'])
const toast = useToast();
const content = ref('')
const startTime = ref('')
const endTime = ref('')
const backgroundColor = ref('#f87171')

const isEditMode = computed(() => !!props.eventData)

const colors = [
  '#f87171', '#f97316', '#facc15', '#4ade80', '#22d3ee',
  '#60a5fa', '#6366f1', '#a855f7', '#00FBFF'
]

watch(
  () => props.eventData,
  async (event) => {
    if (event) {
        content.value = event.content
      startTime.value = event.start.slice(11, 16)
      endTime.value = event.end.slice(11, 16)
      backgroundColor.value = ''
      await nextTick()
      backgroundColor.value = event.backgroundColor || '#f87171'
    } else {
        content.value = ''
      startTime.value = ''
      endTime.value = ''
      backgroundColor.value = '#f87171'
    }
  },
  { immediate: true }
)

function submit() {
    if (!content.value.trim()) {
        alert('일정을 입력해주세요.')
        return
    }

    if (startTime.value >= endTime.value) {
    alert('시작 시간은 종료 시간보다 빠르거나 같을 수 없습니다.')
    return
  }

  emit('save', {
      content: content.value,
    start: `${props.date}T${startTime.value}`,
    end: `${props.date}T${endTime.value}`,
    backgroundColor: backgroundColor.value
  })
  toast.success(`반영되었습니다.`)
  emit('close')
}
</script>

<template>
  <div class="fixed inset-0 bg-[rgba(0,0,0,0.3)] flex items-center justify-center z-50">
    <div class="bg-white rounded-xl w-[450px] p-6 shadow-lg">
      <h2 class="text-center text-xl font-bold mb-4">{{ isEditMode ? '일정 수정' : '일정 등록' }}</h2>

      <div class="space-y-4">
        <!-- 날짜 -->
        <div class="flex items-center gap-2">
          <label class="w-20 bg-btn-blue text-white text-sm font-semibold px-2 py-1 rounded text-center">날짜</label>
          <input type="text" :value="date" class="flex-1 border px-2 py-1 rounded bg-gray-100" disabled />
        </div>

        <!-- 제목 -->
        <div class="flex items-center gap-2">
          <label class="w-20 bg-btn-blue text-white text-sm font-semibold px-2 py-1 rounded text-center">일정</label>
          <input type="text" v-model="content" placeholder="일정을 입력하세요" class="flex-1 border px-2 py-1 rounded" />
        </div>

        <!-- 시간 -->
        <div class="flex items-center gap-2">
          <label class="w-20 bg-btn-blue text-white text-sm font-semibold px-2 py-1 rounded text-center">시간</label>
          <input type="time" v-model="startTime" class="border px-2 py-1 rounded w-35" />
          <span class="mx-2">~</span>
          <input type="time" v-model="endTime" class="border px-2 py-1 rounded w-35" />
        </div>

        <!-- 색상 -->
        <div class="flex items-center gap-2">
          <label class="w-20 bg-btn-blue text-white text-sm font-semibold px-2 py-1 rounded text-center">라벨</label>
          <div class="flex-1 flex gap-2 py-1 px-2">
            <div
              v-for="color in colors"
              :key="color"
              :style="{ backgroundColor: color }"
              class="w-5 h-5 rounded-full cursor-pointer border-2"
              :class="color === backgroundColor ? 'border-black' : 'border-transparent'"
              @click="backgroundColor = color"
            ></div>
          </div>
        </div>
      </div>

      <!-- 버튼 -->
      <div class="flex justify-end gap-2 mt-6">
        <button @click="$emit('close')" class="btn-delete">취소</button>
        <button @click="submit" class="btn-create">{{ isEditMode ? '수정' : '등록' }}</button>
      </div>
    </div>
  </div>
</template>
