<script setup>
import SummaryItem from '@/features/dashboard/components/chart/SummaryItem.vue';
import { computed } from 'vue';

const props = defineProps({
  platform: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({ totalPosts: 0, avgViews: '0만', avgComments: '0개', avgLikes: '0만' })
  }
})

const displayTitle = computed(() => {
  return props.platform === 'instagram' ? '게시물 수' : '영상 수';
});

</script>

<template>
    <div class="dashboard-section">
        <div class="grid grid-cols-4 text-center divide-x divide-gray-medium">
            <div class="px-4">
                <SummaryItem :title="displayTitle" :value="props.data.totalPosts || props.data.totalVideos" icon="ph:play-circle-bold" />
            </div>
            <div class="px-4">
                <SummaryItem title="평균 조회 수" :value="props.data.avgViews" icon="mdi:eye-outline" />
            </div>
            <div class="px-4">
                <SummaryItem title="평균 댓글 수" :value="props.data.avgComments" icon="mdi:comment-outline" />
            </div>
            <div class="px-4">
                <SummaryItem title="평균 좋아요 수" :value="props.data.avgLikes" icon="mdi:heart-outline" />
            </div>
        </div>
    </div>
</template>
