<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import InfluencerFormModal from '../components/InfluencerFormModal.vue';
import CommonFiltering from '@/components/layout/CommonFiltering.vue';
import { getInfluencers } from '@/features/user/api.js';
import InfluencerManagementCard from '@/components/common/InfluencerManagementCard.vue';
import PagingBar from '@/components/common/PagingBar.vue';

const influencers = ref([]); // 화면에 표시될 인플루언서 목록
const isModalOpen = ref(false); // 인플루언서 등록/수정 모달 열림 상태
const selectedInfluencer = ref(null); // 수정 시 모달에 전달할 인플루언서 데이터

// --- 페이지네이션 관련 상태 ---
// 백엔드는 0부터 시작하는 페이지 인덱스를 사용하므로, 이 변수는 0-indexed로 유지합니다.
const currentPageZeroBased = ref(0);
const pageSize = 6; // 한 페이지당 보여줄 인플루언서 수
const totalCount = ref(0); // 전체 인플루언서 수 (백엔드 응답에서 가져옴)
const totalPages = ref(0); // 전체 페이지 수 (백엔드 응답에서 가져옴)

// --- 필터링 관련 상태 ---
const filters = ref({});

// 인플루언서 목록을 백엔드에서 가져오는 비동기 함수
const fetchInfluencers = async () => {
  try {
    const params = {
      ...filters.value, // 현재 필터 상태를 파라미터로 포함
      page: currentPageZeroBased.value, // 백엔드에는 0-indexed 페이지를 보냅니다.
      size: pageSize, // 페이지 크기
    };

    const apiResponse = await getInfluencers(params);
    const apiData = apiResponse.data;

    // 백엔드에서 받은 원본 데이터를 InfluencerManagementCard 컴포넌트의 props에 맞게 변환합니다.
    influencers.value = apiData.data.map(influencer => ({
      id: influencer.influencerId, // 카드의 고유 ID
      name: influencer.name, // 유튜브 채널명 또는 인플루언서의 주요 활동명
      realName: influencer.manager, // 본명 또는 담당자 이름 (백엔드의 manager 필드 사용)
      // === 구독자 수 포맷팅 로직 수정 ===
      subscribers: (() => {
        const subscriberCount = influencer.youtube?.subscriber;
        // 구독자 정보가 아예 없거나 null이면 "0명"으로 표시
        if (subscriberCount === undefined || subscriberCount === null) {
          return '0명';
        }
        if (subscriberCount < 10000) {
          // 1만명 미만일 경우, 정확한 숫자와 '명'을 붙여서 표시
          return `${subscriberCount}명`;
        } else {
          // 1만명 이상일 경우, '만명' 단위로 표시 (반올림하여 정수)
          return `${Math.round(subscriberCount / 10000)}만명`;
        }
      })(),
      // =================================
      instagram: influencer.instagram?.name || (influencer.instagramIsConnected ? '연결됨' : '미연결'),
      // 인스타그램 팔로워 수는 현재 toFixed(1)로 유지합니다.
      instaFollowers: influencer.instagram?.followers
        ? `${(influencer.instagram.followers / 1000).toFixed(1)}천명`
        : 'N/A',
      tags: influencer.tags ? influencer.tags.map(tag => tag.categoryName) : [], // 카테고리 이름만 추출
      ownerName: influencer.manager, // 카드 하단에 표시될 담당자 이름
      thumbnail: influencer.youtube?.thumbnailUrl || null, // 썸네일 이미지 URL (없으면 null)
      // **중요:** 수정 모달에서 사용하기 위해 백엔드에서 받은 원본 데이터를 함께 저장합니다.
      _originalData: influencer,
    }));

    // 페이지네이션 정보 업데이트
    totalCount.value = apiData.pagination.totalCount;
    totalPages.value = apiData.pagination.totalPage;

  } catch (error) {
    console.error('인플루언서 목록을 가져오는 데 실패했습니다:', error);
    alert('인플루언서 목록을 불러오는 중 오류가 발생했습니다.'); // 사용자에게 오류 알림
  }
};

onMounted(() => {
  fetchInfluencers();
});

watch([currentPageZeroBased, filters], () => {
  fetchInfluencers();
}, { deep: true });

const openModal = () => {
  selectedInfluencer.value = null; // 등록 모드이므로 초기 데이터 없음
  isModalOpen.value = true;
};

const openModalWithData = (influencerCardData) => {
  selectedInfluencer.value = influencerCardData._originalData;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedInfluencer.value = null;

  fetchInfluencers();
};

const deleteInfluencer = async (id) => {
  if (confirm('정말로 이 인플루언서를 삭제하시겠습니까?')) {
    try {
      const index = influencers.value.findIndex((i) => i.id === id);
      if (index !== -1) {
        influencers.value.splice(index, 1);
      }
      alert('인플루언서가 성공적으로 삭제되었습니다.');
    } catch (error) {
      console.error('인플루언서 삭제 중 오류 발생:', error);
      alert('인플루언서 삭제에 실패했습니다.');
    }
  }
};

const saveInfluencer = async (updated) => {
  try {

    const index = influencers.value.findIndex((i) => i.id === updated.id);
    if (index !== -1) {
      // 수정
      influencers.value[index] = updated;
      alert('인플루언서 정보가 성공적으로 수정되었습니다.');
    } else {

      const newId = Math.max(...influencers.value.map(i => i.id || 0), 0) + 1;
      influencers.value.push({ ...updated, id: newId });
      alert('새로운 인플루언서가 성공적으로 등록되었습니다.');
    }
    closeModal(); // 모달 닫기
  } catch (error) {
    console.error('인플루언서 저장 중 오류 발생:', error);
    alert('인플루언서 저장에 실패했습니다. 입력값을 확인해주세요.');
  }
};

const currentPageOneBased = computed(() => currentPageZeroBased.value + 1);

const updateCurrentPageFromPagingBar = (val) => {
  currentPageZeroBased.value = val - 1;
};
</script>

<template>
  <div class="w-full min-h-screen bg-background flex font-sans">
    <CommonFiltering
      @update:filters="newFilters => filters = { ...filters, ...newFilters }"
    />

    <div class="container">
      <div class="page-header">
        <div class="page-title">
          인플루언서 관리
          <span class="cnt-search"> (검색결과: {{ totalCount }}건) </span>
        </div>
        <button class="btn-create" @click="openModal">등록</button>
      </div>

      <div class="blue-line"></div>

      <div class="px-10">
        <div class="grid grid-cols-2 gap-8">
          <InfluencerManagementCard
            v-for="card in influencers"
            :key="card.id"
            :id="card.id"
            :name="card.name"
            :realName="card.realName"
            :subscribers="card.subscribers"
            :instagram="card.instagram"
            :instaFollowers="card.instaFollowers"
            :tags="card.tags"
            :ownerName="card.ownerName"
            :thumbnail="card.thumbnail"
            :_originalData="card._originalData"
            @edit="openModalWithData"
            @delete="deleteInfluencer"
          />
        </div>
        <!-- 인플루언서가 없을 경우 메시지 표시 -->
        <div v-if="influencers.length === 0" class="text-center py-10 text-gray-500">
          검색된 인플루언서가 없습니다.
        </div>
      </div>

      <!-- 등록/수정 모달 -->
      <InfluencerFormModal
        v-if="isModalOpen"
        :initialData="selectedInfluencer"
        @close="closeModal"
        @save="saveInfluencer"
      />

      <!-- 페이지네이션 -->
      <div class="flex justify-center mt-8">
        <PagingBar
          :totalPages="totalPages"
          :currentPage="currentPageOneBased" @update:currentPage="updateCurrentPageFromPagingBar" />
      </div>
    </div>
  </div>
</template>
