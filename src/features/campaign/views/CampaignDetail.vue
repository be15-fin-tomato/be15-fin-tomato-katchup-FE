<script setup>
import { reactive, ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { getCampaignDetail, updateCampaign, deleteCampaign } from '@/features/campaign/api.js'; // ✅ 수정
import { useToast } from 'vue-toastification'; // ✅ 알림용
import { Icon } from '@iconify/vue';

import CampaignForm from '@/features/campaign/components/CampaignForm.vue';
import PipelineDiagram from '@/features/campaign/components/PipelineDiagram.vue';
import CampaignHistory from '@/features/campaign/components/CampaignHistory.vue';

const toast = useToast();
const route = useRoute();
const router = useRouter();
const campaignDetail = ref(null);
const campaignHistory = ref([]);
const form = reactive({});
const isEditing = ref(false);

// form 초기화 함수
function initializeForm(detail) {
  Object.assign(form, {
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

// 캠페인 상세 + 타임라인 조회
const fetchCampaignDetail = async () => {
  const res = await getCampaignDetail(route.params.campaignId);
  const data = res.data.data;

  campaignDetail.value = data.campaignDetail;
  campaignHistory.value = data.timeline;

  // 파이프라인 단계 구성
  const stepMap = {
    1: '기획 인지',
    2: '리스트업',
    3: '제안',
    4: '견적',
    5: '제작',
    6: '계약',
    7: '매출',
  };

  const stepOrder = [1, 2, 3, 4, 5, 6, 7];

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
      startedAt: matched?.startedAt || null,
    };
  });

  campaignDetail.value.pipeLine = {
    stepStatus,
    currentStep,
  };

  initializeForm(campaignDetail.value);
};

onMounted(() => {
  fetchCampaignDetail();
});

// 저장
const save = async () => {
  try {
    const payload = {
      campaignId: route.params.campaignId,
      campaignName: form.title,
      campaignStatusId: form.status,
      clientCompanyId: form.clientCompany?.id,
      clientManagerId: form.clientManager?.id,
      startedAt: formatToDash(form.startedAt),
      endedAt: formatToDash(form.endedAt),
      awarenessPath: form.awarenessPath,
      productName: form.productName,
      productPrice: form.productPrice,
      expectedRevenue: form.expectedRevenue,
      expectedProfitMargin: form.expectedProfitMargin,
      notes: form.notes,
      userList: form.userList.map(u => u.id),
      categoryList: form.category ? [form.category] : [],
    };
    console.log('clientCompany:', form.clientCompany);
    console.log('clientManager:', form.clientManager);

    await updateCampaign(payload);
    toast.success('캠페인이 수정되었습니다.');
    isEditing.value = false;
    await fetchCampaignDetail();
  } catch (e) {
    toast.error(e?.response?.data?.message || '수정 중 오류가 발생했습니다.');
  }
};

// 삭제
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

// 취소
const cancel = () => {
  initializeForm(campaignDetail.value);
  isEditing.value = false;
};

// 필드 그룹 정의
const groups = [
  {
    type: 'horizontal',
    fields: [
      { key: 'title', label: '캠페인명', type: 'input' },
      {
        key: 'status',
        label: '진행 상태',
        type: 'select',
        options: [
          { label: '취소', value: 1 },
          { label: '진행중', value: 2 },
          { label: '보류', value: 3 },
          { label: '게시대기', value: 4 },
          { label: '완료', value: 5 },
        ],
      },
    ],
  },
  {
    type: 'horizontal',
    fields: [
      { key: 'startDate', label: '시작일', inputType: 'date' },
      { key: 'endDate', label: '종료일', inputType: 'date' },
    ],
  },
  {
    type: 'horizontal',
    fields: [
      {
        key: 'clientCompany',
        label: '고객사',
        type: 'search-company',
        searchType: 'company',
      },
      {
        key: 'clientManager',
        label: '광고담당자',
        type: 'search-manager',
        searchType: 'manager',
      },
    ],
  },
  {
    type: 'horizontal',
    fields: [
      {
        key: 'userList',
        label: '고객사 담당자',
        type: 'readonly',
        getValue: (value) => value.map((u) => u.name).join(', '),
      },
    ],
  },
];
</script>

<template>
  <div class="container">
    <!-- 헤더 -->
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

    <!-- 파이프라인 진행상태 -->
    <div class="pipeline flex items-center w-full mb-4">
      <PipelineDiagram
        v-if="campaignDetail?.pipeLine"
        :diagramInfo="campaignDetail.pipeLine"
      />
    </div>

    <!-- 좌우 영역 -->
    <div class="flex">
      <!-- 좌측: 입력 폼 -->
      <div class="w-1/2">
        <CampaignForm v-model="form" :groups="groups" :isEditing="isEditing" />
      </div>

      <!-- 우측: 타임라인 -->
      <div class="w-1/2 bg-gray-50 p-4 rounded shadow">
        <CampaignHistory v-if="campaignHistory?.length" :campaignHistory="campaignHistory" />
      </div>
    </div>
  </div>
</template>
