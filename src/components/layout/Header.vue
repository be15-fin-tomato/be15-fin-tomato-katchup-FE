<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { Icon } from '@iconify/vue'

const router = useRouter()
const route = useRoute()

const hoveredMenu = ref('')
const activeMenu = ref('')
const isNotificationOpen = ref(false)

const menuMap = {
  influencer: {
    label: '인플루언서',
    routes: {
      '대시보드': '/influencer/list',
      'AI 추천 매칭': '/influencer/recommendation',
      '인플루언서 관리': '/management/influencer',
    }
  },
  campaign: {
    label: '캠페인',
    routes: {
      '파이프라인': '/sales/pipeline',
      '리스트업': '/sales/listup',
      '제안': '/sales/proposal',
      '견적': '/sales/quotation',
      '계약': '/sales/contract',
      '매출': '/sales/revenue'
    }
  },
  contract: {
    label: '전자계약',
    routes: {
      '계약서 목록': '/contract/list',
      '템플릿 목록': '/contract/template'
    }
  },
  management: {
    label: '관리',
    routes: {
      '고객사': '/management/client',
      '이메일 시스템': '/management/email',
      '만족도 조사': '/management/survey'
    }
  }
}

const notifications = ref([
  { id: 1, content: '파이프라인 단계가 변경되었습니다.', isRead: false, createdAt: '2025.06.16' },
  { id: 2, content: '계약 마감일이 하루 남았습니다.', isRead: true, createdAt: '2025.06.15' },
  { id: 3, content: '계약 실패했습니다.', isRead: false, createdAt: '2025.06.14' },
])

const unreadCount = computed(() => notifications.value.filter(n => !n.isRead).length)

const selectedMenu = computed(() => {
  const path = route.path
  for (const [menu, { routes }] of Object.entries(menuMap)) {
    for (const pathValue of Object.values(routes)) {
      if (path.startsWith(pathValue)) return menu
    }
  }
  return ''
})

const selectedSubMenu = computed(() => {
  const path = route.path
  for (const { routes } of Object.values(menuMap)) {
    for (const [label, pathValue] of Object.entries(routes)) {
      if (path.startsWith(pathValue)) return label
    }
  }
  return ''
})

const currentMenu = computed(() => hoveredMenu.value || selectedMenu.value)

function navigateTo(menu, subMenu) {
  activeMenu.value = menu
  router.push(menuMap[menu].routes[subMenu])
}

function toggleNotification() {
  isNotificationOpen.value = !isNotificationOpen.value
}
function handleClickOutside(event) {
  const dropdown = document.getElementById('notification-dropdown')
  if (isNotificationOpen.value && dropdown && !dropdown.contains(event.target)) {
    isNotificationOpen.value = false
  }
}
function markAsRead(index) {
  notifications.value[index].isRead = true
}
function deleteNotification(index) {
  notifications.value.splice(index, 1)
}
function clearAllNotifications() {
  notifications.value = []
}

onMounted(() => document.addEventListener('click', handleClickOutside))
onBeforeUnmount(() => document.removeEventListener('click', handleClickOutside))
</script>


<template>
  <div class="relative w-full font-semibold text-gray-medium" @mouseleave="hoveredMenu = ''">
    <header class="w-full bg-white border-b border-gray-medium text-lg">
      <div class="flex justify-between items-center h-[90px]">
        <!-- 로고 -->
        <button class="ml-10 cursor-pointer" @click="router.push('/')">
          <img src="@/assets/images/logo.png" alt="logo" class="h-[220px] select-none" />
        </button>

        <!-- 메뉴 -->
        <div class="flex-grow relative">
          <nav class="flex">
            <div
              v-for="(data, menu) in menuMap"
              :key="menu"
              class="cursor-pointer"
            >
              <button
                @mouseenter="hoveredMenu = menu"
                :class="[
                  'transition-colors duration-200 w-48 h-50',
                  (selectedMenu === menu || hoveredMenu === menu)
                  ? 'text-black bg-gray-light'
                  : 'text-gray-medium'
                ]"
              >
                {{ data.label }}
              </button>
            </div>
          </nav>
        </div>

        <!-- 유저 패널 -->
        <div class="flex items-center gap-10 mr-5">
          <div class="flex items-center gap-3 cursor-pointer"  @click="router.push('/mypage')">
            <img class="w-10 h-10 rounded-full" src="@/assets/images/mock/profile.png" alt="프로필" />
            <div class="flex flex-col text-sm">
              <div class="font-bold text-black">차은우</div>
              <div class="text-xs text-black">팀장</div>
            </div>
          </div>
          <div class="flex items-center ml-4 gap-4">
            <button><img src="@/assets/icons/calendar.svg" alt="캘린더" class="cursor-pointer w-6 h-6" @click="router.push('/calendar')" /></button>

            <div class="relative cursor-pointer">
              <button @click.stop="toggleNotification">
                <img src="@/assets/icons/alarm.svg" alt="알림" class="w-6 h-6 relative top-[4px] cursor-pointer" />
              </button>
              <span
                v-if="unreadCount > 0"
                class="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full"
              >
                {{ unreadCount }}
              </span>
            </div>
            <div
              v-if="isNotificationOpen"
              id="notification-dropdown"
              class="absolute right-[40px] top-[60px] w-[300px] bg-white shadow-xl border border-gray-200 rounded-xl z-50"
            >
              <div class="flex justify-between items-center px-4 py-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <div class="font-semibold text-gray-800">알림</div>
                <button class="text-xs text-gray-400 hover:text-black" @click="clearAllNotifications">
                  전체삭제
                </button>
              </div>
              <div class="divide-y divide-gray-100 max-h-[300px] overflow-y-auto">
                <div
                  v-for="(noti, index) in notifications"
                  :key="noti.id"
                  class="px-4 py-3 text-sm hover:bg-gray-50 cursor-pointer flex justify-between items-start gap-2"
                  :class="noti.isRead ? 'text-gray-500 font-normal' : 'text-black font-semibold'"
                >
                  <div @click="markAsRead(index)" class="w-[80%]">
                    {{ noti.content }}
                  </div>
                  <div class="flex flex-col items-end gap-1">
                    <span class="text-xs text-gray-400">{{ noti.createdAt }}</span>
                    <button @click.stop="deleteNotification(index)" class="text-gray-400 hover:text-red-500">
                      <Icon icon="tabler:trash" class="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
            <button><img src="@/assets/icons/logout.svg" alt="로그아웃" class="w-6 h-6 cursor-pointer" /></button>
          </div>
        </div>
      </div>
    </header>

    <!-- 드롭다운 -->
    <div
      v-if="currentMenu"
      class="absolute top-[90px] left-0 w-full bg-white border-t border-gray-medium py-5 px-[310px] text-md"
    >
      <div class="flex flex-row gap-20">
        <button
          v-for="(subPath, subLabel) in menuMap[currentMenu].routes"
          :key="subLabel"
          @click="navigateTo(currentMenu, subLabel)"
          :class="[
        'transition-colors duration-200 hover:text-header-text w-max',
        selectedSubMenu === subLabel ? 'text-header-text' : 'text-gray-medium'
      ]"
        >
          {{ subLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
