<template>
  <div id="word-cloud"></div>
</template>

<script setup>
import { onMounted } from 'vue'
import WordCloud from 'wordcloud2'

const props = defineProps({
  words: Array, // 단어 배열을 받음, { text: '단어', weight: 10 } 형태
})

onMounted(() => {
  WordCloud(document.getElementById('word-cloud'), {
    list: props.words.map(word => [word.text, word.weight]),
    gridSize: 16,
    weightFactor: 10,
    fontFamily: 'Arial',
    color: 'random-light',
    backgroundColor: '#f0f0f0',
  })
})
</script>

<style scoped>
#word-cloud {
  width: 100%;
  height: 300px; /* 워드 클라우드 높이 설정 */
}
</style>
