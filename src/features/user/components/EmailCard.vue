<script setup>
import { computed, ref } from 'vue';
import { Icon } from '@iconify/vue'
import SatisfactionScoreModal from '@/features/user/components/SatisfactionScoreModal.vue';

defineProps({
  emailList: {
    type: Object,
    required: true,
  },
});

const showModal = ref(false)

// 모달 내부에서 사용할 목데이터 (20개)
const scoreList = ref(
  Array.from({ length: 20 }, (_, i) => ({
    question: `${i + 1}. 인플루언서가 메시지나 연락에 빠르게 응답해주었나요?`,
    score: Math.floor(Math.random() * 5) + 1,
  }))
)

const totalScore = computed(() =>
  scoreList.value.reduce((sum, item) => sum + item.score, 0)
)

const comment = ref('응답이 빨라서 캠페인 진행이 원활했어요.')
</script>

<template>
  <div
    class="grid grid-cols-3 w-full border border-gray-medium bg-white shadow-sm p-5 hover:bg-gray-100 transition-colors duration-200"
  >
    <!-- 왼쪽: 이미지 -->
    <div class="flex flex-col justify-between min-h-[80px]">
      <img src="@/assets/images/mock/EmailSystem.png" width="125" />
      <div class="mt-3 text-sm text-gray-700">
        <div class="flex items-center gap-2 text-gray-400 mb-3">
          <Icon icon="lucide:user" width="20" height="20" />
          <span><p class="text-gray-medium">{{ emailList.artist_name }}</p></span>
        </div>
        <div class="flex items-center gap-2 text-gray-400 mb-3">
          <Icon icon="lucide:user" width="20" height="20" />
          <span><p class="text-gray-medium">{{ emailList.contacts }}</p></span>
        </div>
      </div>
      <div class="mt-1 text-lg">
        <p class="font-semibold">{{ emailList.campaign_name }}</p>
      </div>
    </div>

    <!-- 가운데: 텍스트 정보 -->
    <div class="flex flex-col justify-start gap-1 text-sm text-black">
      <p class="text-lg font-bold mb-2">{{ emailList.client_name }}</p>
      <div class="flex items-center gap-2 text-gray-400 mb-1">
        <Icon icon="f7:building" width="20" height="20" />
        <span><p class="text-sm font-bold text-gray-medium">{{ emailList.clientCompany_name }}</p></span>
      </div>
      <div class="flex items-center gap-2 text-gray-400">
        <Icon icon="mynaui:telephone" width="20" height="20" />
        <span><p class="text-sm font-bold text-gray-medium">{{ emailList.client_email }}</p></span>
      </div>
    </div>

    <!-- 오른쪽 버튼들 -->
    <div class="flex justify-center items-center">
      <div class="flex flex-col items-end gap-5">
        <button class="bg-white border-2 border-btn-sky text-sm px-2 py-3 rounded hover:bg-btn-sky">
          만족도 평가 요청
        </button>
        <button
          @click="showModal = true"
          class="bg-white border-2 border-btn-sky text-sm px-2 py-3 rounded hover:bg-btn-sky"
        >
          만족도 평가 조회
        </button>
        <button class="bg-white border-2 border-btn-sky text-sm px-2 py-3 rounded hover:bg-btn-sky">
          성과 보고서 전송
        </button>
      </div>
    </div>
  </div>
  <SatisfactionScoreModal
    v-if="showModal"
    :score-list="scoreList"
    :total-score="totalScore"
    :comment="comment"
    @close="showModal = false"
  />
</template>
