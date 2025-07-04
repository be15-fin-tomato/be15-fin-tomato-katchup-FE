<script setup>
import Header from '@/components/layout/Header.vue';
import { useRoute } from 'vue-router';
import { computed, onMounted } from 'vue';
import { registerFcmToken } from '@/features/user/api.js';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const route = useRoute();
const isNoLayout = computed(() => route.meta.useLayout === 'none');

const firebaseConfig = {
  apiKey: 'AIzaSyBOnX8kKdcvIdtdwJ2O4-mbQwxaQGuZtwA',
  authDomain: 'tomato-katchup.firebaseapp.com',
  projectId: 'tomato-katchup',
  messagingSenderId: '101664121020',
  appId: '1:101664121020:web:525beb263a7bbdbc7530b9',
};

onMounted(async () => {
  console.log('✅ App.vue mounted');

  // 서비스워커 등록
  if ('serviceWorker' in navigator) {
    try {
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ 서비스워커 등록 성공:', swReg);
    } catch (err) {
      console.error('❌ 서비스워커 등록 실패:', err);
      return;
    }
  }

  // 알림 권한 요청
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('🚫 알림 권한 거부됨');
        return;
      }
    }
  }

  // Firebase 초기화 및 토큰 요청
  try {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const swReg = await navigator.serviceWorker.getRegistration();
    const token = await getToken(messaging, {
      vapidKey: 'BMMLYnvnj3Oy3KwROAo87cxni1ViBbTQZoyBn3roEbEDh7nEWQ1cteqhlBPv_X6vYCRTIia3S4Q4S5YMamfnz9M',
      serviceWorkerRegistration: swReg,
    });

    if (token) {
      console.log('✅ FCM 토큰:', token);
      await registerFcmToken(token);
      console.log('🚀 FCM 토큰 서버 전송 완료');
    } else {
      console.warn('⚠️ FCM 토큰 없음');
    }

    // 포그라운드 알림 수신 및 직접 Notification 표시
    onMessage(messaging, (payload) => {
      console.log('📨 [포그라운드] 메시지 수신:', payload);

      if (Notification.permission === 'granted' && payload.notification) {
        const { title, body } = payload.notification;
        new Notification(title, {
          body,
          icon: '/tomato.png',
        });
      }
    });

  } catch (err) {
    console.error('🔥 FCM 초기화 또는 토큰 요청 오류:', err);
  }
});
</script>

<template>
  <div v-if="isNoLayout">
    <router-view />
  </div>
  <div v-else class="w-full min-h-screen bg-background flex flex-col font-sans">
    <Header />
    <div class="flex flex-1 flex-col p-16 mt-10">
      <router-view class="flex-1 w-full" />
    </div>
  </div>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
* {
  font-family: 'Pretendard Variable', sans-serif;
}
</style>
