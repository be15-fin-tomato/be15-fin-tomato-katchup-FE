<!-- src/pages/oauth2/YouTubeCallback.vue -->
<script setup>
import { onMounted } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

onMounted(() => {
    const code = route.query.code;

    if (!code) {
        alert('인증 코드가 없습니다.');
        window.close();
        return;
    }

    // ✅ code만 부모창에 전달
    window.opener.postMessage({ code }, 'http://localhost:5173');
    window.close();
});
</script>

<template>
    <div class="flex items-center justify-center h-screen">
        <p class="text-gray-600">유튜브 연동 처리 중입니다...</p>
    </div>
</template>
