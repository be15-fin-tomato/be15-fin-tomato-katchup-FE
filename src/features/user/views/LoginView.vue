<script setup>

import { useRoute } from 'vue-router'
import { useToast } from 'vue-toastification'
import MainLogo from '@/features/user/components/MainLogo.vue'
import { ref } from 'vue'

const router = useRoute();
const toast = useToast();

const emp_number = ref('');
const password = ref('');

</script>

<template>
  <div class = "login-layout">
  <MainLogo />

    <div class = "card-style">
      <div class="title text-center mb-8">
        <h1 class="text-[40px] font-semibold mb-4">로그인</h1>
      </div>

      <form class="login-form flex flex-col" @submit.prevent="handleLogin">
        <label class="input-box-label text-click text-md py-1">사원코드</label>
        <input v-model="emp_number" type="text" class="border border-[#D9D9D9] rounded-[10px] px-6 py-6" />


        <label class="input-box-label text-click text-md pt-5 pb-1">비밀번호</label>
        <input v-model="password" type="password" class="border border-[#D9D9D9] rounded-[10px] px-6 py-6" />


        <div class="flex justify-between mt-2 text-[1rem] pt-5 pb-1 text-gray-medium">
          <RouterLink to="findPassword">비밀번호 찾기</RouterLink>
        </div>
        <button class="bg-[#A8C1DA] text-white px-60 py-4 text-md rounded">
          <RouterLink to = "/">로그인</RouterLink>
        </button>
      </form>

    </div>
  </div>
</template>

<style scoped>
.login-layout {
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;

  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
}
</style>
