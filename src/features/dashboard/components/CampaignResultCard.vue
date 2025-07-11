<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  managementOption: {
    type: Object,
    required: true,
  },
  openMenuId: {
    type: [Number, String, null],
    default: null,
  },
  pageType: {
    type: String,
    default: '',
  },
});

const emit = defineEmits(['menuToggle', 'delete']);

const isMenuOpen = computed(() => props.openMenuId === props.managementOption.pipelineId);

const toggleCardMenu = () => {
  emit('menuToggle', props.managementOption.pipelineId);
};

const deleteCard = () => {
  if (confirm('정말로 이 항목을 삭제하시겠습니까?')) {
    emit('delete', props.managementOption.pipelineId);
  }
};

const cardData = computed(() => props.managementOption);

// 날짜 포맷팅 함수 (템플릿에 사용되므로 여기에 있어야 합니다)
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
};
</script>

<template>
  <div class="border border-gray-200 rounded-lg overflow-hidden shadow-sm cursor-pointer transition-transform duration-200 ease-in-out bg-white flex flex-col hover:translate-y-[-3px]">
    <div class="p-5 flex flex-col flex-grow">
      <div class="flex justify-between items-start mb-4">
        <h3 class="text-xl font-semibold text-gray-800 leading-tight flex-grow pr-5">{{ cardData.campaignName }}</h3>
        <span class="relative text-2xl cursor-pointer text-gray-600 p-1 rounded hover:bg-gray-100 transition-colors" @click.stop="toggleCardMenu">
          &#8942;
          <div v-if="isMenuOpen" class="absolute top-full right-0 bg-white border border-gray-300 rounded-md shadow-lg z-10 min-w-[100px] overflow-hidden" @click.stop>
            <div class="px-4 py-2 cursor-pointer text-sm text-gray-700 whitespace-nowrap hover:bg-gray-50" @click="deleteCard">삭제</div>
          </div>
        </span>
      </div>
      <div class="text-base text-gray-600">
        <p class="mb-2"><strong>고객사:</strong> {{ cardData.clientCompanyName }}</p>
        <p class="mb-2"><strong>상품명:</strong> {{ cardData.productName }}</p>
        <p class="mb-2"><strong>인플루언서:</strong> {{ cardData.influencerName }}</p>
        <p class="mb-2"><strong>담당자:</strong> {{ cardData.clientName }}</p>
        <p class="mt-4 text-sm text-gray-500 text-right">등록일: {{ cardData.registrationDate ? formatDate(cardData.registrationDate) : 'N/A' }}</p>
      </div>
    </div>
  </div>
</template>
