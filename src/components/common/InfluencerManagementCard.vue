<template>
  <div class="relative w-full p-4 border border-[color:var(--color-gray-dark)] rounded-xl bg-white font-sans flex flex-col min-h-[240px]">
    <!-- 점 3개 버튼 -->
    <div class="absolute top-5 right-5">
      <button class="flex flex-col gap-[2px]" @click="toggleDropdown">
        <span
          class="w-1 h-1 bg-black rounded-full"
          v-for="i in 3"
          :key="i"
        ></span>
      </button>

      <div
        v-if="showDropdown"
        class="absolute top-0 right-7 flex flex-col bg-white border border-[color:var(--color-gray-medium)] rounded shadow-md z-10"
      >
        <div
          class="w-[100px] px-3 py-2 text-sm text-center whitespace-nowrap bg-[color:var(--color-gray-medium)] hover:bg-[color:var(--color-dropdown)] cursor-pointer"
          @click="handleEdit"
        >
          수정하기
        </div>
        <div
          class="w-[100px] px-3 py-2 text-sm text-center whitespace-nowrap bg-[color:var(--color-gray-medium)] hover:bg-[color:var(--color-dropdown)] cursor-pointer"
          @click="handleDelete"
        >
          삭제하기
        </div>
      </div>
    </div>

    <!-- 프로필 섹션 -->
    <div class="flex gap-5 items-start mb-3 ml-2 flex-wrap">
      <img
        :src="thumbnail || defaultThumbnail"
        alt="thumbnail"
        class="w-[90px] h-[90px] rounded-full object-cover border border-[color:var(--color-gray-light)]"
      />
      <div class="flex-1 min-w-0">
        <div class="flex items-center gap-3 text-base font-medium mb-1 mt-2">
          <Icon icon="logos:youtube-icon" class="w-7 h-6" />
          <span class="font-bold text-[color:var(--color-click)] truncate">{{ name }}</span>
        </div>
        <div class="text-sm text-[color:var(--color-gray-dark)] mb-2 truncate">
          {{ subscribers }}
        </div>
        <div class="flex items-center gap-3 text-base font-medium mb-1">
          <Icon icon="skill-icons:instagram" class="w-7 h-6" />
          <span class="font-bold truncate">{{ instagram }}</span>
        </div>
        <div class="text-sm text-[color:var(--color-gray-dark)] mb-2 truncate">
          {{ instaFollowers }}
        </div>

        <!-- 태그 -->
        <div class="flex flex-wrap gap-1 text-xs font-bold leading-snug text-black mt-2">
          <span v-for="(tag, index) in tags" :key="index">
            #{{ tag }}
          </span>
        </div>
      </div>
    </div>

    <!-- 작성자 정보 -->
    <div class="flex items-center gap-1 text-sm text-[color:var(--color-gray-dark)] mt-auto pl-[2px]">
      <Icon icon="tdesign:user" class="w-4 h-4" />
      <span class="truncate">{{ ownerName }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import defaultThumbnail from '@/assets/images/logo.png'
import { Icon } from '@iconify/vue'

const props = defineProps({
  id: Number,
  name: String,
  subscribers: String,
  instagram: String,
  instaFollowers: String,
  tags: Array,
  ownerName: String,
  thumbnail: String
})

const showDropdown = ref(false)
const toggleDropdown = () => {
  showDropdown.value = !showDropdown.value
}

const emit = defineEmits(['edit', 'delete'])

const handleEdit = () => {
  emit('edit', { ...props })
}

const handleDelete = () => {
  emit('delete', props.id)
}
</script>

<style scoped>
@import url("https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css");
</style>
