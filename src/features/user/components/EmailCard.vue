<script setup>
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import { useToast } from 'vue-toastification';
import SatisfactionScoreModal from '@/features/user/components/SatisfactionScoreModal.vue';
import {
  fetchSatisfactionScore,
  saveSatisfactionResult,
  sendSatisfactionRequest
} from '@/features/user/api.js';

const props = defineProps({
  emailList: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['refreshList']);
const showModal = ref(false);
const toast = useToast();

const scoreList = ref([]);
const totalScore = ref(0);
const comment = ref('');
const isRequesting = ref(false);
const isFetching = ref(false);

const requestSatisfaction = async () => {
  if (isRequesting.value) return;
  isRequesting.value = true;

  try {
    await sendSatisfactionRequest(props.emailList.satisfaction_id);
    toast.success('만족도 조사 요청 이메일이 전송되었습니다.');
    props.emailList.email_status = 'Y';
    emit('refreshList');
  } catch (err) {
    console.error('요청 실패', err);
    toast.error(err.response?.data?.message || '요청 중 오류가 발생했습니다.');
  } finally {
    isRequesting.value = false;
  }
};

const handleClick = async () => {
  if (props.emailList.email_status === 'N' || isFetching.value) return;
  isFetching.value = true;

  try {
    await saveSatisfactionResult(props.emailList.satisfaction_id);

    const { data } = await fetchSatisfactionScore(props.emailList.satisfaction_id);
    const { questionsScores, score, notes } = data.data;

    scoreList.value = Object.entries(questionsScores).map(([question, score]) => ({
      question,
      score,
    }));

    totalScore.value = score;
    comment.value = notes;

    showModal.value = true;
  } catch (err) {
    console.error('평가 조회 실패', err);
    toast.error(err.response?.data?.message || '아직 만족도 조사를 진행하지 않았습니다.');
  } finally {
    isFetching.value = false;
  }
};

</script>

<template>
  <div class="grid grid-cols-3 w-full border border-gray-medium bg-white shadow-sm p-5 hover:bg-gray-100 transition-colors duration-200">
    <!-- 좌측 -->
    <div class="flex flex-col justify-between min-h-[80px]">
      <img src="/tomato.png" width="100" alt="기본이미지" />
      <div class="mt-3 text-sm text-gray-700">
        <div class="flex items-center gap-2 text-gray-400 mb-3">
          <Icon icon="lucide:user" width="20" height="20" />
          <p class="text-gray-medium">{{ emailList.artist_name }}</p>
        </div>
        <div class="flex items-center gap-2 text-gray-400 mb-3">
          <Icon icon="lucide:user" width="20" height="20" />
          <p class="text-gray-medium">{{ emailList.contacts }}</p>
        </div>
      </div>
      <div class="mt-1 text-lg font-semibold">
        {{ emailList.campaign_name }}
      </div>
    </div>

    <!-- 중앙 -->
    <div class="flex flex-col justify-start gap-1 text-sm text-black">
      <p class="text-lg font-bold mb-2 break-words">{{ emailList.client_name }}</p>
      <div class="flex items-center gap-2 text-gray-400 mb-1 break-words">
        <Icon icon="f7:building" class="min-w-[20px] min-h-[20px]" />
        <span class="text-sm font-bold text-gray-medium">{{ emailList.clientCompany_name }}</span>
      </div>
      <div class="flex items-center gap-2 text-gray-400 mb-1 break-words">
        <Icon icon="mynaui:telephone" class="min-w-[20px] min-h-[20px]" />
        <span class="text-sm font-bold text-gray-medium">{{ emailList.client_email }}</span>
      </div>
    </div>

    <!-- 우측 -->
    <div class="flex justify-center items-end">
      <div class="flex flex-col items-end gap-5">
        <!-- 요청 버튼 -->
        <button
          @click="requestSatisfaction"
          :disabled="emailList.email_status === 'Y' || isRequesting"
          :class="[
        'border-2 text-sm px-2 py-3 rounded w-[160px] flex justify-center items-center gap-1',
        emailList.email_status === 'Y' || isRequesting
          ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
          : 'border-btn-sky hover:bg-btn-sky'
      ]"
        >
          <Icon v-if="isRequesting" icon="eos-icons:loading" class="animate-spin" />
          {{ isRequesting ? '요청 중...' : '만족도 평가 요청' }}
        </button>

        <!-- 조회 버튼 -->
        <button
          @click="handleClick"
          :disabled="emailList.email_status === 'N' || isFetching"
          :class="[
        'border-2 text-sm px-2 py-3 rounded w-[160px] flex justify-center items-center gap-1',
        emailList.email_status === 'N' || isFetching
          ? 'border-gray-300 text-gray-400 bg-gray-100 cursor-not-allowed'
          : 'border-btn-sky hover:bg-btn-sky'
      ]"
        >
          <Icon v-if="isFetching" icon="eos-icons:loading" class="animate-spin" />
          {{ isFetching ? '조회 중...' : '만족도 평가 조회' }}
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
