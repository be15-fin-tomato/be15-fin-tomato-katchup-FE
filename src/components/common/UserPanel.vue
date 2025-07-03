<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from 'vue-toastification';
import { logout } from '@/features/user/api';
import { useAuthStore } from '@/stores/auth';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const isNotificationOpen = ref(false);

const notifications = ref([
    { id: 1, content: '파이프라인 단계가 변경되었습니다.', isRead: false, createdAt: '2025.06.16' },
    { id: 2, content: '계약 마감일이 하루 남았습니다.', isRead: true, createdAt: '2025.06.15' },
    { id: 3, content: '계약 실패했습니다.', isRead: false, createdAt: '2025.06.14' },
]);

const unreadCount = computed(() => notifications.value.filter((n) => !n.isRead).length);

function toggleNotification() {
    isNotificationOpen.value = !isNotificationOpen.value;
}

function handleClickOutside(event) {
    const dropdown = document.getElementById('notification-dropdown');
    if (isNotificationOpen.value && dropdown && !dropdown.contains(event.target)) {
        isNotificationOpen.value = false;
    }
}

function markAsRead(index) {
    notifications.value[index].isRead = true;
}

function deleteNotification(index) {
    notifications.value.splice(index, 1);
}

function clearAllNotifications() {
    notifications.value = [];
}

const handleLogout = async () => {
    try {
        await logout();
        authStore.clearAccessToken();
        toast.success('로그아웃 되었습니다.');

        await router.replace('/login');
    } catch (e) {
        toast.error(e.data.message);
    }
};

onMounted(() => document.addEventListener('click', handleClickOutside));
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside));
</script>

<template>
    <div class="flex items-center gap-10 mr-5">
        <!-- 프로필 -->
        <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/mypage')">
            <img
                class="w-10 h-10 rounded-full"
                src="@/assets/images/mock/profile.png"
                alt="프로필"
            />
            <div class="flex flex-col text-sm">
                <div class="font-bold text-black">차은우</div>
                <div class="text-xs text-black">팀장</div>
            </div>
        </div>

        <!-- 기능 버튼들 -->
        <div class="flex items-center ml-4 gap-4">
            <button @click="router.push('/calendar')">
                <img
                    src="@/assets/icons/calendar.svg"
                    alt="캘린더"
                    class="cursor-pointer w-6 h-6"
                />
            </button>

            <!-- 알림 -->
            <div class="relative cursor-pointer">
                <button @click.stop="toggleNotification">
                    <img
                        src="@/assets/icons/alarm.svg"
                        alt="알림"
                        class="w-6 h-6 relative top-[4px]"
                    />
                </button>
                <span
                    v-if="unreadCount > 0"
                    class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
                >
                    {{ unreadCount }}
                </span>
            </div>

            <!-- 알림 드롭다운 -->
            <div
                v-if="isNotificationOpen"
                id="notification-dropdown"
                class="absolute right-[40px] top-[60px] w-[300px] bg-white shadow-xl border border-gray-200 rounded-xl z-50"
            >
                <div
                    class="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl"
                >
                    <div class="font-semibold text-gray-800">알림</div>
                    <button
                        class="text-xs text-gray-400 hover:text-black"
                        @click="clearAllNotifications"
                    >
                        전체삭제
                    </button>
                </div>
                <div class="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                    <div
                        v-for="(noti, index) in notifications"
                        :key="noti.id"
                        class="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-start gap-2"
                        :class="
                            noti.isRead ? 'text-gray-500 font-normal' : 'text-black font-semibold'
                        "
                    >
                        <div @click="markAsRead(index)" class="w-[80%]">
                            {{ noti.content }}
                        </div>
                        <div class="flex flex-col items-end gap-1">
                            <span class="text-xs text-gray-400">{{ noti.createdAt }}</span>
                            <button
                                @click.stop="deleteNotification(index)"
                                class="text-gray-400 hover:text-red-500"
                            >
                                <Icon icon="tabler:trash" class="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 로그아웃 -->
            <button @click="handleLogout">
                <img
                    src="@/assets/icons/logout.svg"
                    alt="로그아웃"
                    class="w-6 h-6 cursor-pointer"
                />
            </button>
        </div>
    </div>
</template>
