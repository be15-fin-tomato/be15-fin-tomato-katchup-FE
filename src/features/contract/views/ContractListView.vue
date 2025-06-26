<script setup>
import { ref, computed } from 'vue';

import CommonFiltering from '@/components/layout/CommonFiltering.vue';
import PasswordModal from '@/features/contract/components/PasswordModal.vue';
import PdfViewerModal from '@/features/contract/components/PdfViewerModal.vue';
import PagingBar from '@/components/common/PagingBar.vue';

const currentPage = ref(1);
const showModal = ref(false);
const showPdf = ref(false);
const selectedContractId = ref(null);
const contractList = ref([
  {
    id: 1,
    campaignName: '카카오 AI 패키지 홍보',
    productName: 'AI 번역기 Pro',
    clientName: '카카오',
    influencer: '말왕',
    createdAt: '2025.05.05',
    status: '보기',
  },
  {
    id: 2,
    campaignName: '카카오 AI 패키지 홍보',
    productName: 'AI 번역기 Pro',
    clientName: '카카오',
    influencer: '말왕',
    createdAt: '2025.05.05',
    status: '등록',
  },
  {
    id: 3,
    campaignName: '카카오 AI 패키지 홍보',
    productName: 'AI 번역기 Pro',
    clientName: '카카오',
    influencer: '말왕',
    createdAt: '2025.05.05',
    status: '보기',
  },
  {
    id: 4,
    campaignName: '카카오 AI 패키지 홍보',
    productName: 'AI 번역기 Pro',
    clientName: '카카오',
    influencer: '말왕',
    createdAt: '2025.05.05',
    status: '등록',
  },

]);

const paginatedContracts = computed(() => {
  const start = (currentPage.value - 1) * 10;
  return contractList.value.slice(start, start + 10);
});

const handlePageChange = (page) => {
  currentPage.value = page;
};

const openPasswordModal = (id) => {
  selectedContractId.value = id;
  showModal.value = true;
};

const handlePasswordSubmit = (password) => {
  if (password === '0000') {
    showModal.value = false;
    showPdf.value = true;
  } else {
    alert('비밀번호가 올바르지 않습니다.');
  }
};

const handleFileUpload = (event, item) => {
  const file = event.target.files[0];
  if (file) {
    console.log(`파일 업로드됨: ${file.name}`);

    item.status = '보기';
  }
};
</script>

<template>
    <div class="w-full">
        <div class="flex gap-6">
            <!-- 좌측 필터 -->
            <CommonFiltering />

            <!-- 본문 콘텐츠 -->
            <div class="container">
                <!-- 제목 + 검색결과 -->
                <div class="flex justify-between items-center mb-3">
                  <div class="flex items-center">
                    <div class="page-title">계약 완료 목록</div>
                    <span class="cnt-search ml-2">(검색 결과: {{ contractList.length }} 건)</span>
                  </div>
                </div>

                <!-- 파란 줄 -->
                <div class="blue-line mb-6"></div>

              <!-- 계약 테이블 -->
              <table class="w-full text-[14px] text-center border-t border-gray-200">
                <thead class="bg-gray-100 text-[14px] border-t border-gray-300">
                <tr>
                  <th class="py-2">캠페인명</th>
                  <th>상품명</th>
                  <th>고객사명</th>
                  <th>인플루언서명</th>
                  <th>생성일</th>
                  <th>계약서</th>
                </tr>
                </thead>
                <tbody>
                <tr
                  v-for="(item, index) in paginatedContracts"
                  :key="index"
                  class="border-b"
                >
                  <td class="py-2">{{ item.campaignName }}</td>
                  <td>{{ item.productName }}</td>
                  <td>{{ item.clientName }}</td>
                  <td>{{ item.influencer }}</td>
                  <td>{{ item.createdAt }}</td>
                  <td>
                    <span
                      v-if="item.status === '보기'"
                      class="text-request hover:underline cursor-pointer"
                      @click.prevent="openPasswordModal(item.id)"
                    >
                      보기
                    </span>
                    <label v-else class="text-opinion-circle hover:underline cursor-pointer">
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
              <!-- 페이지네이션 -->
                <PagingBar
                    class="mt-6"
                    :total-pages="Math.ceil(contractList.length / 10)"
                    :current-page="currentPage"
                    @update:currentPage="handlePageChange"
                />
            </div>
        </div>

        <!-- 비밀번호 모달 -->
        <PasswordModal v-if="showModal" @submit="handlePasswordSubmit" @close="showModal = false" />

        <!-- PDF 뷰어 모달 -->
        <PdfViewerModal v-if="showPdf" :contract-id="selectedContractId" @close="showPdf = false" />
    </div>
</template>
