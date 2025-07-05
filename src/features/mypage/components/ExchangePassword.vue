<template>
  <div class="fixed inset-0 z-50 bg-black/50 flex justify-center items-center">
    <div class="bg-white w-full max-w-[500px] rounded-[12px] p-6">
      <h2 class="text-xl font-bold mb-6">비밀번호 변경</h2>

      <!-- 현재 비밀번호 -->
      <div class="mb-4">
        <label class="block text-sm text-gray-500 mb-1">현재 비밀번호</label>
        <input
          type="password"
          v-model="form.current"
          class="w-full border border-[#EAEAEA] rounded px-3 py-2"
        />
        <p v-if="!valid.current" class="text-xs text-red-500 mt-1">
          현재 비밀번호가 일치하지 않습니다.
        </p>
      </div> <br>

      <!-- 새 비밀번호 -->
      <div class="mb-4">
        <label class="block text-sm text-gray-500 mb-1">새 비밀번호</label>
        <input type="password" v-model="form.new" class="w-full border border-[#EAEAEA] rounded px-3 py-2" />
      </div>

      <!-- 새 비밀번호 확인 -->
      <div class="mb-6">
        <label class="block text-sm text-gray-500 mb-1">새 비밀번호 확인</label>
        <input
          type="password"
          v-model="form.confirm"
          class="w-full border border-[#EAEAEA] rounded px-3 py-2"
        />
        <p
          v-if="form.new && form.confirm"
          :class="['text-xs mt-1',form.new === form.confirm ? 'text-blue-500' : 'text-red-500']"
        >
          {{ form.new === form.confirm ? '비밀번호가 일치합니다.' : '비밀번호가 일치하지 않습니다.' }}
        </p>
      </div>

      <div class="flex justify-end gap-3">
        <button class="btn-delete" @click="$emit('close')">
          취소
        </button>
        <button class="btn-create" @click="handleSubmit">
          변경
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'
import { reactive } from 'vue'
import { changePassword } from '@/features/mypage/api.js';

const toast = useToast()
const emit = defineEmits(['close'])

const form = reactive({
  current: '',
  new: '',
  confirm: ''
})

const valid = reactive({
  current: true
})

const handleSubmit = async () => {
  try {
    await changePassword(form)
    toast.success("비밀번호가 성공적으로 변경되었습니다.")
    emit('close')
  } catch (error) {
    const response = error.response?.data
    const message = response?.message || '비밀번호 변경 중 오류가 발생했습니다.'
    toast.error(message)

    if (response?.errorCode === 'PASSWORD_MISMATCH') {
      valid.current = false
    } else {
      valid.current = true
    }
  }
}
</script>


