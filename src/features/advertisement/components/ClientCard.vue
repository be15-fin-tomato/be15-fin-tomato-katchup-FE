<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  client: Object
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/management/client/${props.client.clientCompanyId}`)
}
</script>

<template>
  <div
    class="w-full border border-gray-medium rounded-xl bg-white shadow-sm p-5 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
    @click="goToDetail"
  >
    <div class="flex justify-between items-start mb-4">
      <div class="flex flex-col justify-between min-h-[80px]">
        <!-- 고객사명 -->
        <h3 class="text-lg font-semibold text-black">
          {{ client.clientCompanyName }}
        </h3>

        <!-- 직원 수 -->
        <p class="text-sm text-gray-dark">
          <Icon icon="f7:person-2" class="inline-block mr-0.5" width="18" height="18" />
          ( 총 {{ client.employeeCount }}명 )
        </p>

        <!-- 주소 -->
        <p class="text-sm text-gray-medium mt-1">
          {{ client.address }} {{ client.detailAddress }}
        </p>
      </div>

      <!-- 상태 뱃지 -->
      <div class="flex flex-col items-end gap-1">
        <p
          class="text-xs font-semibold px-2 py-1 rounded-md"
          :class="{
            'bg-blue-400 text-white': client.clientCompanyStatusName === '잠재',
            'bg-green-400 text-white': client.clientCompanyStatusName === '신규',
            'bg-yellow-400 text-white': client.clientCompanyStatusName === '기존'
          }"
        >
          {{ client.clientCompanyStatusName }}
        </p>
        <button class="text-gray-medium">
          <i class="fas fa-ellipsis-v" />
        </button>
      </div>
    </div>

    <!-- 담당자 및 매출 -->
    <div class="flex justify-between items-end">
      <p class="text-sm text-gray-dark flex items-end leading-none">
        <Icon icon="mdi:person-tie" class="inline-block mr-2 align-text-bottom" width="18" height="18" />
        {{ client.userName || '담당자 없음' }}
      </p>
      <p class="text-sm font-semibold text-black">
        {{ client.sales?.toLocaleString() || 0 }} ₩
      </p>
    </div>
  </div>
</template>
