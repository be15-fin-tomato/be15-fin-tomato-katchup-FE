<template>
    <div
        class="fixed bottom-24 right-6 w-[420px] max-h-[600px]
       bg-white rounded-2xl shadow-xl border border-gray-200 z-50 flex flex-col font-[Pretendard] overflow-hidden">

        <!-- 헤더 -->
        <div class="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 class="text-lg font-bold text-[--color-click]">채팅 리스트</h2>
            <button
                @click="showCreateModal = true"
                class="text-[--color-request] text-2xl hover:brightness-110"
            >+</button>
        </div>

        <!-- 검색 -->
        <div class="px-6 py-3 border-b border-gray-100">
            <input
                v-model="search"
                type="text"
                placeholder="제목, 이름 검색"
                class="w-full text-sm px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-[--color-request]"
            />
        </div>

        <!-- 채팅방 목록 -->
        <ul class="flex-1 overflow-y-auto divide-y divide-gray-100 px-1">
            <li
                v-for="room in filteredRooms"
                :key="room.id"
                class="flex justify-between items-center px-5 py-4 hover:bg-gray-50 transition relative"
            >
                <div class="flex items-center gap-3 cursor-pointer" @click="handleOpenRoom(room.id)">
                    <div class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center text-white font-bold text-sm">
                        {{ room.name?.charAt(0) || '?' }}
                    </div>
                    <div class="flex flex-col">
                        <div class="flex items-center gap-2 font-semibold text-[--color-click] text-sm">
                            {{ room.name }}
                            <span class="text-gray-400 text-xs flex items-center gap-1">👥 {{ room.members ?? '-' }}</span>
                        </div>
                        <p class="text-xs text-gray-500 truncate max-w-[240px]">
                            {{ room.lastMessage }}
                        </p>
                    </div>
                </div>
                <div class="flex flex-col items-end gap-1 min-w-[64px]">
                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400">{{ room.time }}</span>
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

        <!-- 하단 채팅방 생성 버튼 -->
        <div class="p-3 border-t border-gray-100 text-center">
            <button
                class="w-8 h-8 rounded-full bg-[--color-request] text-white text-xl shadow hover:brightness-110 transition"
                @click="showCreateModal = true"
            >+</button>
        </div>

        <!-- 채팅방 생성 모달 -->
        <div
            v-if="showCreateModal"
            class="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2
     w-[360px] bg-white shadow-lg border rounded-xl p-6 z-[999]"
        >
            <h3 class="text-md font-semibold mb-4">새 채팅방 만들기</h3>
            <input
                v-model="newRoomName"
                type="text"
                placeholder="채팅방 이름을 입력하세요"
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
                    v-for="name in filteredNames"
                    :key="name"
                    class="flex justify-between items-center py-1 px-2 hover:bg-gray-100 rounded"
                >
                    <div class="flex items-center gap-2">
                        <div class="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs text-white font-bold">
                            {{ name.charAt(0) }}
                        </div>
                        <span class="text-sm">{{ name }}</span>
                    </div>
                    <input type="checkbox" v-model="selectedMembers" :value="name" />
                </li>
            </ul>
            <div class="flex justify-end gap-2">
                <button class="px-4 py-2 text-sm border rounded" @click="showCreateModal = false">취소</button>
                <button class="px-4 py-2 text-sm border rounded" @click="handleCreate">생성</button>
            </div>
        </div>

        <!-- 퇴장 확인 모달 -->
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
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { fetchChatRoomList } from '@/features/chat/api'
import { fetchChatRoomDetail } from '@/features/chat/api'

const chatRooms = ref([])
const search = ref('')
const showCreateModal = ref(false)
const selectedRoomToLeave = ref(null)
const newRoomName = ref('')
const memberSearch = ref('')
const selectedMembers = ref([])
const emit = defineEmits(['open-room', 'invite-user'])

const allMembers = ['박준서', '박장우', '오유경', '이승재', '윤채영', '조현승']

const filteredNames = computed(() => {
    if (!memberSearch.value) return allMembers
    return allMembers.filter(n => n.includes(memberSearch.value))
})

const fetchChatRooms = async () => {
    try {
        const res = await fetchChatRoomList()
        chatRooms.value = res.map(room => ({
            id: room.chatId,
            name: room.name,
            members: room.participants?.length ?? 0,
            participantNames: room.participants?.map(p => p.name) ?? [],
            lastMessage: room.lastMessage ?? '',
            time: formatTime(room.lastSentAt),
            unreadCount: room.unreadCount ?? 0
        }))
    } catch (e) {
        console.error('채팅방 목록 불러오기 실패', e)
    }
}

const formatTime = (timestamp) => {
    if (!timestamp) return ''
    const date = new Date(timestamp)
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const handleCreate = () => {
    if (!newRoomName.value.trim()) return
    chatRooms.value.unshift({
        id: Date.now(),
        name: newRoomName.value,
        members: selectedMembers.value.length,
        participantNames: selectedMembers.value,
        lastMessage: '',
        time: '방금 전',
        unreadCount: 0
    })
    newRoomName.value = ''
    selectedMembers.value = []
    memberSearch.value = ''
    showCreateModal.value = false
}

const confirmLeave = (room) => {
    selectedRoomToLeave.value = room
}

const leaveRoom = () => {
    chatRooms.value = chatRooms.value.filter(
        (room) => room.id !== selectedRoomToLeave.value.id
    )
    selectedRoomToLeave.value = null
}

onMounted(fetchChatRooms)

const filteredRooms = computed(() => {
    if (!search.value) return chatRooms.value
    const keyword = search.value.toLowerCase()
    return chatRooms.value.filter((room) => {
        const titleMatch = room.name?.toLowerCase().includes(keyword)
        const memberMatch = room.participantNames?.some(n => n.toLowerCase().includes(keyword))
        return titleMatch || memberMatch
    })
})

const handleOpenRoom = async (chatId) => {
    try {
        const roomDetail = await fetchChatRoomDetail(chatId)
        emit('open-room', roomDetail)
    } catch (e) {
        console.error('채팅방 열기 실패', e)
    }
}
</script>
