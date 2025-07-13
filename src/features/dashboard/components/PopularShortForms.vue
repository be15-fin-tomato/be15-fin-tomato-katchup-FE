<script setup>
import { formatNumber } from '@/utils/fomatters.js';
import { computed } from 'vue';

const props = defineProps({
  platform: String,
  items: Array
})

const filteredItems = computed(() => {
  if (props.platform === 'instagram') {
    return props.items.filter(item => item.snapshotType === 'topVideos');
  }
  return props.items;
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ko-KR');
}

const getThumbnail = (item) => {
  return item.thumbnailUrl;
}

const getUrl = (item) => {
  return props.platform === 'instagram' ? item.permalink : item.shortsUrl;
}

const getViews = (item) => {
  return props.platform === 'instagram' ? item.viewCount : item.views;
}

const getLikes = (item) => {
  return props.platform === 'instagram' ? item.likeCount : item.likes;
}

const getComments = (item) => {
  return props.platform === 'instagram' ? item.commentCount : item.comments;
}

const getTimestamp = (item) => {
  return props.platform === 'instagram' ? item.timestamp : item.publishedAt;
}
</script>

<template>
  <div class="dashboard-section">
    <p class="dashboard-title">{{ platform === 'instagram' ? '인기 Reels' : '인기 Shorts' }}</p>
    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="item in filteredItems"
        :key="platform === 'instagram' ? item.id : item.videoId"
        class="overflow-hidden hover:shadow-lg rounded-xl transition cursor-pointer"
      >
        <a :href="getUrl(item)" target="_blank">
          <img :src="getThumbnail(item)" alt="썸네일" class="w-full h-[150px] object-cover rounded-xl" />
        </a>

        <div class="p-2 text-sm font-bold truncate">{{ item.title }}</div>
        <div class="px-2 pb-2 text-xs text-gray-dark">
          <span>조회수 {{ formatNumber(getViews(item)) }} ・</span>
          <span>좋아요 {{ formatNumber(getLikes(item)) }} ・</span>
          <span>댓글 {{ formatNumber(getComments(item)) }} ・</span>
          <span>{{ formatDate(getTimestamp(item)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
