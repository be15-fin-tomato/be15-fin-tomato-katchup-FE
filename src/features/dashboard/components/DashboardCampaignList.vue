<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { fetchCampaignListByInfluencer } from '@/features/dashboard/api.js';
import defaultPlaceholderImage from '@/assets/images/mock/냥냥이.png';
import { Icon } from '@iconify/vue'
import { useRouter } from 'vue-router';

const props = defineProps({
  influencerId: {
    type: [String, Number],
    required: true
  }
});

const toast = useToast();
const router = useRouter();

const campaignList = ref([]);
const selectedId = ref(null);

onMounted(async () => {
  try {
    const res = await fetchCampaignListByInfluencer(props.influencerId);
    const data = res?.data?.data;

    if (data && data.length > 0) {
      campaignList.value = data;
      const firstCampaignWithLink = data.find(c => c.youtubeLink || c.instagramLink);
      selectedId.value = firstCampaignWithLink ? firstCampaignWithLink.campaignId : data[0].campaignId;
    } else {
      campaignList.value = [];
      selectedId.value = null;
      toast.info('진행 완료된 캠페인이 없습니다.');
    }
  } catch (error) {
    console.error('💥 캠페인 리스트 로드 오류:', error);
    toast.error('캠페인 리스트를 불러오지 못했습니다.');
    campaignList.value = [];
    selectedId.value = null;
  }
});

const selectedCampaign = computed(() => {
  if (!campaignList.value.length || selectedId.value === null) {
    return null;
  }
  return campaignList.value.find(c => c.campaignId === selectedId.value);
});

const extractYoutubeVideoId = (url) => {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i;
  const match = url.match(regExp);
  return (match && match[1]) ? match[1] : null;
};

const getEmbeddedYoutubeUrl = (item) => {
  const videoId = extractYoutubeVideoId(item.youtubeLink);
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}?rel=0&showinfo=0&iv_load_policy=3&modestbranding=1&controls=0`;
  }
  return null;
};

const getCampaignTitle = (item) => item.campaignName;
const getProductName = (item) => item.productName;
const getClientCompanyName = (item) => item.clientCompanyName;

const getPostThumbnail = (item) => {
  const videoId = extractYoutubeVideoId(item.youtubeLink);
  if (videoId) {
    return `http://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  }
  if (item.instagramLink) {
    return 'https://via.placeholder.com/384x192?text=Instagram+Post'; // 임시 인스타그램 이미지
  }
  return defaultPlaceholderImage;
};

const getPostTitle = (item) => {
  return item.campaignName || item.productName || '제목 없음';
};

const getPermalink = (item) => {
  return item.youtubeLink || item.instagramLink || '#';
};

const handlePostLinkClick = (campaign) => {
  const url = getPermalink(campaign);
  console.log('게시물 바로가기 버튼 클릭됨. URL:', url);
  if (url && url !== '#') {
    window.open(url, '_blank');
  } else {
    toast.info('이 캠페인에는 연결된 게시물 링크가 없습니다.');
  }
};

const goToCampaignDashboard = () => {
  if (selectedCampaign.value && selectedCampaign.value.pipelineInfluencerId) {
    router.push({
      name: 'campaign-dashboard',
      params: { id: selectedCampaign.value.pipelineInfluencerId }
    });
  } else {
    toast.error('선택된 캠페인 또는 대시보드를 볼 인플루언서 ID를 찾을 수 없습니다.');
  }
};
</script>

<template>
  <div class="dashboard-section">
    <h2 class="dashboard-title">진행 캠페인</h2>
    <div class="flex border border-gray-medium rounded-xl overflow-hidden min-h-[200px]">
      <!-- 캠페인 리스트 -->
      <div class="w-1/3 border-r border-gray-medium p-4 flex flex-col gap-2">
        <button
          v-for="item in campaignList"
          :key="item.campaignId"
          @click="selectedId = item.campaignId"
          :class="[
            'text-left text-md border border-gray-medium rounded-lg px-3 py-2',
            selectedId === item.campaignId ? 'bg-btn-sky font-bold' : 'bg-white hover:bg-btn-sky'
          ]"
        >
          [{{ item.clientCompanyName }}] {{ getCampaignTitle(item) }}
        </button>
      </div>

      <!-- 캠페인 상세 정보 -->
      <div v-if="selectedCampaign" class="flex p-8 gap-10 overflow-hidden hover:shadow-lg rounded-xl transition cursor-pointer flex-1">
        <div v-if="selectedCampaign.youtubeLink && extractYoutubeVideoId(selectedCampaign.youtubeLink)" class="mb-6">
          <iframe
            :src="getEmbeddedYoutubeUrl(selectedCampaign)"
            frameborder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            class="w-[400px] h-[250px] rounded object-cover"
          ></iframe>
        </div>
        <div v-else-if="selectedCampaign.instagramLink" class="mb-6">
          <a :href="selectedCampaign.instagramLink" target="_blank" rel="noopener noreferrer" class="block">
            <img :src="getPostThumbnail(selectedCampaign)" :alt="getPostTitle(selectedCampaign)" class="w-[400px] h-48 rounded object-cover" />
          </a>
        </div>
        <div v-else class="mb-6">
          <img :src="defaultPlaceholderImage" alt="No Post" class="w-full h-[250px] rounded object-cover" />
        </div>

        <div class="flex flex-col gap-2 justify-end mb-6">
          <div class="flex items-center gap-2">
            <Icon icon="tabler:building" width="24" height="24" />
            <div class="font-bold text-lg">고객사 : {{ getClientCompanyName(selectedCampaign) }}</div>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="tabler:ad" width="24" height="24" />
            <div class="font-bold text-lg">캠페인명 : {{ getPostTitle(selectedCampaign) }}</div>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="icon-park:ad-product" width="24" height="24" />
            <div class="font-bold text-lg">상품명 : {{ getProductName(selectedCampaign) }}</div>
          </div>

          <div class="flex gap-3 mt-3">
            <button
              class="text-lg bg-btn-yellow w-44 h-12 rounded-lg hover:bg-btn-yellow/70"
              @click="handlePostLinkClick(selectedCampaign)"
            >
              게시물 바로가기
            </button>
            <button
              class="text-lg bg-btn-yellow w-44 h-12 rounded-lg hover:bg-btn-yellow/70"
              @click="goToCampaignDashboard"
            >
              성과 대시보드
            </button>
          </div>
        </div>
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-dark">
        진행 완료된 캠페인이 없습니다.
      </div>
    </div>
  </div>
</template>
