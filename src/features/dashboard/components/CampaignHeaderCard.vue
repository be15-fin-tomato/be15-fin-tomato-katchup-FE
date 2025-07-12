<script setup>
import { computed } from 'vue';
import { Icon } from '@iconify/vue';
import { TAG_COLOR_MAP } from '@/constants/tags.js';
import { useRouter } from 'vue-router';

const props = defineProps({
  campaign: Object,
  influencer: Object // influencer 객체를 prop으로 받음
});

const router = useRouter();

// campaign 객체의 구조에 맞게 속성 접근 변경 (예: campaignName 대신 campaign.campaignName)
const campaignTitle = computed(() => props.campaign?.campaignName ?? '-'); // campaignName으로 변경
const clientCompany = computed(() => props.campaign?.clientCompanyName ?? '-'); // clientCompanyName으로 변경
const productName = computed(() => props.campaign?.productName ?? '-');
const startDate = computed(() => props.campaign?.startDate ?? '-');
const endDate = computed(() => props.campaign?.endDate ?? '-');

const influencerName = computed(() => props.influencer?.name ?? '-');
const influencerThumbnail = computed(() => props.influencer?.thumbnail ?? '/default-thumbnail.png');
const tags = computed(() => props.influencer?.tags ?? []); // 태그 배열

const tagStyle = (tag) => {
  return TAG_COLOR_MAP[tag] ?? 'bg-gray-200 text-black';
};

function goToDashboard(target) {
  // influencer.id가 null 또는 undefined인지 확인하는 방어 로직 추가
  if (!props.influencer || !props.influencer.id) {
    console.warn(`Cannot navigate to ${target} dashboard: influencer ID is missing.`);
    alert('인플루언서 ID가 없어 대시보드로 이동할 수 없습니다.');
    return;
  }

  switch (target) {
    case 'youtube':
      router.push(`/influencer/dashboard/youtube?id=${props.influencer.id}`);
      break;
    case 'instagram':
      router.push(`/influencer/dashboard/instagram?id=${props.influencer.id}`);
      break;
  }
}
</script>

<template>
  <div class="dashboard-section flex justify-between gap-10 p-8 bg-white rounded-xl shadow">
    <div class="flex items-center gap-6 w-[65%] border-r border-gray-light">
      <div class="w-[130px] h-[130px] rounded-full overflow-hidden bg-gray-100">
        <img :src="influencerThumbnail" alt="influencer" class="w-full h-full object-cover" />
      </div>
      <div class="flex flex-col gap-3">
        <div class="text-xl font-bold">{{ influencerName }}</div>
        <div class="flex gap-1">
          <button
            @click="goToDashboard('youtube')"
            class="flex items-center justify-center px-1.5 py-1 border border-black rounded-lg text-xs font-bold whitespace-nowrap"
          >
            <Icon icon="logos:youtube-icon" width="24" height="24" class="mr-2" />
            <span class="hidden md:inline">유튜브 대시보드</span>
          </button>
          <button
            @click="goToDashboard('instagram')"
            class="flex items-center justify-center px-1.5 py-1 border border-black rounded-lg text-xs font-bold whitespace-nowrap"
          >
            <Icon icon="skill-icons:instagram" width="24" height="24" class="mr-2" />
            <span class="hidden md:inline">인스타 대시보드</span>
          </button>
        </div>
        <div class="flex gap-2 flex-wrap">
           <span
             v-for="tag in tags"
             :key="tag"
             class="text-xs rounded-lg px-1 py-0.5"
             :class="tagStyle(tag)"
           >
             # {{ tag }}
           </span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-6 w-[35%]">
      <div class="flex flex-col gap-2">
        <div class="text-lg font-bold">{{ clientCompany }}</div>
        <div class="text-lg font-bold">{{ campaignTitle }}</div>
        <div class="flex gap-2 text-sm text-black font-bold">
          <div>{{ startDate }} ~</div>
          <div>{{ endDate }}</div>
        </div>
        <div class="text-gray-medium text-lg">{{ productName }}</div>
      </div>
    </div>
  </div>
</template>
