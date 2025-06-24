<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  scoreList: Array,
  totalScore: Number,
  comment: String,
})

const emit = defineEmits(['close'])
</script>

<template>
  <div class="fixed inset-0 bg-black/50 bg-opacity-30 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg shadow-lg w-[700px] max-h-[90vh] overflow-y-auto p-6">
      <h2 class="text-xl font-bold text-center mb-4">만족도 조사 항목 별 점수</h2>

      <table class="w-full border border-gray-300 text-sm mb-6">
        <thead class="bg-gray-100">
        <tr>
          <th class="border px-4 py-2 text-center">질문</th>
          <th class="border px-4 py-2 text-center">점수</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, index) in scoreList" :key="index">
          <td class="border px-4 py-2">{{ item.question }}</td>
          <td class="border px-4 py-2 text-center">{{ item.score }}</td>
        </tr>
        <tr class="font-semibold bg-gray-50">
          <td class="border px-4 py-2 text-center">총점</td>
          <td class="border px-4 py-2 text-center">{{ totalScore }}</td>
        </tr>
        </tbody>
      </table>

      <div class="mb-4">
        <label class="block mb-2 text-sm font-medium ">자유로운 한마디</label>
        <textarea
          class="w-full border rounded p-2 min-h-[100px] text-sm"
          :value="comment"
          readonly
        />
      </div>

      <div class="text-right">
        <button
          @click="emit('close')"
          class="btn-create"
        >
          확인
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
