<script setup>
import { ref, computed, onMounted } from 'vue';
import { useToast } from 'vue-toastification';
import { fetchCampaignListByInfluencer } from '@/features/dashboard/api.js';
import instagramPlaceholderImage from '@/assets/images/instagram-default-thumbnail.png';
import defaultPlaceholderImage from '@/assets/images/mock/물토마토.png';
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

const getPostTitle = (item) => {
  return item.campaignName || item.productName || '제목 없음';
};

const getPermalink = (item) => {
  return item.youtubeLink || item.instagramLink || '#';
};

const handlePostLinkClick = (campaign) => {
  const url = getPermalink(campaign);
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
    <div
      v-if="campaignList.length > 0"
      class="flex border border-gray-medium rounded-xl"
    >
      <!-- 캠페인 리스트 -->
      <div class="w-[40%] overflow-y-auto max-h-[250px] border-r border-gray-medium">
        <div class="p-4 flex flex-col gap-2">
          <button
            v-for="item in campaignList"
            :key="item.campaignId"
            @click="selectedId = item.campaignId"
            :class="[
              'text-left text-sm font-bold border border-gray-medium rounded-lg px-3 py-1.5',
              selectedId === item.campaignId ? 'bg-btn-sky/70 font-bold' : 'bg-white hover:bg-btn-sky/20'            ]"
          >
          <p>[{{ item.clientCompanyName }}] {{ getCampaignTitle(item) }}</p>
        </button>
      </div>
    </div>

      <!-- 캠페인 상세 정보 -->
      <div v-if="selectedCampaign" class="flex gap-2 overflow-hidden w-[60%] items-center px-4">
        <div
          v-if="selectedCampaign.youtubeLink && extractYoutubeVideoId(selectedCampaign.youtubeLink)"
        >
          <iframe
            :src="getEmbeddedYoutubeUrl(selectedCampaign)"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen
            class="w-[405px] h-[230px] rounded object-cover"
          ></iframe>
        </div>
        <div v-else-if="selectedCampaign.instagramLink">
          <a :href="selectedCampaign.instagramLink" target="_blank" rel="noopener noreferrer" class="block">
            <img :src="instagramPlaceholderImage" alt="instagram-post" class="w-[400px] h-[250px] rounded object-cover border border-gray-medium" />
          </a>
        </div>
        <div v-else>
          <img :src="defaultPlaceholderImage" alt="No Post" class="w-[400px] h-[250px] rounded object-cover" />
        </div>

        <div class="flex flex-col gap-2 justify-end p-3 mt-22">
          <div class="flex items-center gap-2">
            <Icon icon="tabler:building" class="w-5 h-5" />
            <div class="font-bold text-sm truncate max-w-[300px]" :title="getClientCompanyName(selectedCampaign)">
              고객사 : {{ getClientCompanyName(selectedCampaign) }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="tabler:ad" class="w-5 h-5" />
            <div class="font-bold text-sm truncate max-w-[300px]" :title="getPostTitle(selectedCampaign)">
              캠페인명 : {{ getPostTitle(selectedCampaign) }}
            </div>
          </div>
          <div class="flex items-center gap-2">
            <Icon icon="icon-park:ad-product" class="w-5 h-5" />
            <div class="font-bold text-sm truncate max-w-[300px]" :title="getProductName(selectedCampaign)">
              상품명 : {{ getProductName(selectedCampaign) }}
            </div>
          </div>

          <div class="flex gap-1 mt-3">
            <button
              class="btn-create"
              @click="handlePostLinkClick(selectedCampaign)"
            >
              게시물 바로가기
            </button>
            <button
              class="btn-create"
              @click="goToCampaignDashboard"
            >
              성과 대시보드
            </button>
          </div>
        </div>
      </div>
      <div v-else class="flex-1 flex items-center justify-center text-gray-dark">
        캠페인 상세 정보를 불러올 수 없습니다.
      </div>
    </div>
    <div v-else class="text-gray-medium">
      진행 완료된 캠페인이 없습니다.
    </div>
  </div>
</template>
