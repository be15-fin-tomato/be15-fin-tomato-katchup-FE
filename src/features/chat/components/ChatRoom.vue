<template>
    <div
        class="fixed bottom-10 right-10 w-[480px] h-[700px]
           bg-white rounded-2xl shadow-xl border border-gray-200
           flex flex-col z-50 font-[Pretendard]"
    >
        <!-- 헤더 -->
        <div class="flex justify-between items-center px-6 py-4 border-b border-gray-100">
            <h2 class="text-lg font-semibold text-[--color-click]">
                {{ room?.name }}
            </h2>
            <div class="flex items-center gap-3">
                <button @click="showInviteModal = true" class="text-[--color-request] text-xl hover:brightness-110">+</button>
                <button @click="exitRoom" class="text-gray-400 hover:text-gray-600 transition">
                    <Icon icon="si:close-duotone" class="w-5 h-5" />
                </button>
            </div>
        </div>

        <!-- 메시지 리스트 -->
        <div class="flex-1 overflow-y-auto px-4 py-3 space-y-4 bg-[#f8fafc]">
            <div
                v-for="(msg, index) in messages"
                :key="index"
                :class="['flex flex-col max-w-[80%]', msg.mine ? 'self-end items-end' : 'self-start items-start']"
            >
                <span class="text-xs text-gray-400 mb-1">
                    {{ msg.mine ? 'ME' : msg.senderName }} ·
                    {{ new Date(msg.sentAt).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' }) }}
                </span>
                <div class="px-4 py-2 rounded-xl text-sm bg-gray-100 text-gray-800">
                    {{ msg.message }}
                </div>
            </div>
        </div>

        <!-- 입력창 -->
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

        <!-- 초대 모달 -->
        <div
            v-if="showInviteModal"
            class="absolute top-24 right-10 w-[360px] bg-white/90 backdrop-blur-lg shadow-2xl rounded-xl p-5 z-50"
        >
            <h3 class="text-lg font-semibold text-gray-800 mb-4">채팅방에 소환</h3>
            <input
                v-model="inviteSearch"
                type="text"
                placeholder="이름으로 검색"
                class="w-full px-4 py-2 mb-4 rounded-lg border border-gray-200 bg-gray-50 text-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[--color-request]"
            />
            <ul class="space-y-2 max-h-52 overflow-y-auto pr-1 custom-scroll">
                <li
                    v-for="name in filteredInviteList"
                    :key="name"
                    class="flex items-center gap-3 text-sm px-3 py-2 rounded-lg hover:bg-gray-100 transition"
                >
                    <input
                        type="checkbox"
                        v-model="selectedInvitees"
                        :value="name"
                        class="accent-[--color-request] w-4 h-4"
                    />
                    <span class="text-gray-700">{{ name }}</span>
                </li>
            </ul>
            <div class="flex justify-between items-center mt-5">
                <button @click="showInviteModal = false" class="text-sm text-gray-400 hover:text-gray-600">닫기</button>
                <button
                    @click="inviteSelected"
                    class="bg-[--color-request] text-white text-sm px-4 py-2 rounded-lg hover:brightness-105 transition disabled:opacity-50"
                    :disabled="selectedInvitees.length === 0"
                >소환하기</button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import axios from 'axios'
import { Icon } from '@iconify/vue'

const props = defineProps({ room: Object })
const emit = defineEmits(['close'])

const newMessage = ref('')
const messages = ref([])
const fileInput = ref(null)
const attachedFile = ref(null)
const uploadProgress = ref(0)
const isUploading = ref(false)

const showInviteModal = ref(false)
const inviteSearch = ref('')
const selectedInvitees = ref([])

const allUsers = ['박준서', '박장우', '오유경', '이승재', '윤채영', '조현승']
const filteredInviteList = computed(() => {
    const currentMembers = props.room?.membersList || []
    return allUsers
        .filter(name => !currentMembers.includes(name))
        .filter(name => name.includes(inviteSearch.value))
})

const fetchMessages = async () => {
    if (!props.room?.id) return
    try {
        const res = await axios.get(`/api/v1/chats/${props.room.id}/messages`)
        messages.value = res.data.messages || res.data.data?.messages || []
    } catch (err) {
        console.error('메시지 불러오기 실패', err)
    }
}

watch(
    () => props.room?.id,
    (newId) => {
        if (newId) fetchMessages()
    },
    { immediate: true }
)

const sendMessage = async () => {
    if (!newMessage.value.trim() && !attachedFile.value) return

    try {
        const payload = {
            roomId: props.room.id,
            message: newMessage.value,
        }
        await axios.post('/api/v1/chats/message', payload)
        newMessage.value = ''
        attachedFile.value = null
        await fetchMessages()
    } catch (err) {
        console.error('메시지 전송 실패', err)
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
        await axios.post('/api/v1/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
            onUploadProgress: (e) => {
                const percent = Math.round((e.loaded * 100) / e.total)
                uploadProgress.value = percent
            }
        })
        isUploading.value = false
    } catch (err) {
        console.error('파일 업로드 실패', err)
        isUploading.value = false
    }
}

const inviteSelected = () => {
    if (selectedInvitees.value.length === 0) return
    showInviteModal.value = false
    selectedInvitees.value = []
}

const exitRoom = () => {
    emit('close', props.room.id)
}
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
