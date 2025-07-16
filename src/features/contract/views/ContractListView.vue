<script setup>
import { ref, onMounted } from 'vue';
import ContractFiltering from '@/features/contract/components/ContractFiltering.vue';
import PasswordModal from '@/features/contract/components/PasswordModal.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import {
  downloadContractFile,
  fetchContractFile,
  fetchContractSuccessList
} from '@/features/contract/api';
import ContractUploadModal from '@/features/contract/components/ContractUploadModal.vue';
import { useToast } from 'vue-toastification';

const toast = useToast();

const currentPage = ref(1);
const pageSize = 10;
const totalPages = ref(0);
const totalCount = ref(0);
const contractList = ref([]);
const searchModel = ref({
  searchType: 'all',
  keyword: '',
  registrationStatus: 'all',
});

const showModal = ref(false);
const selectedContractId = ref(null);
const showUploadModal = ref(false);
const selectedContractIdForUpload = ref(null);

const openUploadModal = (contractId) => {
  selectedContractIdForUpload.value = contractId;
  showUploadModal.value = true;
};

const handleUploadSuccess = () => {
  showUploadModal.value = false;
  loadContracts();
};

const loadContracts = async () => {
  try {
    const { data } = await fetchContractSuccessList({
      page: currentPage.value,
      size: pageSize,
      searchType: searchModel.value.searchType,
      keyword: searchModel.value.keyword,
      registrationStatus:
        searchModel.value.registrationStatus === 'all'
          ? null
          : searchModel.value.registrationStatus,
    });
    contractList.value = data.data.contractSuccess;
    totalPages.value = data.data.pagination.totalPage;
    totalCount.value = data.data.pagination.totalCount;
  } catch (err) {
    console.error('계약 완료 목록 조회 실패:', err);
  }
};

const handleSearch = (filters) => {
  searchModel.value = filters;
  currentPage.value = 1;
  loadContracts();
};

const handlePageChange = (page) => {
  currentPage.value = page;
  loadContracts();
};

const openPasswordModal = (id) => {
  selectedContractId.value = id;
  showModal.value = true;
};

const handlePasswordSubmit = async (password) => {
  if (!selectedContractId.value) return;

  try {
    const { data } = await fetchContractFile(selectedContractId.value, password);
    const file = data.data.contractView[0];
    showModal.value = false;

    const fileKey = file.key || file.filePath;
    if (!fileKey) {
      toast.error('파일 경로가 존재하지 않습니다.');
      return;
    }

    const res = await downloadContractFile(fileKey);
    const blob = new Blob([res.data], { type: res.headers['content-type'] });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.download =
      file.originalName ||
      'contract.pdf';
    link.click();
    window.URL.revokeObjectURL(url);

    showModal.value = false;
  } catch (err) {
    toast.error('비밀번호가 올바르지 않거나 다운로드에 실패했습니다.');
  }
};

onMounted(() => {
  loadContracts();
});
</script>

<template>
  <div class="w-full">
    <div class="flex gap-6">
      <ContractFiltering v-model="searchModel" @search="handleSearch" />
      <div class="container">
        <div class="flex justify-between items-center mb-3">
          <div class="flex items-center">
            <div class="page-title">계약 완료 목록</div>
            <span class="cnt-search ml-2">(검색 결과: {{ totalCount }} 건)</span>
          </div>
        </div>

        <div class="blue-line mb-6"></div>

        <div class="overflow-y-auto max-h-[600px]">
          <table class="w-full text-[14px] text-center border-t border-gray-200 table-fixed">
            <thead class="bg-gray-100 text-[14px] border-t border-gray-300 sticky top-0 z-10">
            <tr>
              <th class="py-2 w-[200px]">캠페인명</th>
              <th class="w-[100px]">상품명</th>
              <th class="w-[80px]">고객사명</th>
              <th class="w-[120px]">인플루언서명</th>
              <th class="w-[150px]">수정일</th>
              <th class="w-[80px]">계약서</th>
            </tr>
            </thead>
            <tbody>
            <tr
              v-for="(item, index) in contractList"
              :key="index"
              class="border-b border-gray-200"
            >
              <td class="py-2 px-2 truncate max-w-[160px]" :title="item.campaignName">
                {{ item.campaignName }}
              </td>
              <td class="px-2 truncate max-w-[140px]" :title="item.productName">
                {{ item.productName }}
              </td>
              <td class="px-2 truncate max-w-[140px]" :title="item.clientCompanyName">
                {{ item.clientCompanyName }}
              </td>
              <td class="px-2 truncate max-w-[140px]" :title="item.influencerName">
                {{ item.influencerName }}
              </td>
              <td class="px-2 truncate max-w-[120px]" :title="item.updatedAt">
                {{ item.updatedAt }}
              </td>
              <td class="px-2">
          <span
            v-if="item.fileId"
            class="text-request hover:underline cursor-pointer"
            @click.prevent="openPasswordModal(item.contractId)"
          >
            다운로드
          </span>
                <label
                  v-else
                  class="text-opinion-circle hover:underline cursor-pointer"
                  @click.prevent="openUploadModal(item.contractId)"
                >
                  등록
                </label>
              </td>
            </tr>
            </tbody>
          </table>
        </div>


        <PagingBar
          class="mt-6"
          :total-pages="totalPages"
          :current-page="currentPage"
          @update:currentPage="handlePageChange"
        />
      </div>
    </div>

    <!-- 모달 -->
    <PasswordModal
      v-if="showModal"
      @submit="handlePasswordSubmit"
      @close="showModal = false"
    />
    <ContractUploadModal
      v-if="showUploadModal"
      :contract-id="selectedContractIdForUpload"
      @uploaded="handleUploadSuccess"
      @close="showUploadModal = false"
    />
  </div>
</template>
