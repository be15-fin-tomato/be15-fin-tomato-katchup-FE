<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  deleteClientCompany,
  getClientCompanyDetail, getClientCompanyUsers,
  updateClientCompany, deleteClientManager, getCampaignsByClientCompany,
  getClientCompanyContracts,getClientCompanyCommunicationHistories
} from '@/features/advertisement/api.js';

import ClientCompanyForm from '@/features/advertisement/components/ClientCompanyForm.vue';
import PipelineCard from '@/features/campaign/components/PipelineCard.vue';
import PdfViewerModal from '@/features/contract/components/PdfViewerModal.vue';
import { Icon } from '@iconify/vue';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const id = Number(route.params.id); // 고객사 ID
const toast = useToast();

const isEditing = ref(false);
const clientFormRef = ref();
const clientData = ref(null);
const users = ref([]);

const campaignList = ref([]); // 캠페인 목록
const contractList = ref([]); // 계약 목록
const communicationHistories = ref([]); // 커뮤니케이션 이력

// 고객사 데이터를 다시 불러오는 함수
const fetchClientCompanyData = async () => {
  try {
    const res = await getClientCompanyDetail(id);
    clientData.value = res.data.data;
    // 사용자 데이터 다시 불러오기
    const userRes = await getClientCompanyUsers(id);
    users.value = userRes.data.data;

    // 캠페인, 계약, 이력 등도 함께 업데이트
    const campaignRes = await getCampaignsByClientCompany(id);  // 고객사 ID로 캠페인 목록 불러오기
    campaignList.value = (campaignRes.data.data || []).map(campaign => ({
      id: Number(campaign.campaignId),
      title: campaign.campaignName,
      ...campaign
    }));

    const contractRes = await getClientCompanyContracts(id);
    contractList.value = (contractRes.data?.data?.clientCompanyContract || []).map(contract => ({
      ...contract,
      revenue: (contract.totalProfit !== null && typeof contract.totalProfit === 'number')
        ? contract.totalProfit
        : ' - ',
      period: (contract.startedAt && contract.endedAt)
        ? `${contract.startedAt} ~ ${contract.endedAt}`
        : '기간 미정',
      influencerName: contract.name || '알 수 없음'
    }));

    const historyRes = await getClientCompanyCommunicationHistories(id);
    communicationHistories.value = (historyRes.data.data || []).map(history => ({
      id: history.id,
      campaignId: Number(history.campaignId),
      campaignName: history.campaignName,

      category: history.pipelineStepName,
      createdAt: history.pipelineCreatedAt, // 파이프라인 생성일 사용
      title: history.pipelineTitle,

      writer: history.managerName,
      department: history.managerDepartment,
      content: history.content,
      feedback: history.notes,
      file: history.fileName,
    }));

  } catch (e) {
    console.error('데이터 다시 불러오기 실패', e);
    toast.error('데이터를 다시 불러오는 데 실패했습니다.');
  }
};

const handleDeleteEmployee = async (employeeIdToDelete) => {
  const confirmDelete = confirm('정말 이 사원을 삭제하시겠습니까?');
  if (!confirmDelete) return;

  try {
    await deleteClientManager(employeeIdToDelete);

    toast.success('사원이 삭제되었습니다.');
    await fetchClientCompanyData();
    if (clientFormRef.value) {
      clientFormRef.value.closeEmployeeForm();
    }
  } catch (err) {
    console.error('사원 삭제 실패:', err);
    toast.error('사원 삭제에 실패했습니다.');
  }
};

const selectedCampaignId = ref(null);
const selectedMsg = ref(null);

// 선택된 캠페인에 따라 필터링된 이력
const filteredHistories = computed(() => {
  const historiesWithoutListup = communicationHistories.value.filter(
    (h) => h.category !== '리스트업' // '리스트업'인 경우 제외
  );

  return selectedCampaignId.value === null
    ? historiesWithoutListup
    : historiesWithoutListup.filter(
      (h) => h.campaignId === selectedCampaignId.value
    );
});

// PDF Viewer 관련
const isPdfModalOpen = ref(false);
const selectedPdfFile = ref('');

const selectCampaign = (id) => {
  selectedCampaignId.value = id;

  if (id === null) {
    selectedMsg.value = null; // 전체 보기 모드
  } else {
    const firstMatch = communicationHistories.value.find(
      (h) => h.campaignId === id
    );
    selectedMsg.value = firstMatch || null;
  }
};

const openPdfViewer = (file) => {
  selectedPdfFile.value = file;
  isPdfModalOpen.value = true;
};

onMounted(async () => {
  await fetchClientCompanyData();
});

const save = async () => {
  const payload = clientFormRef.value.getFormData();
  if (!payload) return;

  try {
    await updateClientCompany(id, payload);
    isEditing.value = false;
    await fetchClientCompanyData(); // 저장 후에도 데이터 갱신
    toast.success('고객사 정보가 저장되었습니다.');
  } catch (e) {
    console.error('저장 실패', e);
    toast.error('저장에 실패했습니다.');
  }
};

const cancel = () => {
  isEditing.value = false;
  fetchClientCompanyData();
};

const handleDeleteCompany = async () => {
  const confirmDelete = confirm('정말로 이 고객사를 삭제하시겠습니까?');
  if (!confirmDelete) return;

  try {
    await deleteClientCompany(id);
    toast.success('고객사가 삭제되었습니다.');
    router.push('/management/client');
  } catch (e) {
    console.error('삭제 실패', e);
    toast.error('삭제 중 오류가 발생했습니다.')
  }
};
</script>

<template>
  <!-- 상단 고객사 상세 -->
  <div class="flex justify-center">
    <div class="flex-1 flex flex-col gap-8">
      <div class="container">
        <!-- 헤더 -->
        <div class="page-header">
          <div class="page-title">고객사 상세</div>
          <div class="flex items-center gap-3">
            <template v-if="isEditing">
              <button class="btn-delete" @click="cancel">취소</button>
              <button class="btn-create" @click="save">저장</button>
            </template>
            <template v-else>
              <button class="btn-delete" @click="handleDeleteCompany">삭제</button>
              <button class="btn-edit" @click="isEditing = true">수정</button>
            </template>
            <Icon
              icon="material-symbols:lists-rounded"
              width="48"
              height="48"
              class="text-btn-blue cursor-pointer"
              @click="router.push('/management/client')"
            />
          </div>
        </div>
        <div class="blue-line"></div>

        <!-- 폼 -->
        <ClientCompanyForm
          v-if="clientData && users.length > 0"
          :isEditing="isEditing"
          :initialData="clientData"
          :users="users"
          @delete-employee="handleDeleteEmployee"
          ref="clientFormRef"
        />
      </div>
    </div>
  </div>

  <!-- 캠페인 진행 현황 -->
  <div class="container bg-white pt-4 pb-6 mt-12">
    <p class="font-bold mb-2">캠페인 진행 현황 ({{ campaignList.length }})</p>
    <div class="blue-line mb-4" />
    <div class="max-h-[500px] overflow-y-auto pr-2">
      <PipelineCard :campaigns="campaignList" />
    </div>
  </div>

  <!-- 캠페인 계약 목록 -->
  <div class="container bg-white pt-4 pb-6 mt-12">
    <p class="font-bold mb-2">캠페인 계약 목록</p>
    <div class="blue-line mb-4" />

    <div class="max-h-[400px] overflow-y-auto pr-2">
      <table class="w-full table-auto border-collapse text-sm">
        <thead class="text-white text-center text-sm">
        <tr class="bg-btn-blue rounded-lg overflow-hidden">
          <th class="px-4 py-2 rounded-l-lg">캠페인명</th>
          <th class="px-4 py-2">상품명</th>
          <th class="px-4 py-2">인플루언서</th>
          <th class="px-4 py-2">수익</th>
          <th class="px-4 py-2">기간</th>
          <th class="px-4 py-2 rounded-r-lg">성과</th>
        </tr>
        </thead>
        <tbody>
        <tr
          v-for="(c, i) in contractList"
          :key="i"
          class="h-[46px] text-center border-b border-gray-200 even:bg-gray-50"
        >
          <td class="px-4 whitespace-nowrap">{{ c.campaignName }}</td>
          <td class="px-4 whitespace-nowrap">{{ c.productName }}</td>
          <td class="px-4 whitespace-nowrap">{{ c.influencerName }}</td>
          <td class="px-4 whitespace-nowrap">
            {{ typeof c.revenue === 'number' ? `${c.revenue.toLocaleString()} ₩` : c.revenue }}
          </td>
          <td class="px-4 whitespace-nowrap">{{ c.period }}</td>
          <td class="px-4 whitespace-nowrap">
            <RouterLink
              :to="`/campaign/dashboard/${c.pipelineInfluencerId}`"
              class="text-primary underline hover:font-medium"
            >
              보러가기
            </RouterLink>
          </td>
        </tr>
        <tr v-if="contractList.length === 0">
          <td colspan="6" class="py-4 text-center text-gray-500">
            조회된 계약 정보가 없습니다.
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  </div>

  <!-- 커뮤니케이션 이력 -->
  <div class="container bg-white pt-4 pb-6 mt-12">
    <p class="font-bold mb-2">커뮤니케이션 이력</p>
    <div class="blue-line mb-4" />

    <div class="grid grid-cols-4 gap-6">
      <!-- 왼쪽: 캠페인 목록 -->
      <div class="col-span-1 flex flex-col gap-2 max-h-[500px] overflow-y-auto pr-1">
        <button
          class="w-full text-left rounded-lg text-sm font-medium border transition-all duration-150 hover:bg-gray-100 px-4 py-3
               flex items-center justify-center text-center h-12 min-h-12"
          :class="{
          'bg-[#e6f0ff] border-[#5b8cff] text-[#00274A] font-semibold': selectedCampaignId === null,
          'border-[var(--color-gray-medium)] text-gray-800': selectedCampaignId !== null,
        }"
          @click="selectedCampaignId = null"
        >
          전체
        </button>

        <button
          v-for="c in campaignList"
          :key="c.id"
          class="w-full text-left rounded-lg text-sm font-medium border transition-all duration-150 hover:bg-gray-100 px-4 py-3
               flex items-center justify-center text-center truncate h-12 min-h-12"
          :class="{
          'bg-[#e6f0ff] border-[#5b8cff] text-[#00274A] font-semibold': selectedCampaignId === c.id,
          'border-[var(--color-gray-medium)] text-gray-800': selectedCampaignId !== c.id,
        }"
          @click="selectCampaign(c.id)"
          :title="c.title"
        >
          <div class="truncate overflow-hidden text-ellipsis whitespace-nowrap px-2">
            {{ c.title }}
          </div>
        </button>

        <p v-if="campaignList.length === 0" class="text-center text-gray-500 text-sm mt-4">
          조회된 캠페인이 없습니다.
        </p>
      </div>

      <!-- 중앙: 이력 목록 -->
      <div class="col-span-1 space-y-2 max-h-[500px] overflow-y-auto pr-1" :key="selectedCampaignId">
        <button
          v-for="item in filteredHistories"
          :key="item.id"
          @click="selectedMsg = item"
          class="w-full text-left rounded-lg text-sm font-medium border transition-all duration-150 hover:bg-gray-100 px-4 py-3"
          :class="{
          'bg-[#e6f0ff] border-[#5b8cff] text-[#00274A]':
            selectedMsg && selectedMsg.id === item.id,
          'border-[var(--color-gray-medium)] text-gray-800':
            !selectedMsg || selectedMsg.id !== item.id,
        }"
        >
          <div class="flex justify-between items-center mb-1">
            <span class="font-semibold text-sm">{{ item.category }}</span>
            <span class="text-xs text-gray-500">{{ item.createdAt }}</span>
          </div>
          <p class="text-sm font-medium mb-1">{{ item.title }}</p>
          <p class="text-xs text-gray-500">
            <template v-if="item.writer || item.department">
              {{ item.writer }}<span v-if="item.writer && item.department"> / </span>{{ item.department }}
            </template>
            <template v-else>정보 없음</template>
          </p>
        </button>

        <p v-if="filteredHistories.length === 0" class="text-center text-gray-500 text-sm mt-4">
          조회된 커뮤니케이션 이력이 없습니다.
        </p>
      </div>

      <!-- 오른쪽: 상세 보기 -->
      <div
        v-if="selectedMsg"
        class="col-span-2 border rounded-lg shadow-sm bg-white space-y-3 max-h-[500px] overflow-y-auto px-8 py-4"
        style="border-color: var(--color-gray-medium)"
      >
        <!-- 제목 -->
        <div class="flex items-start justify-between mb-2">
          <div class="flex items-center gap-2">
          <span
            class="px-3 py-1 rounded-full text-white text-xs font-semibold shadow-sm"
            :class="{
              'bg-pipeline-proposal': selectedMsg.category === '제안',
              'bg-pipeline-negotiation': selectedMsg.category === '협상',
              'bg-pipeline-contract': selectedMsg.category === '계약',
              'bg-pipeline-quotation': selectedMsg.category === '견적',
              'bg-pipeline-list-up': selectedMsg.category === '리스트업',
              'bg-pipeline-chance': selectedMsg.category === '기회인지',
              'bg-pipeline-revenue': selectedMsg.category === '매출',
            }"
          >
            {{ selectedMsg.category }}
          </span>
            <h3 class="text-base font-bold text-[#1A1A1A] truncate self-center">
              {{ selectedMsg.title }}
            </h3>
          </div>
          <div class="text-xs text-gray-400 whitespace-nowrap text-right self-center">
            작성일 : {{ selectedMsg.createdAt }}
          </div>
        </div>

        <hr style="border-color: var(--color-gray-medium)" />

        <div class="w-full">
          <h4 class="text-sm font-medium text-gray-600 mb-1">담당자</h4>
          <p class="text-sm text-gray-800">
            <template v-if="selectedMsg.writer || selectedMsg.department">
              {{ selectedMsg.writer }}
              <span v-if="selectedMsg.writer && selectedMsg.department"> / </span>
              {{ selectedMsg.department }}
            </template>
            <template v-else>정보 없음</template>
          </p>
        </div>

        <div class="w-full">
          <h4 class="text-sm font-medium text-gray-600 mb-1">내용</h4>
          <div
            class="rounded px-3 py-2 bg-gray-50 text-sm text-gray-700 whitespace-pre-line w-full text-left"
            style="border: 1px solid var(--color-gray-medium)"
          >
            {{ selectedMsg.content || '내용 없음' }}
          </div>
        </div>

        <div class="w-full">
          <h4 class="text-sm font-medium text-gray-600 mb-1">피드백</h4>
          <div
            class="rounded px-3 py-2 bg-gray-50 text-sm text-gray-700 whitespace-pre-line w-full text-left"
            style="border: 1px solid var(--color-gray-medium)"
          >
            {{ selectedMsg.feedback || '피드백 없음' }}
          </div>
        </div>

        <div v-if="selectedMsg.file" class="w-full">
          <h4 class="text-sm font-medium text-gray-600 mb-1">첨부파일</h4>
          <button
            class="flex items-center gap-2 px-3 py-2 border rounded text-sm text-gray-700 hover:bg-[#f5faff] transition"
            style="border: 1px solid var(--color-gray-medium)"
            @click="openPdfViewer(selectedMsg.file)"
          >
            <Icon icon="material-symbols:attach-file" width="18" height="18" />
            {{ selectedMsg.file }}
          </button>
        </div>
      </div>

      <div
        v-else
        class="col-span-2 flex items-center justify-center text-gray-400 border rounded py-24 max-h-[500px]"
      >
        목록에서 항목을 선택해 주세요
      </div>
    </div>
  </div>

  <!-- PDF 모달 -->
  <PdfViewerModal
    v-if="isPdfModalOpen"
    :pdf-url="`/pdf/${selectedPdfFile}`"
    @close="isPdfModalOpen = false"
  />
</template>

<style scoped>

</style>
