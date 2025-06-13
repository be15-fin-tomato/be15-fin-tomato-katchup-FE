<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const router = useRouter()
const route = useRoute()

const hoveredMenu = ref('')
const activeMenu = ref('')

const menuMap = {
  influencer: {
    label: '인플루언서',
    routes: {
      '인플루언서 목록': '/influencer/list',
      'AI 추천 매칭': '/influencer/recommendation',
    }
  },
  campaign: {
    label: '캠페인',
    routes: {
      '파이프라인': '/campaign/pipeline'
    }
  },
  sales: {
    label: '영업관리',
    routes: {
      '리스트업': '/sales/listup',
      '제안': '/sales/proposal',
      '견적': '/sales/estimate',
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
      '인플루언서 관리': '/management/influencer',
      '이메일 시스템': '/management/email',
      '만족도 조사': '/management/survey'
    }
  }
}

const selectedMenu = computed(() => {
  const path = route.path
  for (const [menu, { routes }] of Object.entries(menuMap)) {
    for (const [subMenu, subPath] of Object.entries(routes)) {
      if (path.startsWith(subPath)) return menu
    }
  }
  return ''
})

const selectedSubMenu = computed(() => {
  const path = route.path
  for (const { routes } of Object.values(menuMap)) {
    for (const [subMenu, subPath] of Object.entries(routes)) {
      if (path.startsWith(subPath)) return subMenu
    }
  }
  return ''
})

function selectSubMenu(menu, subMenu) {
  activeMenu.value = menu
  router.push(menuMap[menu].routes[subMenu])
}
</script>

<template>
  <div class="relative w-full font-display font-semibold text-gray-medium" @mouseleave="hoveredMenu = ''">
    <header class="w-full bg-white border-b border-gray-medium text-lg">
      <div class="flex justify-between items-center h-[90px]">
        <!-- 로고 -->
        <button class="ml-10 cursor-pointer" @click="router.push('/')">
          <img src="@/assets/icons/logo.png" alt="logo" class="h-[220px] select-none" />
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
          <div class="flex items-center gap-3">
            <img class="w-10 h-10 rounded-full" src="@/assets/icons/profile.png" alt="프로필" />
            <div class="flex flex-col text-sm">
              <div class="font-bold text-black">차은우</div>
              <div class="text-xs text-black">팀장</div>
            </div>
          </div>
          <div class="flex items-center ml-4 gap-4">
            <button><img src="@/assets/icons/calendar.svg" alt="캘린더" class="w-6 h-6" /></button>
            <button><img src="@/assets/icons/alarm.svg" alt="알림" class="w-6 h-6" /></button>
            <button><img src="@/assets/icons/logout.svg" alt="로그아웃" class="w-6 h-6" /></button>
          </div>
        </div>
      </div>
    </header>

    <!-- 드롭다운 -->
    <div
      v-if="hoveredMenu || selectedMenu"
      class="absolute top-[90px] left-0 w-full bg-white border-t border-gray-medium py-5 px-[310px] text-md z-[999]"
    >
      <div class="flex flex-row gap-20">
        <button
          v-for="(subPath, subLabel) in menuMap[hoveredMenu || selectedMenu].routes"
          :key="subLabel"
          @click="selectSubMenu(hoveredMenu || selectedMenu, subLabel)"
          :class="[
              'transition-colors duration-200 hover:text-header-text',
              'w-max',
              selectedSubMenu === subLabel ? 'text-header-text' : 'text-gray-medium'
          ]"
        >
          {{ subLabel }}
        </button>
      </div>
    </div>
  </div>
</template>
