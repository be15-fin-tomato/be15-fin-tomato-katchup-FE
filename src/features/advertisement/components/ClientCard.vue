<script setup>
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router';

const props = defineProps({
  client: Object
})

const router = useRouter()

const goToDetail = () => {
  router.push(`/management/client/${props.client?.id}`)
}
</script>

<template>
  <div
    class="w-full border border-gray-medium rounded-xl bg-white shadow-sm p-5 hover:bg-gray-100 transition-colors duration-200 cursor-pointer"
    @click="goToDetail"
  >
    <div class="flex justify-between items-start mb-4">
      <div class="flex flex-col justify-between min-h-[80px]">
        <h3 class="text-lg font-semibold text-black">{{ client.name }}</h3>

        <!-- 고객사원 아이콘 -->
        <p class="text-sm text-gray-dark">
          <Icon icon="f7:person-2" class="inline-block mr-0.5" width="18" height="18" />
          ( 총 3명 )
        </p>
        <p class="text-sm text-gray-medium mt-1">{{ client.address }}</p>
      </div>

      <!-- 상태 뱃지 + 메뉴 -->
      <div class="flex flex-col items-end gap-1">
        <!-- 상태 표시 추가 -->
        <p
          class="text-xs font-semibold px-2 py-1 rounded-md"
          :class="{
        'bg-blue-400 text-white': client.status === '잠재고객',
        'bg-green-400 text-white': client.status === '신규고객',
        'bg-yellow-400 text-white': client.status === '기존고객'
      }"
        >
          {{ client.status }}
        </p>

      <button class="text-gray-medium">
        <i class="fas fa-ellipsis-v" />
      </button>
    </div>
  </div>
    <!-- 담당자 아이콘 -->
    <div class="flex justify-between items-end">
      <p class="text-sm text-gray-dark flex items-end leading-none">
        <Icon icon="mdi:person-tie" class="inline-block mr-2 align-text-bottom" width="18" height="18" />
        {{ client.contacts.join(', ') }}
      </p>
      <p class="text-sm font-semibold text-black">{{ client.price }} ₩</p>
    </div>
  </div>
</template>
