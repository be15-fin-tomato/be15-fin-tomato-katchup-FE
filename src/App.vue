<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute } from 'vue-router';
import { registerFcmToken } from '@/features/user/api.js';
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

import ChatFloatingButton from '@/components/common/ChatFloatingButton.vue';
import ChatListModal from '@/features/chat/components/ChatListModal.vue';
import ChatRoom from '@/features/chat/components/ChatRoom.vue';
import { fetchChatRoomList } from '@/features/chat/api';
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

const isChatListVisible = ref(false);
const selectedRoom = ref(null);
const chatRooms = ref([]);

const totalUnreadMessages = computed(() => {
    return chatRooms.value.reduce((sum, room) => sum + (room.unreadCount || 0), 0);
});

const fetchInitialChatRooms = async () => {
    try {
        const res = await fetchChatRoomList();
        chatRooms.value = res.map((room) => ({
            id: room.chatId,
            name: room.name,
            members: room.participants?.length ?? 0,
            participants: room.participants || [],
            lastMessage: room.lastMessage ?? '',
            time: formatTime(room.lastSentAt),
            unreadCount: room.unreadCount ?? 0,
        }));
    } catch (e) {
        console.error('초기 채팅방 목록 불러오기 실패', e);
    }
};

const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const handleRoomOpened = (chatId) => {
    const roomIndex = chatRooms.value.findIndex((room) => room.id === chatId);
    if (roomIndex !== -1) {
        chatRooms.value[roomIndex].unreadCount = 0;
    }
};

const handleChatRoomsUpdated = async () => {
    await fetchInitialChatRooms();
};

const openChatRoom = (room) => {
    selectedRoom.value = room;
    isChatListVisible.value = false;
};

onMounted(async () => {
  // 서비스워커 등록
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    } catch (err) {
      console.error('서비스워커 등록 실패:', err);
    }
  }

  // 알림 권한 요청
  if ('Notification' in window) {
    if (Notification.permission === 'default') {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.warn('알림 권한 거부됨');
      }
    } else if (Notification.permission === 'denied') {
      console.warn('알림 권한이 브라우저에서 차단되어 있습니다. 설정에서 허용으로 바꿔주세요.');
      return;
    }
  }

  // Firebase 초기화 및 FCM 토큰 요청
  try {
    const app = initializeApp(firebaseConfig);
    const messaging = getMessaging(app);

    const swReg = await navigator.serviceWorker.getRegistration();
    if (!swReg) {
      console.warn('Service Worker가 등록되지 않았습니다.');
    }

    const token = await getToken(messaging, {
      vapidKey: 'BMMLYnvnj3Oy3KwROAo87cxni1ViBbTQZoyBn3roEbEDh7nEWQ1cteqhlBPv_X6vYCRTIia3S4Q4S5YMamfnz9M',
      serviceWorkerRegistration: swReg || undefined,
    });

    if (token) {
      await registerFcmToken(token);
    } else {
      console.warn('FCM 토큰을 가져오지 못했습니다.');
    }

    // 포그라운드 알림 수신
    onMessage(messaging, (payload) => {
      if (Notification.permission === 'granted' && payload.notification) {
        const { title, body } = payload.notification;
        try {
          new Notification(title, {
            body,
            icon: '/tomato.png',
          });
        } catch (e) {
          console.warn('Notification 표시 중 오류:', e);
        }
      }
    });
  } catch (e) {
    console.error('FCM 초기화 또는 토큰 요청 오류:', e);
  }

  await fetchInitialChatRooms();
});

</script>

<template>
    <div v-if="isNoLayout">
        <router-view />
    </div>
    <div v-else>
        <div class="w-full min-h-screen bg-background flex flex-col font-sans">
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

        <ChatRoom v-if="selectedRoom" :room="selectedRoom" @close="selectedRoom = null" />
    </div>
</template>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
* {
    font-family: 'Pretendard Variable', sans-serif;
}
</style>
