<script setup>
import { ref, onMounted } from 'vue';
import ContractFiltering from '@/features/contract/components/ContractFiltering.vue';
import PasswordModal from '@/features/contract/components/PasswordModal.vue';
import PdfViewerModal from '@/features/contract/components/PdfViewerModal.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import { fetchContractSuccessList } from '@/features/contract/api';
import ContractUploadModal from '@/features/contract/components/ContractUploadModal.vue';

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
const showPdf = ref(false);
const selectedContractId = ref(null);
const selectedPassword = ref('');
const showUploadModal = ref(false);
const selectedContractIdForUpload = ref(null);

const openUploadModal = (contractId) => {
  selectedContractIdForUpload.value = contractId;
  showUploadModal.value = true;
};

const handleUploadSuccess = () => {
  showUploadModal.value = false;
  loadContracts(); // 다시 목록 조회
};

const loadContracts = async () => {
  try {
    const { data } = await fetchContractSuccessList({
      page: currentPage.value,
      size: pageSize,
      searchType: searchModel.value.searchType,
      keyword: searchModel.value.keyword,
      registrationStatus: searchModel.value.registrationStatus === 'all' ? null : searchModel.value.registrationStatus,
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

const handlePasswordSubmit = (password) => {
  if (!selectedContractId.value) return;
  selectedPassword.value = password;
  showModal.value = false;
  showPdf.value = true;
};

const handleFileUpload = (event, item) => {
  const file = event.target.files[0];
  if (file) {
    console.log(`파일 업로드됨: ${file.name}`);
    item.status = '보기';
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

        <table class="w-full text-[14px] text-center border-t border-gray-200">
          <thead class="bg-gray-100 text-[14px] border-t border-gray-300">
          <tr>
            <th class="py-2">캠페인명</th>
            <th>상품명</th>
            <th>고객사명</th>
            <th>인플루언서명</th>
            <th>수정일</th>
            <th>계약서</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="(item, index) in contractList"
            :key="index"
            class="border-b"
          >
            <td class="py-2">{{ item.campaignName }}</td>
            <td>{{ item.productName }}</td>
            <td>{{ item.clientCompanyName }}</td>
            <td>{{ item.influencerName }}</td>
            <td>{{ item.updatedAt }}</td>
            <td>
                <span
                  v-if="item.fileId"
                  class="text-request hover:underline cursor-pointer"
                  @click.prevent="openPasswordModal(item.contractId)"
                >
                  보기
                </span>
              <label
                v-else
                class="text-opinion-circle hover:underline cursor-pointer"
                @click.prevent="openUploadModal(item.contractId)"
              >
                등록
                <input
                  type="file"
                  class="hidden"
                  @change="handleFileUpload($event, item)"
                />
              </label>
            </td>
          </tr>
          </tbody>
        </table>

        <PagingBar
          class="mt-6"
          :total-pages="totalPages"
          :current-page="currentPage"
          @update:currentPage="handlePageChange"
        />
      </div>
    </div>

    <PasswordModal v-if="showModal" @submit="handlePasswordSubmit" @close="showModal = false" />
    <PdfViewerModal
      v-if="showPdf"
      :contract-id="selectedContractId"
      :password="selectedPassword"
      @close="showPdf = false"
    />
    <ContractUploadModal
      v-if="showUploadModal"
      :contract-id="selectedContractIdForUpload"
      @uploaded="handleUploadSuccess"
      @close="showUploadModal = false"
    />
  </div>
</template>
