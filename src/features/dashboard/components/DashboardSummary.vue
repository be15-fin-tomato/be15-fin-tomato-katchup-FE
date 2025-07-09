<script setup>
import SummaryItem from '@/features/dashboard/components/chart/SummaryItem.vue';

const props = defineProps({
  platform: {
    type: String,
    required: true
  },
  data: {
    type: Object,
    default: () => ({ totalVideos: '0개', views: '0만', comments: '0개', likes: '0만' })
  }
})

const getTitle = () => {
  return props.platform === 'instagram' ? '게시물 수' : '영상 수';
}
</script>

<template>
  <div class="dashboard-section">
    <div class="grid grid-cols-4 text-center divide-x divide-gray-medium">
      <div class="px-4">
        <SummaryItem :title="getTitle()" :value="data.totalVideos" icon="ph:play-circle-bold" />
      </div>
      <div class="px-4">
        <SummaryItem title="평균 조회 수" :value="data.views" icon="mdi:eye-outline" />
      </div>
      <div class="px-4">
        <SummaryItem title="평균 댓글 수" :value="data.comments" icon="mdi:comment-outline" />
      </div>
      <div class="px-4">
        <SummaryItem title="평균 좋아요 수" :value="data.likes" icon="mdi:heart-outline" />
      </div>
    </div>
  </div>
</template>
