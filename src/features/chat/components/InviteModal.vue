<template>
  <div
    class="absolute top-12 right-4 w-[300px] bg-white shadow-lg rounded-xl border border-gray-200 z-50 p-4 font-[Pretendard]"
  >
    <!-- 타이틀 -->
    <h3 class="text-sm font-semibold mb-3 text-gray-700">참여자 초대</h3>

    <!-- 검색창 -->
    <input
      type="text"
      v-model="search"
      placeholder="이름 검색"
      class="w-full px-3 py-2 text-sm border border-gray-300 rounded-md mb-3 focus:ring-1 focus:ring-blue-400 focus:outline-none"
    />

    <!-- 유저 리스트 -->
    <div class="max-h-48 overflow-y-auto space-y-2 pr-1">
      <div
        v-for="user in filteredUsers"
        :key="user.id"
        class="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-gray-50 text-sm text-gray-800"
      >
        <input
          type="checkbox"
          v-model="selectedIds"
          :value="user.id"
          class="form-checkbox rounded text-blue-500"
        />
        <span>{{ user.name }}</span>
      </div>
    </div>

    <!-- 하단 버튼 -->
    <div class="flex justify-between items-center mt-4">
      <button @click="close" class="text-sm text-gray-400 hover:text-gray-600">닫기</button>
      <button
        @click="invite"
        :disabled="selectedIds.length === 0"
        class="text-sm px-4 py-1 rounded-md text-white bg-blue-500 hover:brightness-110 disabled:opacity-40"
      >
        {{ selectedIds.length }}명 초대
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  users: {
    type: Array,
    default: () => []
  },
  excludedIds: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['invite', 'close'])

const search = ref('')
const selectedIds = ref([])

// 이미 초대된 사람 제외 + 검색
const filteredUsers = computed(() => {
  const rawList = props.users || []
  const excluded = props.excludedIds || []


  const filtered = rawList
    .filter(user => !excluded.includes(user.id))
    .filter(user => user.name.toLowerCase().includes(search.value.toLowerCase()))

  return filtered
})


const reset = () => {
  selectedIds.value = []
  search.value = ''
}

const invite = () => {
  emit('invite', selectedIds.value)
  reset()
}

const close = () => {
  emit('close')
  reset()
}
</script>
