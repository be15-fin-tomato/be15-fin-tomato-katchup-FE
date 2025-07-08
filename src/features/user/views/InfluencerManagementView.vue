<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import InfluencerFormModal from '../components/InfluencerFormModal.vue';
import CommonFiltering from '@/components/layout/CommonFiltering.vue';
// ⭐️ 이 부분에 registerInfluencer, updateInfluencer, deleteInfluencerApi 가 모두 임포트되었는지 다시 확인
import { getInfluencers, registerInfluencer, updateInfluencer, deleteInfluencerApi } from '@/features/user/api.js';
import InfluencerManagementCard from '@/components/common/InfluencerManagementCard.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import YoutubeConnectIdModal from '@/features/influencer/components/YoutubeConnectModal.vue';
import InstagramConnectModal from '@/features/influencer/components/InstagramConnectModal.vue'; // InstagramConnectModal 임포트

// Icon 컴포넌트 임포트
import { Icon } from '@iconify/vue';


const influencers = ref([]);
const isModalOpen = ref(false);
const selectedInfluencer = ref(null); // 수정 모드 시 모달에 전달될 인플루언서 원본 데이터

const currentPageZeroBased = ref(0);
const pageSize = 6;
const totalCount = ref(0);
const totalPages = ref(0);

const filters = ref({});

const router = useRouter();

// 유튜브 연동 관련 모달 상태 변수
const isYoutubeConnectIdModalOpen = ref(false); // 인플루언서 ID 입력 모달
const isYoutubeConnectAuthModalOpen = ref(false); // 유튜브 인증 안내 모달 (새로 추가)
const currentInfluencerIdForYoutube = ref(null); // 연동할 인플루언서 ID 저장

// Instagram 연동 모달 상태 변수 추가
const isInstagramConnectModalOpen = ref(false);
const currentInfluencerIdForInstagram = ref(null);


const fetchInfluencers = async () => {
  try {
    const params = {
      ...filters.value,
      page: currentPageZeroBased.value,
      size: pageSize,
    };

    const apiResponse = await getInfluencers(params);
    const apiData = apiResponse.data;

    influencers.value = apiData.data.map(influencer => ({
      id: influencer.influencerId,
      name: influencer.youtube?.name || '', // 유튜브 채널명
      realName: influencer.name, // 인플루언서 본명 (괄호 안)
      subscribers: (() => {
        const subscriberCount = influencer.youtube?.subscriber;
        if (subscriberCount === undefined || subscriberCount === null) {
          return '0명';
        }
        if (subscriberCount < 10000) {
          return `${subscriberCount}명`;
        } else {
          return `${Math.round(subscriberCount / 10000)}만명`;
        }
      })(),
      instagram: (influencer.instagramIsConnected === true && influencer.instagram && influencer.instagram.name)
        ? influencer.instagram.name
        : '미연결',
      instaFollowers: (influencer.instagram?.follower && influencer.instagram.follower > 0)
        ? `${(influencer.instagram.follower / 1000).toFixed(1)}천명`
        : null,
      tags: influencer.tags ? influencer.tags.map(tag => tag.categoryName) : [],
      ownerName: influencer.manager,
      thumbnail: influencer.youtube?.thumbnailUrl || null,
      _originalData: influencer, // 원본 데이터를 모달에 넘기기 위해 저장
    }));

    totalCount.value = apiData.pagination.totalCount;
    totalPages.value = apiData.pagination.totalPage;

  } catch (error) {
    console.error('인플루언서 목록을 가져오는 데 실패했습니다:', error);
    alert('인플루언서 목록을 불러오는 중 오류가 발생했습니다.');
  }
};

onMounted(() => {
  fetchInfluencers();
});

watch([currentPageZeroBased, filters], () => {
  fetchInfluencers();
}, { deep: true });

const openModal = () => {
  selectedInfluencer.value = null; // 새 등록 시에는 데이터 없음
  isModalOpen.value = true;
};

const openModalWithData = (influencerCardData) => {
  // 수정 시에는 카드에서 받아온 _originalData (백엔드 원본 DTO)를 그대로 전달
  selectedInfluencer.value = influencerCardData._originalData;
  isModalOpen.value = true;
};

const closeModal = () => {
  isModalOpen.value = false;
  selectedInfluencer.value = null; // 모달 닫으면 선택된 인플루언서 초기화
  fetchInfluencers(); // 변경사항 반영을 위해 목록 다시 불러오기
};

const deleteInfluencer = async (id) => {
  if (confirm('정말로 이 인플루언서를 삭제하시겠습니까?')) {
    try {
      const payload = { influencerId: id }; // 백엔드 InfluencerDeleteRequestDTO에 맞춤
      await deleteInfluencerApi(payload); // 백엔드 삭제 API 호출

      alert('인플루언서가 성공적으로 삭제되었습니다.');
      fetchInfluencers(); // 삭제 후 목록을 서버에서 다시 가져와 UI 업데이트
    } catch (error) {
      console.error('인플루언서 삭제 중 오류 발생:', error);
      alert('인플루언서 삭제에 실패했습니다.');
    }
  }
};

// ⭐️ saveInfluencer 함수 수정
const saveInfluencer = async (formDataFromModal) => { // 모달에서 넘어온 폼 데이터 (이제 influencerId를 포함할 수도 있음)
  try {
    let response;
    // formDataFromModal에 influencerId가 있다면 수정 모드
    if (formDataFromModal.influencerId) {
      const { influencerId, ...restOfPayload } = formDataFromModal; // influencerId 분리
      // updateInfluencer API는 influencerId를 path variable로, 나머지를 body로 받습니다.
      response = await updateInfluencer({ influencerId, ...restOfPayload });
      alert('인플루언서 정보가 성공적으로 수정되었습니다.');
    } else { // influencerId가 없다면 등록 모드
      response = await registerInfluencer(formDataFromModal); // 백엔드 등록 API 호출
      alert('새로운 인플루언서가 성공적으로 등록되었습니다.');
    }
    closeModal(); // 모달 닫고 목록 새로고침 (closeModal에서 fetchInfluencers를 호출하므로 중복 호출 방지)
  } catch (error) {
    console.error('인플루언서 저장 중 오류 발생:', error);
    const errorMessage = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : '알 수 없는 오류가 발생했습니다. 입력값을 확인하거나 백엔드 로그를 확인해주세요.';
    alert(`인플루언서 저장에 실패했습니다: ${errorMessage}`);
  }
};

const currentPageOneBased = computed(() => currentPageZeroBased.value + 1);

const updateCurrentPageFromPagingBar = (val) => {
  currentPageZeroBased.value = val - 1;
};

const handleInfluencerIdConfirmed = (id) => {
  currentInfluencerIdForYoutube.value = id; // 인플루언서 ID 저장
  isYoutubeConnectIdModalOpen.value = false; // ID 입력 모달 닫기
  isYoutubeConnectAuthModalOpen.value = true; // 인증 안내 모달 열기
};

const openInstagramConnectModal = () => {
  isInstagramConnectModalOpen.value = true;
};

const handleInstagramIdConfirmed = (id) => {
  currentInfluencerIdForInstagram.value = id;
  isInstagramConnectModalOpen.value = false;
  console.log("Instagram 연동을 위한 인플루언서 ID 확인:", id);
  alert(`인스타그램 연동: 인플루언서 ID ${id} 확인. (실제 연동 로직 추가 필요)`);
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
        <div class="flex gap-2 items-center">
          <button class="btn-create" @click="openModal">등록</button>
          <button
            @click="isYoutubeConnectIdModalOpen = true"
            class="p-2 rounded-full bg-red-600 hover:bg-red-700 transition-colors flex items-center justify-center shadow-md"
            title="유튜브 계정 연동"
          >
            <Icon icon="logos:youtube-icon" class="text-white" width="24" height="24" />
          </button>
          <button
            @click="openInstagramConnectModal"
            class="p-2 rounded-full bg-pink-600 hover:bg-pink-700 transition-colors flex items-center justify-center shadow-md"
            title="인스타그램 계정 연동"
          >
            <Icon icon="skill-icons:instagram" class="text-white" width="24" height="24" />
          </button>
        </div>
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
        <div v-if="influencers.length === 0" class="text-center py-10 text-gray-500">
          검색된 인플루언서가 없습니다.
        </div>
      </div>

      <InfluencerFormModal
        v-if="isModalOpen"
        :initialData="selectedInfluencer"
        @close="closeModal"
        @save="saveInfluencer"
      />

      <YoutubeConnectIdModal
        v-if="isYoutubeConnectIdModalOpen"
        @close="isYoutubeConnectIdModalOpen = false"
        @confirm="handleInfluencerIdConfirmed"
      />

      <InstagramConnectModal
        v-if="isInstagramConnectModalOpen"
        @close="isInstagramConnectModalOpen = false"
        @confirm="handleInstagramIdConfirmed"
        :influencerId="currentInfluencerIdForInstagram"
      />

      <div class="flex justify-center mt-8">
        <PagingBar
          :totalPages="totalPages"
          :currentPage="currentPageOneBased" @update:currentPage="updateCurrentPageFromPagingBar" />
      </div>
    </div>
  </div>
</template>
