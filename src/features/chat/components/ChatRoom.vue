<template>
  <div class="fixed bottom-10 right-10 w-[480px] h-[600px] bg-white rounded-2xl shadow-xl border border-gray-200 flex flex-col z-50 font-[Pretendard]">
    <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
      <h2 class="text-lg font-semibold text-[--color-click]">{{ props.room.chatRoomName || '채팅방' }}</h2>
      <div class="flex items-center gap-3">
        <button @click="showInviteModal = true" class="text-[--color-request] text-xl hover:brightness-110">+</button>
        <button @click="$emit('close')" class="text-gray-400 hover:text-gray-600 transition">
          <Icon icon="si:close-duotone" class="w-5 h-5" />
        </button>
      </div>
    </div>

    <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-[#f8fafc]">
      <div v-for="(msg, index) in formattedMessages" :key="msg.messageId || index">
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
      <div class="flex items-center gap-2">
        <input
          v-model="newMessage"
          @keyup.enter="sendMessage"
          type="text"
          placeholder="메시지를 입력하세요"
          class="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:ring-1 focus:ring-[--color-request]"
        />
        <button
          @click="sendMessage"
          :disabled="!newMessage.trim()"
          class="px-3 py-2 text-sm rounded-full text-white bg-blue-500 hover:brightness-105 disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </div>

    <InviteModal
      v-if="showInviteModal"
      :users="allUsers"
      :room="props.room"
      :excluded-ids="currentMemberIds"
      @invite="handleInvite"
      @close="showInviteModal = false"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from 'vue'
import { Icon } from '@iconify/vue'
import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'
import { useAuthStore } from '@/stores/auth'
import { fetchChatRoomDetail, inviteChatMembers, searchUser } from '@/features/chat/api'
import InviteModal from '@/features/chat/components/InviteModal.vue'
import { useToast } from 'vue-toastification';

const props = defineProps({
  room: { type: Object, required: true },
})
const emit = defineEmits(['close', 'room-updated-last-sent-at']);

const authStore = useAuthStore()
const currentUserId = computed(() => authStore.userId)
const currentUserName = computed(() => authStore.user?.name || '알 수 없음')

const messages = ref([])
const newMessage = ref('')
const stompClient = ref(null)

const showInviteModal = ref(false)
const allUsers = ref([])

const memberList = ref([]);
watch(() => props.room.participants, (newParticipants) => {
  memberList.value = newParticipants || [];
}, { immediate: true });


const toast = useToast();

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

  const formattedTime = new Intl.DateTimeFormat('ko-KR', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'Asia/Seoul'
  }).format(messageDate);

  return {
    formattedDate: datePrefix,
    formattedTime: formattedTime
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
    if (messages.value.length > 0) {
      const lastMsg = messages.value[messages.value.length - 1];
    }
    await nextTick();
    scrollToBottom();
  } catch (err) {
    toast.error('채팅 메시지를 불러오는 데 실패했습니다.');
  }
}

const connectWebSocket = () => {
  const token = authStore.accessToken
  if (!token) {
    toast.error('채팅 서버 연결에 필요한 인증 정보가 없습니다.');
    return;
  }

  if (stompClient.value && stompClient.value.connected) {
    stompClient.value.deactivate();
  }

  const socket = new SockJS(`https://api.tomato-katchup.xyz/api/v1/ws?token=${token}`)
  const client = new Client({
    webSocketFactory: () => socket,
    connectHeaders: {
      Authorization: `Bearer ${token}`,
    },
    onConnect: () => {
      client.subscribe(`/topic/room.${props.room.chatId}`, (msg) => {
        const body = JSON.parse(msg.body)

        const exists = messages.value.some(m => m.messageId === body.messageId);
        if (!exists) {
          messages.value.push({
            ...body,
            mine: body.senderId === currentUserId.value,
          });
          emit('room-updated-last-sent-at', {
            chatId: props.room.chatId,
            lastSentAt: body.sentAt
          });
        } else {
        }

        nextTick(() => {
          scrollToBottom();
        });
      })
    },
    onStompError: (frame) => {
      toast.error('채팅 서버 연결 중 오류가 발생했습니다.');
    },
    onDisconnect: () => {
    }
  })

  client.activate()
  stompClient.value = client
}

const sendMessage = () => {
  if (!newMessage.value.trim()) {
    return;
  }
  if (!stompClient.value?.connected) {
    toast.error('채팅 서버에 연결되어 있지 않습니다. 잠시 후 다시 시도해주세요.');
    return;
  }

  const messageText = newMessage.value.trim();
  const sentAtTime = new Date().toISOString();

  const tempMessageId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  messages.value.push({
    messageId: tempMessageId,
    chatId: props.room.chatId,
    senderId: currentUserId.value,
    senderName: currentUserName.value,
    message: messageText,
    sentAt: sentAtTime,
    mine: true,
  });

  newMessage.value = '';

  const messagePayload = {
    chatId: props.room.chatId,
    senderId: currentUserId.value,
    senderName: currentUserName.value,
    message: messageText,
  }

  stompClient.value.publish({
    destination: '/app/chat.sendMessage',
    body: JSON.stringify(messagePayload),
  })
  emit('room-updated-last-sent-at', {
    chatId: props.room.chatId,
    lastSentAt: sentAtTime
  });

  nextTick(() => {
    scrollToBottom();
  });
}

const handleInvite = async (invitedIds) => {
  try {
    await inviteChatMembers(props.room.chatId, invitedIds)
    toast.success('멤버를 성공적으로 초대했습니다!');
    showInviteModal.value = false

    const newlyInvitedMembers = allUsers.value.filter(user => invitedIds.includes(user.id));
    const updatedMembers = new Set([...memberList.value, ...newlyInvitedMembers.map(m => ({ userId: m.id, name: m.name }))]);
    memberList.value = Array.from(updatedMembers);

  } catch (e) {
    toast.error('멤버 초대 중 오류가 발생했습니다.');
  }
}

const loadAllUsers = async () => {
  try {
    const res = await searchUser('')
    allUsers.value = res.userList
  } catch (err) {
    toast.error('사용자 목록을 불러오는 데 실패했습니다.');
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
