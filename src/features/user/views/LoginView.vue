<script setup>
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import MainLogo from '@/features/user/components/MainLogo.vue';
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { login } from '../api';
import { setAccessTokenToCookie } from '@/utils/token.js';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const emp_number = ref('');
const password = ref('');
const isLoading = ref(false);

const handleLogin = async () => {
  if (!emp_number.value || !password.value) {
    toast.error('사원코드와 비밀번호를 입력해주세요.');
    return;
  }

  isLoading.value = true;

  try {
    const res = await login({ loginId: emp_number.value, password: password.value });
    const at = res.data.data.accessToken;
    authStore.setAccessToken(at);
    setAccessTokenToCookie(at);

    toast.success('로그인 되었습니다.');
    router.push('/');
  } catch (error) {
    const res = error.response?.data;
    const message = res?.message || '로그인 중 오류가 발생했습니다.';
    toast.error(message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
    <div class="login-layout bg-[#f5f7fa]">
        <MainLogo />

        <div class="card-style">
            <div class="title text-center mb-8">
                <h1 class="text-[36px] font-bold mb-3">로그인</h1>
            </div>

            <form class="login-form flex flex-col" @submit.prevent="handleLogin">
                <label class="input-box-label text-click text-md py-1">사원코드</label>
                <input
                    v-model="emp_number"
                    type="text"
                    class="border border-[#D9D9D9] rounded-[10px] px-5 py-3 w-full"
                />

                <label class="input-box-label text-click text-md pt-5.5 pb-1">비밀번호</label>
                <input
                    v-model="password"
                    type="password"
                    class="border border-[#D9D9D9] rounded-[10px] px-5 py-3 w-full"
                />

                <div class="flex justify-between mt-2 text-[1rem] pt-0.5 pb-5.5 text-gray-medium">
                    <RouterLink
                        to="findPassword"
                        class="ml-81.5 pb-1 text-[0.9rem] text-gray-400 whitespace-nowrap hover:underline"
                    >
                        비밀번호 찾기
                    </RouterLink>
                </div>
              <button
                type="submit"
                :disabled="isLoading"
                class="bg-[#A8C1DA] text-white px-5 py-3 mb-5 text-md rounded w-full transition-opacity duration-200"
                :class="{ 'opacity-50 cursor-not-allowed': isLoading }"
              >
                {{ isLoading ? '로그인 중...' : '로그인' }}
              </button>
            </form>
        </div>
    </div>
</template>

<style scoped>
.login-layout {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
}
</style>
