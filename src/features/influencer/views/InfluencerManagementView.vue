<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import InfluencerManagementFilter from '@/components/common/InfluencerManagementFilter.vue';
import { getInfluencers, registerInfluencer, updateInfluencer, deleteInfluencerApi } from '@/features/user/api.js';
import InfluencerManagementCard from '@/components/common/InfluencerManagementCard.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import InfluencerFormModal from '@/features/influencer/components/InfluencerFormModal.vue';
import { useToast } from 'vue-toastification';

const influencers = ref([]);
const isModalOpen = ref(false);
const selectedInfluencer = ref(null);

const isLoading = ref(true);

const currentPageZeroBased = ref(0);
const pageSize = 6;
const totalCount = ref(0);
const totalPages = ref(0);

const filters = ref({});

const router = useRouter();
const toast = useToast();

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const fetchInfluencers = async () => {
  isLoading.value = true;

  try {
    const params = {
      ...filters.value,
      page: currentPageZeroBased.value,
      size: pageSize,
    };

    const [apiResponse] = await Promise.all([
      getInfluencers(params),
      delay(300)
    ]);

    const apiData = apiResponse.data;

    influencers.value = apiData.data.map(influencer => ({
      id: influencer.influencerId,
      name: (influencer.youtubeIsConnected === true && influencer.youtube && influencer.youtube.name)
        ? influencer.youtube.name
        : '미연결',
      realName: influencer.name,
      subscribers: (() => {
        const subscriberCount = influencer.youtube?.subscriber;
        if (subscriberCount === undefined || subscriberCount === null) {
          return null;
        }
        if (subscriberCount < 10000) {
          return `${subscriberCount.toLocaleString()}명`;
        } else {
          return `${(subscriberCount / 10000).toFixed(1).replace(/\.0$/, '')}만명`;
        }
      })(),
      instagram: (influencer.instagramIsConnected === true && influencer.instagram && influencer.instagram.name)
        ? influencer.instagram.name
        : '미연결',
      instaFollowers: (() => {
        const followerCount = influencer.instagram?.follower;
        if (followerCount === undefined || followerCount === null) {
          return null;
        }
        if (followerCount < 10000) {
          return `${followerCount.toLocaleString()}명`;
        } else {
          return `${(followerCount / 10000).toFixed(1).replace(/\.0$/, '')}만명`;
        }
      })(),
      tags: influencer.tags ? influencer.tags.map(tag => tag.categoryName) : [],
      ownerName: influencer.manager,
      thumbnail: influencer.youtube?.thumbnailUrl || null,
      _originalData: influencer,
    }));

    totalCount.value = apiData.pagination.totalCount;
    totalPages.value = apiData.pagination.totalPage;

  } catch (error) {
    console.error('인플루언서 목록을 가져오는 데 실패했습니다:', error);
    toast.error('인플루언서 목록을 불러오는 중 오류가 발생했습니다.');
  } finally {
    isLoading.value = false;
  }
};

const handleApplyFilters = (newFilters) => {
  currentPageZeroBased.value = 0;
  filters.value = { ...newFilters };
};

onMounted(() => {
  fetchInfluencers();
});

watch([currentPageZeroBased, filters], () => {
  fetchInfluencers();
}, { deep: true });

const openModal = () => {
  selectedInfluencer.value = null;
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
      const payload = { influencerId: id };
      await deleteInfluencerApi(payload);

      toast.success('인플루언서가 성공적으로 삭제되었습니다.');
      fetchInfluencers();
    } catch (error) {
      console.error('인플루언서 삭제 중 오류 발생:', error);
      toast.error('인플루언서 삭제에 실패했습니다.');
    }
  }
};

const saveInfluencer = async (formDataFromModal) => {
  try {
    let response;
    if (formDataFromModal.influencerId) {
      const { influencerId, ...restOfPayload } = formDataFromModal;
      response = await updateInfluencer({ influencerId, ...restOfPayload });
      toast.success('인플루언서 정보가 성공적으로 수정되었습니다.');
    } else {
      response = await registerInfluencer(formDataFromModal);
      toast.success('새로운 인플루언서가 성공적으로 등록되었습니다.');
    }
    closeModal();
  } catch (error) {
    console.error('인플루언서 저장 중 오류 발생:', error);
    const errorMessage = error.response && error.response.data && error.response.data.message
      ? error.response.data.message
      : '알 수 없는 오류가 발생했습니다. 입력값을 확인하거나 백엔드 로그를 확인해주세요.';
    toast.error(`인플루언서 저장에 실패했습니다: ${errorMessage}`);
  }
};

const currentPageOneBased = computed(() => currentPageZeroBased.value + 1);

const updateCurrentPageFromPagingBar = (val) => {
  currentPageZeroBased.value = val - 1;
};

</script>

<template>
  <div class="w-full min-h-screen flex">
    <InfluencerManagementFilter
      @apply-filters="handleApplyFilters"
    />

    <div class="container">
      <div class="page-header">
        <div class="page-title">
          인플루언서 관리
          <span class="cnt-search"> (검색결과: {{ totalCount }}건) </span>
        </div>
        <div class="flex gap-2 items-center">
          <button class="btn-create" @click="openModal">등록</button>
        </div>
      </div>

      <div class="blue-line"></div>

      <div class="px-10">
        <div v-if="isLoading" class="text-center py-10 text-gray-500">
          데이터를 불러오는 중입니다...
        </div>
        <div v-else-if="influencers.length === 0" class="text-center py-10 text-gray-500">
          검색된 인플루언서가 없습니다.
        </div>
        <div v-else class="grid grid-cols-2 gap-8">
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
      </div>

      <InfluencerFormModal
        v-if="isModalOpen"
        :initialData="selectedInfluencer"
        @close="closeModal"
        @save="saveInfluencer"
      />

      <div v-if="totalPages > 1 && !isLoading" class="flex justify-center mt-8">
        <PagingBar
          :totalPages="totalPages"
          :currentPage="currentPageOneBased" @update:currentPage="updateCurrentPageFromPagingBar" />
      </div>
    </div>
  </div>
</template>
