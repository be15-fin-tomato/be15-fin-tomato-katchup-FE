<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCampaignDetail, updateCampaign, deleteCampaign } from '@/features/campaign/api.js';
import { useToast } from 'vue-toastification';
import { Icon } from '@iconify/vue';

import CampaignForm from '@/features/campaign/components/CampaignForm.vue';
import PipelineDiagram from '@/features/campaign/components/PipelineDiagram.vue';
import CampaignHistory from '@/features/campaign/components/CampaignHistory.vue';

const campaignFormRef = ref(null);
const toast = useToast();
const route = useRoute();
const router = useRouter();
const campaignDetail = ref(null);
const campaignHistory = ref([]);
const form = ref({});
const isEditing = ref(false);

watch(
  () => form.value.clientCompany?.id,
  (newId, oldId) => {
    if (isEditing.value && newId !== oldId) {
      form.value.clientManager = null;
    }
  }
);

function initializeForm(detail) {
  Object.assign(form.value, {
    title: detail.campaignName,
    status: detail.campaignStatusId,
    clientCompany: {
      id: detail.clientCompanyId,
      name: detail.clientCompanyName,
    },
    clientManager: {
      id: detail.clientManagerId,
      name: detail.clientManagerName,
    },
    address: detail.address,
    detailAddress: detail.detailAddress,
    startedAt: detail.startedAt,
    endedAt: detail.endedAt,
    pipelineId: detail.pipelineId,
    createdAt: detail.createdAt,
    category: detail.categoryList?.[0] || null,
    categoryList: detail.categoryList || [],
    userList: detail.userList || [],
    awarenessPath: detail.awarenessPath,
    productName: detail.productName,
    productPrice: detail.productPrice,
    expectedRevenue: detail.expectedRevenue,
    expectedProfitMargin: detail.expectedProfitMargin,
    notes: detail.notes,
  });
}

function formatToDash(dateStr) {
  if (!dateStr) return null;
  return dateStr.replace(/\./g, '-');
}

const fetchCampaignDetail = async () => {
  const res = await getCampaignDetail(route.params.campaignId);
  const data = res.data.data;

  campaignDetail.value = data.campaignDetail;
  campaignHistory.value = data.timeline;

  const stepMap = {
    1: '기회인지', 2: '리스트업', 3: '제안', 4: '견적', 5: '제작', 6: '계약', 7: '매출', 8:'사후관리',
  };
  const stepOrder = [1, 2, 3, 4, 5, 6, 7, 8];
  const presentedList = data.timeline
    .filter(item => item.presentedAt !== null)
    .sort((a, b) => new Date(b.presentedAt) - new Date(a.presentedAt));
  const currentStep = presentedList[0]?.pipelineStepId ?? null;

  const stepStatus = stepOrder.map(stepId => {
    const matched = data.timeline.find(item => item.pipelineStepId === stepId);
    return {
      pipelineStepId: stepId,
      stepType: stepMap[stepId],
      done: matched?.presentedAt != null,
      createdAt: matched?.createdAt || null,
    };
  });

  campaignDetail.value.pipeLine = { stepStatus, currentStep };
  initializeForm(campaignDetail.value);
};

onMounted(() => {
  fetchCampaignDetail();
});

const save = async () => {
  console.log('[save] 저장 시도');
  if (!campaignFormRef.value) {
    console.error('폼이 없습니다.');
    return;
  }

  const validatedForm = campaignFormRef.value.submit();
  console.log('[save] submit 반환값:', validatedForm); // null이면 유효성 실패

  if (!validatedForm) {
    console.warn('[save] 유효성 검사 실패');
    return;
  }

  try {
    const payload = {
      campaignId: route.params.campaignId,
      campaignName: validatedForm.title,
      campaignStatusId: validatedForm.status,
      clientCompanyId: validatedForm.clientCompany?.id,
      clientManagerId: validatedForm.clientManager?.id,
      startedAt: formatToDash(validatedForm.startedAt),
      endedAt: formatToDash(validatedForm.endedAt),
      awarenessPath: validatedForm.awarenessPath,
      productName: validatedForm.productName,
      productPrice: validatedForm.productPrice,
      expectedRevenue: validatedForm.expectedRevenue,
      expectedProfitMargin: validatedForm.expectedProfitMargin,
      notes: validatedForm.notes,
      userList: validatedForm.userList.map(u => u.id),
      categoryList: validatedForm.categoryList ?? [],
    };

    await updateCampaign(payload);
    toast.success('캠페인이 수정되었습니다.');
    isEditing.value = false;
    await fetchCampaignDetail();
  } catch (e) {
    toast.error(e?.response?.data?.message || '수정 중 오류가 발생했습니다.');
  }
};

const remove = async () => {
  if (!confirm('정말 삭제하시겠습니까?')) return;
  try {
    await deleteCampaign(route.params.campaignId);
    toast.success('캠페인이 삭제되었습니다.');
    router.push('/campaign');
  } catch (e) {
    toast.error(e?.response?.data?.message || '삭제 중 오류가 발생했습니다.');
  }
};

const cancel = async () => {
  initializeForm(campaignDetail.value);
  isEditing.value = false;
  await fetchCampaignDetail();
};

</script>

<template>
  <div class="container">
    <div class="page-header">
      <div class="page-title">캠페인 상세 정보</div>
      <div class="flex justify-end gap-2">
        <button class="btn-delete" @click="isEditing ? cancel() : remove()">
          {{ isEditing ? '취소' : '삭제' }}
        </button>
        <button class="btn-create" @click="isEditing ? save() : (isEditing = true)">
          {{ isEditing ? '저장' : '수정' }}
        </button>
        <Icon
          icon="material-symbols:lists-rounded"
          width="40"
          height="40"
          class="text-btn-gray"
          @click="router.push('/campaign')"
        />
      </div>
    </div>

    <div class="blue-line"></div>

    <div class="pipeline flex items-center w-full mb-4">
      <PipelineDiagram
        v-if="campaignDetail?.pipeLine"
        :diagramInfo="campaignDetail.pipeLine"
      />
    </div>

    <div class="flex">
      <div class="w-1/2">
        <CampaignForm ref="campaignFormRef" v-model="form" :isEditing="isEditing" />
      </div>

      <div class="w-1/2 bg-gray-50 p-4 rounded shadow">
        <CampaignHistory v-if="campaignHistory?.length" :campaignHistory="campaignHistory" />
      </div>
    </div>
  </div>
</template>
