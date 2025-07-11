<template>
  <div class="fixed bottom-10 right-10 w-[480px] h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col z-50 font-[Pretendard]">
    <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-[--color-click]">{{ room.chatRoomName || '채팅방' }}</h2>
      <div class="flex items-center gap-3">
        <button @click="showInviteModal = true" class="text-[--color-request] text-xl hover:brightness-110">+</button>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition">
          <Icon icon="si:close-duotone" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-[#f8fafc]">
      <div v-for="(msg, index) in formattedMessages" :key="index">
        <div v-if="shouldShowDateDivider(msg, index)" class="text-center text-xs text-gray-500 my-2">
          {{ msg.formattedDate }}
        </div>

        <div
          :class="['flex flex-col', msg.mine ? 'items-end ml-auto pr-2' : 'items-start']"
        >
          <span class="text-xs text-gray-400 mb-1">
            {{ msg.mine ? 'ME' : msg.senderName }} ·
            {{ msg.formattedTime }}
          </span>
          <div
            :class="['px-4 py-2 rounded-xl text-sm whitespace-pre-wrap', msg.message === null ? 'hidden' : '', msg.mine ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800']"
          >
            {{ msg.message }}
          </div>
        </div>
      </div>
    </div>

    <div class="border-t border-gray-100 px-4 py-3">
      <div v-if="attachedFile" class="flex flex-col gap-1 mb-2">
        <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2 text-sm text-gray-700">
          <Icon icon="codex:file" class="text-sky-500 w-4 h-4" />
          <span class="truncate max-w-[200px]">{{ attachedFile.name }}</span>
          <button @click="attachedFile = null" class="text-xs text-red-500 hover:underline">삭제</button>
        </div>
        <div v-if="isUploading" class="h-2 bg-blue-100 rounded-full overflow-hidden">
          <div class="h-full bg-blue-500 transition-all duration-300" :style="{ width: uploadProgress + '%' }"></div>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button @click="triggerFileUpload" class="text-[--color-btn-sky] text-xl">
          <Icon icon="codex:file" class="w-5 h-5" />
        </button>
        <input ref="fileInput" type="file" class="hidden" @change="handleFileChange" />
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="메시지를 입력하세요"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[--color-request]"
        />
        <button
          @click="sendMessage"
          :disabled="(!newMessage.trim() && !attachedFile) || isUploading"
          class="px-3 py-2 text-sm rounded-full text-white bg-blue-500 hover:brightness-105 disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </div>

    <InviteModal
      v-if="showInviteModal"
      :users="allUsers"
      :room="room"
      :excluded-ids="currentMemberIds"
      @invite="handleInvite"
      @close="showInviteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { Icon } from '@iconify/vue'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import api from '@/plugin/axios.js'
import { useAuthStore } from '@/stores/auth'
import { fetchChatRoomDetail, inviteChatMembers, searchUser } from '@/features/chat/api'
import InviteModal from '@/features/chat/components/InviteModal.vue'

const props = defineProps({
  room: { type: Object, required: true },
})
const room = props.room
const emit = defineEmits(['close'])

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.userId)
const currentUserName = computed(() => authStore.user?.name || '알 수 없음')

const messages = ref([])
const newMessage = ref('')
const stompClient = ref(null)

const attachedFile = ref(null)
const uploadProgress = ref(0)
const isUploading = ref(false)
const fileInput = ref(null)

const showInviteModal = ref(false)
const allUsers = ref([])

const memberList = ref(props.room.participants || [])

const currentMemberIds = computed(() => {
  if (Array.isArray(memberList.value)) {
    return memberList.value.map(p => p.userId || p.id);
  }
  return [];
});

const formatMessageTime = (isoString) => {
  if (!isoString) return { formattedDate: '', formattedTime: '' };

  const messageDate = new Date(isoString);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const messageDay = new Date(messageDate.getFullYear(), messageDate.getMonth(), messageDate.getDate());
  const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const yesterdayDay = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate());

  let datePrefix = '';
  if (messageDay.getTime() === todayDay.getTime()) {
    datePrefix = '오늘';
  } else if (messageDay.getTime() === yesterdayDay.getTime()) {
    datePrefix = '어제';
  } else {
    datePrefix = `${messageDate.getFullYear()}년 ${messageDate.getMonth() + 1}월 ${messageDate.getDate()}일`;
  }

  let hours = messageDate.getHours();
  const minutes = messageDate.getMinutes();
  const ampm = hours >= 12 ? '오후' : '오전';
  hours = hours % 12;
  hours = hours ? hours : 12;
  const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

  return {
    formattedDate: datePrefix,
    formattedTime: `${ampm} ${hours}:${formattedMinutes}`
  };
};

const formattedMessages = computed(() => {
  return messages.value.map(msg => {
    const { formattedDate, formattedTime } = formatMessageTime(msg.sentAt);
    return {
      ...msg,
      formattedDate,
      formattedTime,
      mine: msg.senderId === currentUserId.value,
    };
  });
});

const shouldShowDateDivider = (currentMsg, index) => {
  if (index === 0) {
    return true;
  }
  const prevMsg = formattedMessages.value[index - 1];
  return currentMsg.formattedDate !== prevMsg.formattedDate;
};


const fetchMessages = async () => {
  try {
    const data = await fetchChatRoomDetail(props.room.chatId)
    messages.value = (data.messages || []).map((m) => ({
      ...m,
      mine: m.senderId === currentUserId.value,
    }))
    await nextTick();
    scrollToBottom();
  } catch (err) {
    console.error('채팅방 메시지 불러오기 실패:', err)
  }
}

const connectWebSocket = () => {
  const token = authStore.accessToken
  if (!token) return console.error('토큰 없음: WebSocket 연결 실패')

  const socket = new SockJS(`/api/v1/ws?token=${token}`)
  const client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => {
      console.log('🟢 WebSocket 연결 성공')
      client.subscribe(`/topic/room.${props.room.chatId}`, (msg) => {
        const body = JSON.parse(msg.body)
        messages.value.push({
          ...body,
          mine: body.senderId === currentUserId.value,
        })
        nextTick(() => {
          scrollToBottom();
        });
      })
    },
    onStompError: (frame) => {
      console.error('STOMP 오류 발생:', frame)
    },
  })

  client.activate()
  stompClient.value = client
}

const sendMessage = () => {
  if (!newMessage.value.trim() && !attachedFile.value) return
  if (!stompClient.value?.connected) return

  const messagePayload = {
    chatId: props.room.chatId,
    senderId: currentUserId.value,
    senderName: currentUserName.value,
    message: newMessage.value,
  }

  stompClient.value.publish({
    destination: '/app/chat.sendMessage',
    body: JSON.stringify(messagePayload),
  })

  newMessage.value = ''
  attachedFile.value = null

  nextTick(() => {
    scrollToBottom();
  });
}

const handleInvite = async (invitedIds) => {
  try {
    await inviteChatMembers(props.room.chatId, invitedIds)
    alert('초대 완료!')
    showInviteModal.value = false

    const newlyInvitedMembers = allUsers.value.filter(user => invitedIds.includes(user.id));
    const updatedMembers = new Set([...memberList.value, ...newlyInvitedMembers]);
    memberList.value = Array.from(updatedMembers);

  } catch (e) {
    console.error('초대 실패:', e)
    alert('초대 중 오류가 발생했습니다.')
  }
}

const triggerFileUpload = () => fileInput.value?.click()

const handleFileChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  attachedFile.value = file
  isUploading.value = true
  uploadProgress.value = 0

  const formData = new FormData()
  formData.append('file', file)

  try {
    await api.post('/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        uploadProgress.value = Math.round((e.loaded * 100) / e.total)
      },
    })
    isUploading.value = false
  } catch (err) {
    console.error('파일 업로드 실패:', err)
    isUploading.value = false
    attachedFile.value = null
  }
}

const loadAllUsers = async () => {
  try {
    const res = await searchUser('')
    allUsers.value = res.userList
  } catch (err) {
    console.error('사용자 목록 불러오기 실패:', err)
  }
}

const scrollToBottom = () => {
  const messageList = document.querySelector('.flex-1.overflow-y-auto');
  if (messageList) {
    messageList.scrollTop = messageList.scrollHeight;
  }
};

onMounted(() => {
  fetchMessages()
  connectWebSocket()
  loadAllUsers()
})

onBeforeUnmount(() => {
  stompClient.value?.deactivate()
})
</script>

<style scoped>
.custom-scroll::-webkit-scrollbar {
  width: 6px;
}
.custom-scroll::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.1);
  border-radius: 3px;
}
</style>
