<script setup>
import { ref, onMounted, computed } from 'vue'
import ChatFloatingButton from '@/components/common/ChatFloatingButton.vue'
import ChatListModal from '@/features/chat/components/ChatListModal.vue'
import ChatRoom from '@/features/chat/components/ChatRoom.vue'
import SalesDashboard from '@/features/main/components/SalesDashboard.vue';
import { fetchChatRoomList } from '@/features/chat/api'

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

onMounted(fetchInitialChatRooms)

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
</script>

<template>
    <div class="flex min-h-screen relative">
        <SalesDashboard />

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
    </div>
</template>
