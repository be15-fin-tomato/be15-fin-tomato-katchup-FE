<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import { useToast } from 'vue-toastification';
import { logout } from '@/features/user/api';
import { useAuthStore } from '@/stores/auth';
import {
  fetchAllNotifications,
  fetchUnreadNotificationCount,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
  subscribeNotificationSse
} from '@/features/user/api';
import { fetchHeaderUserInfo } from '@/features/mypage/api.js';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const isNotificationOpen = ref(false);
const notifications = ref([]);
const unreadCount = ref(0);
let sseSource = null;

const userInfo = ref({
  name: '',
  position: '',
  profileImg: '',
});

const getHeaderUserInfo = async () => {
  try {
    const res = await fetchHeaderUserInfo();
    const data = res.data.data;
    userInfo.value.name = data.name;
    userInfo.value.position = data.position;
    userInfo.value.profileImg = data.fileRoute || '/tomato.png';
  } catch (error) {
    console.error('헤더 사용자 정보 조회 실패 : ', error);
  }
};

const getNotifications = async () => {
  try {
    notifications.value = await fetchAllNotifications();
    unreadCount.value = await fetchUnreadNotificationCount();
  } catch (err) {
    console.error('알림 불러오기 실패 : ', err);
  }
};

function toggleNotification() {
  isNotificationOpen.value = !isNotificationOpen.value;
}

function handleClickOutside(event) {
  const dropdown = document.getElementById('notification-dropdown');
  if (isNotificationOpen.value && dropdown && !dropdown.contains(event.target)) {
    isNotificationOpen.value = false;
  }
}

async function handleNotificationClick(index) {
  const noti = notifications.value[index];
  if (!noti.isRead) {
    await markNotificationAsRead(noti.id);
    noti.isRead = true;
    unreadCount.value--;
  }

  const url = resolveNotificationUrl(noti.typeId, noti.targetId);
  await router.push(url);
}

function resolveNotificationUrl(typeId, targetId) {
  switch (typeId) {
    case 2:
    case 3:
      return `${targetId}`;
    case 4:
      return `/calendar`;
    case 5:
      return `/chat/${targetId}`;
    default:
      return '/';
  }
}

async function deleteNoti(index) {
  const noti = notifications.value[index];
  await deleteNotification(noti.id);
  if (!noti.isRead) unreadCount.value--;
  notifications.value.splice(index, 1);
}

async function clearAllNotifications() {
  await deleteAllNotifications();
  notifications.value = [];
  unreadCount.value = 0;
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

function formatDateTime(date) {
  const yyyy = date.getFullYear();
  const MM = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');

  return `${yyyy}-${MM}-${dd} ${hh}:${mm}`;
}

// SSE 구독
const startSse = () => {
  sseSource = subscribeNotificationSse({
    onMessage: (data) => {
      notifications.value.unshift({
        id: data.id,
        content: data.message,
        typeId: data.typeId,
        targetId: data.targetId,
        isRead: false, // 새로 받은 알림은 항상 '안 읽음' 상태
        createdAt: formatDateTime(new Date()), // 받은 시각을 프론트에서 생성
      });
      unreadCount.value++;
    },

    onConnect: (msg) => {
      console.log('서버 연결 성공 : ', msg);
    },
    onError: (err) => {
      console.error('SSE 오류 : ', err);
    }
  });
};

onMounted(() => {
  getHeaderUserInfo();
  getNotifications();
  startSse();
  document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  if (sseSource) sseSource.close();
});
</script>

<template>
  <div class="flex items-center gap-10 mr-5">
    <!-- 프로필 -->
    <div class="flex items-center gap-3 cursor-pointer" @click="router.push('/mypage')">
      <img class="w-10 h-10 rounded-full object-cover" :src="userInfo.profileImg" alt="프로필" />
      <div class="flex flex-col text-sm">
        <div class="font-bold text-black">{{ userInfo.name }}</div>
        <div class="text-xs text-black">{{ userInfo.position }}</div>
      </div>
    </div>

    <!-- 기능 버튼들 -->
    <div class="flex items-center ml-4 gap-4">
      <!-- 캘린더 -->
      <button @click="router.push('/calendar')">
        <img src="@/assets/icons/calendar.svg" alt="캘린더" class="cursor-pointer w-6 h-6" />
      </button>

      <!-- 알림 -->
      <div class="relative cursor-pointer">
        <button @click.stop="toggleNotification">
          <img src="@/assets/icons/alarm.svg" alt="알림" class="w-6 h-6 relative top-[4px]" />
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
        class="absolute right-[40px] top-[100px] w-[500px] bg-white shadow-xl border border-gray-200 rounded-xl z-50"
      >
        <div class="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
          <div class="font-semibold text-gray-800">알림</div>
          <button class="text-xs text-gray-400 hover:text-black" @click="clearAllNotifications">
            전체삭제
          </button>
        </div>
        <div class="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
          <div
            v-if="notifications.length === 0"
            class="px-4 py-4 text-center text-gray-400 text-sm"
          >
            알림이 없습니다.
          </div>
          <div
            v-for="(noti, index) in notifications"
            :key="noti.id"
            class="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-start gap-2"
            :class="noti.isRead ? 'text-gray-500 font-normal' : 'text-black font-semibold'"
            @click="handleNotificationClick(index)"
          >
            <div class="w-[60%] break-words">{{ noti.content }}</div>
            <div class="flex flex-col items-end gap-1">
              <span class="text-xs text-gray-400">{{ noti.createdAt }}</span>
              <button @click.stop="deleteNoti(index)" class="text-gray-400 hover:text-red-500">
                <Icon icon="tabler:trash" class="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- 로그아웃 -->
      <button @click="handleLogout">
        <img src="@/assets/icons/logout.svg" alt="로그아웃" class="w-6 h-6 cursor-pointer" />
      </button>
    </div>
  </div>
</template>
