<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import UserPanel from '@/components/common/UserPanel.vue';

const router = useRouter()
const route = useRoute()

const hoveredMenu = ref('')
const activeMenu = ref('')

const menuMap = {
  dashboard: {
    label: '대시보드',
    routes: {
      '인플루언서 분석': '/influencer/list',
      '캠페인 성과': '/campaign/dashboard',
    }
  },
  campaign: {
    label: '캠페인',
    routes: {
      '파이프라인': '/campaign',
      '리스트업': '/sales/listup',
      '제안': '/sales/proposal',
      '견적': '/sales/quotation',
      '계약': '/sales/contract',
      '매출': '/sales/revenue'
    }
  },
  influencer: {
    label: '인플루언서',
    routes: {
      '인플루언서 관리': '/management/influencer',
      'AI 추천 매칭': '/influencer/recommendation',
    }
  },
  management: {
    label: '고객사',
    routes: {
      '고객사 목록': '/management/client',
      '만족도': '/management/email',
      '만족도 현황': '/management/survey'
    }
  },
  contract: {
    label: '계약관리',
    routes: {
      '계약서 목록': '/contract/list',
      '이메일 시스템': '/contract/template'
    }
  },
}

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

function handleTopMenuClick(menu) {
  const firstSubMenu = Object.keys(menuMap[menu].routes)[0]
  navigateTo(menu, firstSubMenu)
}
</script>


<template>
  <div class="relative w-full font-semibold text-gray-medium" @mouseleave="hoveredMenu = ''">
    <header class="w-full bg-white border-b border-gray-medium text-lg">
      <div class="flex justify-between items-center h-[100px]">
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
                @click="handleTopMenuClick(menu)"
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
        <UserPanel />
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
