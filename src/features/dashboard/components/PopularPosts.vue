<script setup>
import { formatNumber } from '@/utils/fomatters.js';

const props = defineProps({
  platform: String, // 'instagram' or 'youtube'
  items: {
    type: Array,
    default: () => []
  }
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleDateString('ko-KR');
}

const getUrl = (item) => {
  if (props.platform === 'instagram') {
    return item.permalink;
  } else if (props.platform === 'youtube') {
    return `https://www.youtube.com/watch?v=${item.videoId}`;
  }
  return '#';
};

const getLikes = (item) => {
  return item.likes;
};

const getComments = (item) => {
  return item.comments;
};

const getThumbnail = (item) => {
  return item.thumbnailUrl;
};

const getTitle = (item) => {
  return item.title;
};

const getUploadDay = (item) => {
  return item.publishedAt;
};

const getKey = (item) => {
  // YouTube는 videoId, Instagram은 id를 사용
  return props.platform === 'instagram' ? item.id : item.videoId;
};
</script>

<template>
  <div class="dashboard-section">
    <p class="dashboard-title">{{ platform === 'instagram' ? '인기 게시글' : '인기 동영상' }}</p>
    <div class="grid grid-cols-4 gap-4">
      <div
        v-for="item in items"
        :key="getKey(item)"
        class="overflow-hidden hover:shadow-lg rounded-xl transition cursor-pointer"
      >
        <a :href="getUrl(item)" target="_blank">
          <img :src="getThumbnail(item)" alt="썸네일" class="w-full h-[200px] object-cover rounded-xl" />
        </a>

        <div class="p-2 text-sm font-bold truncate">{{ getTitle(item) }}</div>
        <div class="px-2 pb-2 text-xs text-gray-dark">
          <span>좋아요 {{ formatNumber(getLikes(item)) }} ・</span>
          <span>댓글 {{ formatNumber(getComments(item)) }} ・</span>
          <span>{{ formatDate(getUploadDay(item)) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
