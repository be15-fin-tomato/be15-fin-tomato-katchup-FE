<template>
  <div
    class="fixed bottom-24 right-6 w-[420px] max-h-[600px]
       bg-white rounded-2xl shadow-xl border border-gray-200 z-50 flex flex-col font-[Pretendard]">

    <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
      <h2 class="text-lg font-bold text-[--color-click]">채팅 리스트</h2>
      <button
        @click="openCreateModal"
        class="text-[--color-request] text-2xl hover:brightness-110"
      >+</button>
    </div>

    <div class="px-6 py-3 border-b border-gray-100">
      <input
        v-model="search"
        type="text"
        placeholder="제목, 이름 검색"
        class="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[--color-request]"
      />
    </div>

    <ul class="flex-1 overflow-y-auto divide-y divide-gray-100 px-1">
      <li
        v-for="room in filteredRooms"
        :key="room.id"
        class="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition relative cursor-pointer"
        @click="handleOpenRoom(room.id)"
      >
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
            {{ room.name?.charAt(0) || '?' }}
          </div>
          <div class="flex flex-col">
            <div
              :data-room-id="room.id"
              class="flex items-center gap-2 font-semibold text-[--color-click] text-sm"
              @mouseenter="handleMouseEnter($event, room.id, room.name)"
              @mouseleave="handleMouseLeave"
            >
              <span class="truncate max-w-[150px] inline-block">{{ room.name }}</span>
              <span class="text-gray-400 text-xs flex items-center gap-1">👥 {{ room.members ?? '-' }}</span>
            </div>
            <p class="text-xs text-gray-500 truncate max-w-[240px]">
              {{ room.lastMessage }}
            </p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-1 min-w-[64px]">
          <div class="flex items-center gap-2">
            <span class="text-xs text-gray-400">{{ formatTime(room.lastSentAt) }}</span>
            <button
              @click.stop="confirmLeave(room)"
              class="text-gray-400 hover:text-gray-600 text-xl"
            >⋯</button>
          </div>
          <span
            v-if="room.unreadCount > 0"
            class="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full"
          >
            {{ room.unreadCount }}
          </span>
        </div>
      </li>
    </ul>

    <div class="p-3 border-t border-gray-100 text-center">
      <button
        class="w-8 h-8 rounded-full bg-[--color-request] text-white text-xl shadow hover:brightness-110 transition"
        @click="openCreateModal"
      >+</button>
    </div>

    <div
      v-if="showCreateModal"
      class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
     w-[360px] bg-white shadow-lg border rounded-xl p-6 z-[999]"
    >
      <h3 class="text-md font-semibold mb-4">새 채팅방 만들기</h3>
      <input
        v-model="newRoomName"
        type="text"
        placeholder="채팅방 이름을 입력하세요 (선택 사항)"
        class="w-full mb-3 px-3 py-2 border border-gray-300 rounded text-sm"
      />
      <input
        v-model="memberSearch"
        type="text"
        placeholder="이름 검색"
        class="w-full mb-3 px-3 py-2 border border-gray-300 rounded text-sm"
      />
      <ul class="max-h-40 overflow-y-auto mb-4 pr-1">
        <li
          v-for="member in filteredSearchUsers"
          :key="member.id"
          class="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded"
        >
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs text-white font-bold">
              {{ member.name.charAt(0) }}
            </div>
            <span class="text-sm">{{ member.name }}</span>
          </div>
          <input type="checkbox" v-model="selectedMembers" :value="member.id" />
        </li>
      </ul>
      <div class="flex justify-end gap-2">
        <button class="px-4 py-2 text-sm border rounded" @click="closeCreateModal">취소</button>
        <button class="px-4 py-2 text-sm border rounded" @click="handleCreate">생성</button>
      </div>
    </div>

    <div
      v-if="selectedRoomToLeave"
      class="absolute inset-0 bg-white bg-opacity-90 flex justify-center items-center z-10"
    >
      <div class="bg-white border rounded-xl p-6 shadow-lg text-center">
        <p class="mb-6">
          <strong class="font-semibold">{{ selectedRoomToLeave.name }}</strong>
          채팅방에서 나가시겠습니까?
        </p>
        <div class="flex justify-center gap-3">
          <button class="px-4 py-2 text-sm border border-gray-300 rounded" @click="selectedRoomToLeave = null">
            취소
          </button>
          <button class="px-4 py-2 text-sm border border-gray-300 rounded" @click="leaveRoom">
            나가기
          </button>
        </div>
      </div>
    </div>
  </div>

  <teleport to="body">
    <div
      v-if="showTooltip && tooltipContent"
      :style="tooltipStyle"
      class="fixed px-4 py-2 bg-gray-100 text-gray-800 text-sm rounded-lg shadow-md z-[1000] whitespace-nowrap pointer-events-none border border-gray-200"
    >
      {{ tooltipContent }}
    </div>
  </teleport>
</template>

<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { exitChatRoom, fetchChatRoomDetail, createChatRoom, searchUser } from '@/features/chat/api'
import { useAuthStore } from '@/stores/auth'
import { useToast } from 'vue-toastification';

const props = defineProps({
  chatRooms: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'open-room', 'invite-user', 'room-opened', 'chat-rooms-changed'])

const search = ref('')
const showCreateModal = ref(false)
const selectedRoomToLeave = ref(null)
const newRoomName = ref('')
const memberSearch = ref('')
const selectedMembers = ref([])

const allSearchUsers = ref([]);

const authStore = useAuthStore();
const currentUserId = computed(() => authStore.userId);

const showTooltip = ref(false);
const tooltipContent = ref('');
const tooltipStyle = ref({});

const toast = useToast();

watch(memberSearch, async (newKeyword) => {
  try {
    const result = await searchUser(newKeyword);
    allSearchUsers.value = result?.userList || [];
  } catch (error) {
    console.error('사용자 검색 실패:', error);
    allSearchUsers.value = [];
    toast.error('사용자 검색에 실패했습니다.');
  }
}, { immediate: true });

const filteredSearchUsers = computed(() => {
  const usersToFilter = allSearchUsers.value.filter(
    user => user.id !== currentUserId.value
  );

  if (!memberSearch.value) return usersToFilter;

  const searchTerm = memberSearch.value.toLowerCase();
  return usersToFilter.filter(user => user.name.toLowerCase().includes(searchTerm));
});

// formatTime 함수를 한국 시간으로 포맷하도록 수정
const formatTime = (isoString) => {
  if (!isoString) return '';
  const date = new Date(isoString);
  // 한국어 로케일을 사용하여 오전/오후 HH:MM 형식으로 시간 포맷팅
  return date.toLocaleTimeString('ko-KR', { hour: 'numeric', minute: '2-digit', hour12: true });
};


const openCreateModal = () => {
  showCreateModal.value = true;
  memberSearch.value = '';
  selectedMembers.value = [];
}

const closeCreateModal = () => {
  showCreateModal.value = false;
  newRoomName.value = '';
  selectedMembers.value = [];
  memberSearch.value = '';
}

const handleCreate = async () => {
  if (selectedMembers.value.length === 0) {
    toast.warning('채팅방에 참여할 멤버를 한 명 이상 선택해주세요.');
    return;
  }

  let participantIds = [...selectedMembers.value];

  if (currentUserId.value && !participantIds.includes(currentUserId.value)) {
    participantIds.push(currentUserId.value);
  }

  try {
    const newChatRoom = await createChatRoom(newRoomName.value, participantIds);
    console.log('채팅방 생성 성공:', newChatRoom);
    toast.success('채팅방이 성공적으로 생성되었습니다!');

    closeCreateModal();
    emit('chat-rooms-changed');

  } catch (error) {
    console.error('채팅방 생성 중 오류 발생:', error);
    toast.error('채팅방 생성에 실패했습니다.');
  }
}

const confirmLeave = (room) => {
  selectedRoomToLeave.value = room
}

const leaveRoom = async () => {
  if (!selectedRoomToLeave.value) return;

  const userId = authStore.userId;

  if (!userId) {
    console.warn('로그인 정보가 없어 채팅방을 나갈 수 없습니다.');
    toast.error('로그인 정보가 없어 채팅방을 나갈 수 없습니다.');
    return;
  }

  try {
    await exitChatRoom(selectedRoomToLeave.value.id, userId);
    selectedRoomToLeave.value = null;
    toast.info('채팅방을 나갔습니다.');

    emit('chat-rooms-changed');
  } catch (error) {
    console.error('채팅방 나가기 실패:', error);
    toast.error('채팅방 나가기에 실패했습니다.');
    throw error;
  }
}

const filteredRooms = computed(() => {
  let rooms = props.chatRooms;

  if (search.value) {
    const keyword = search.value.toLowerCase();
    rooms = rooms.filter((room) => {
      const titleMatch = room.name?.toLowerCase().includes(keyword);
      const memberMatch = room.participants?.some(p => p.name?.toLowerCase().includes(keyword));
      return titleMatch || memberMatch;
    });
  }

  return [...rooms].sort((a, b) => {
    const timeA = a.lastSentAt ? new Date(a.lastSentAt).getTime() : 0;
    const timeB = b.lastSentAt ? new Date(b.lastSentAt).getTime() : 0;
    return timeB - timeA;
  });
});

const handleOpenRoom = async (chatId) => {
  try {
    const roomDetail = await fetchChatRoomDetail(chatId);

    emit('room-opened', chatId);

    const chatRoomMeta = props.chatRooms.find(room => room.id === chatId);
    if (!roomDetail || !roomDetail.messages || !chatRoomMeta) {
      toast.error('채팅방 정보를 불러오는데 실패했습니다');
      return;
    }

    emit('open-room', {
      chatId: roomDetail.chatId,
      messages: roomDetail.messages,
      chatRoomName: chatRoomMeta?.name ?? '채팅방',
      participants: chatRoomMeta.participants
    });

  } catch (e) {
    console.error('❌ 채팅방 열기 실패:', e);
    toast.error('채팅방을 여는 데 실패했습니다.');
  }
}

const handleMouseEnter = (event, roomId, content) => {
  const targetElement = event.currentTarget;
  const rect = targetElement.getBoundingClientRect();

  tooltipContent.value = content;
  showTooltip.value = true;

  nextTick(() => {
    const tooltipElement = document.querySelector('.fixed.px-4.py-2.bg-gray-100');
    if (tooltipElement) {
      const tooltipWidth = tooltipElement.offsetWidth;
      const tooltipHeight = tooltipElement.offsetHeight;

      tooltipStyle.value = {
        left: `${rect.left + rect.width / 2 - tooltipWidth / 2}px`,
        top: `${rect.top - tooltipHeight - 8}px`,
      };
    }
  });
};

const handleMouseLeave = () => {
  showTooltip.value = false;
  tooltipContent.value = '';
  tooltipStyle.value = {};
};

</script>

<style scoped>

</style>
