<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router';
import { registerFcmToken } from '@/features/user/api.js';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

import ChatFloatingButton from '@/components/common/ChatFloatingButton.vue'
import ChatListModal from '@/features/chat/components/ChatListModal.vue'
import ChatRoom from '@/features/chat/components/ChatRoom.vue'
import { fetchChatRoomList } from '@/features/chat/api'
import Header from '@/components/layout/Header.vue';

const route = useRoute();
const isNoLayout = computed(() => route.meta.useLayout === 'none');

const firebaseConfig = {
  apiKey: 'AIzaSyBOnX8kKdcvIdtdwJ2O4-mbQwxaQGuZtwA',
  authDomain: 'tomato-katchup.firebaseapp.com',
  projectId: 'tomato-katchup',
  messagingSenderId: '101664121020',
  appId: '1:101664121020:web:525beb263a7bbdbc7530b9',
};

const isChatListVisible = ref(false)
const selectedRoom = ref(null)
const chatRooms = ref([])

const totalUnreadMessages = computed(() => {
  return chatRooms.value.reduce((sum, room) => sum + (room.unreadCount || 0), 0)
})

const fetchInitialChatRooms = async () => {
  try {
    const res = await fetchChatRoomList()
    chatRooms.value = res.map(room => ({
      id: room.chatId,
      name: room.name,
      members: room.participants?.length ?? 0,
      participants: room.participants || [],
      lastMessage: room.lastMessage ?? '',
      time: formatTime(room.lastSentAt),
      unreadCount: room.unreadCount ?? 0
    }))
  } catch (e) {
    console.error('초기 채팅방 목록 불러오기 실패', e)
  }
}

const formatTime = (timestamp) => {
  if (!timestamp) return ''
  const date = new Date(timestamp)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const handleRoomOpened = (chatId) => {
  const roomIndex = chatRooms.value.findIndex(room => room.id === chatId);
  if (roomIndex !== -1) {
    chatRooms.value[roomIndex].unreadCount = 0;
  }
}

const handleChatRoomsUpdated = async () => {
  await fetchInitialChatRooms();
}

const openChatRoom = (room) => {
  selectedRoom.value = room
  isChatListVisible.value = false
}

onMounted(async () => {
  console.log('✅ App.vue mounted');

  // 서비스워커 등록
  if ('serviceWorker' in navigator) {
    try {
      const swReg = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
      console.log('✅ 서비스워커 등록 성공:', swReg);
    } catch (err) {
      console.error('❌ 서비스워커 등록 실패:', err);
    }
  }

  // 알림 권한 요청
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('🚫 알림 권한 거부됨');
      }
    }
  }

  // Firebase 초기화 및 토큰 요청
  try {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const swReg = await navigator.serviceWorker.getRegistration();
    const token = await getToken(messaging, {
      vapidKey:
        'BMMLYnvnj3Oy3KwROAo87cxni1ViBbTQZoyBn3roEbEDh7nEWQ1cteqhlBPv_X6vYCRTIia3S4Q4S5YMamfnz9M',
      serviceWorkerRegistration: swReg || undefined,
    });

    if (token) {
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

  await fetchInitialChatRooms();
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

  <ChatFloatingButton
    @toggle="isChatListVisible = !isChatListVisible"
    :unreadCount="totalUnreadMessages"
  />

  <ChatListModal
    v-if="isChatListVisible"
    :chatRooms="chatRooms"
    @close="isChatListVisible = false"
    @open-room="openChatRoom"
    @room-opened="handleRoomOpened"
    @chat-rooms-changed="handleChatRoomsUpdated"
  />

  <ChatRoom
    v-if="selectedRoom"
    :room="selectedRoom"
    @close="selectedRoom = null"
  />
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
* {
  font-family: 'Pretendard Variable', sans-serif;
}
</style>
