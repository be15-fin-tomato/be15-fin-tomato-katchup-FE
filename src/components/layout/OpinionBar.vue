<template>
    <div class="custom-sidebar">
        <div class="flex items-center mb-4">
            <span class="text-sm font-bold mr-2">의견</span>
            <span
                class="bg-opinion-circle text-white text-xs rounded-full w-5 h-5 flex items-center justify-center"
            >
                {{ opinions.length }}
            </span>
        </div>

        <!-- 의견 리스트 -->
        <div v-for="opinion in opinions" :key="opinion.ideaId" class="flex mb-6">
            <div class="flex items-start pt-2.75 mr-3">
                <div class="w-2 h-2 bg-opinion-circle rounded-full"></div>
            </div>

            <div class="flex-1 flex flex-col">
                <div class="flex justify-between items-center mb-1">
                    <div class="flex items-center">
                        <span class="font-bold text-sm">{{ opinion.userName }}</span>
                    </div>

                    <div class="flex items-center gap-2">
                        <span class="text-xs text-gray-400">{{ opinion.createdAt }}</span>

                        <div class="relative">
                            <button
                                @click="toggleMenu(opinion.ideaId)"
                                class="p-1 hover:bg-gray-100 rounded"
                            >
                                ⋮
                            </button>

                            <div
                                v-if="menuOpenId === opinion.ideaId"
                                class="absolute right-0 mt-2 bg-white border rounded shadow-lg w-24 text-sm z-10"
                            >
                                <button
                                    @click="deleteOpinion(opinion.ideaId)"
                                    class="block w-full text-left px-4 py-2 hover:bg-gray-medium"
                                >
                                    삭제
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-sm text-gray-700">{{ opinion.content }}</div>
            </div>
        </div>

        <div class="flex flex-col gap-2">
            <textarea
                v-model="newComment"
                class="border border-solid border-gray-dark rounded p-2 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-blue-300"
                placeholder="의견을 입력하세요"
            ></textarea>
            <button
                @click="submitComment"
                class="self-end bg-btn-blue text-white text-sm font-semibold py-1.5 px-4 rounded hover:brightness-95 active:brightness-90 transition"
            >
                등록
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
    opinions: Array,
});
const emit = defineEmits(['submit', 'delete']);
const newComment = ref('');
const menuOpenId = ref(null);

const submitComment = () => {
    if (!newComment.value.trim()) {
        alert('내용을 입력하세요.');
        return;
    }
    emit('submit', newComment.value);
    newComment.value = '';
};

const toggleMenu = (id) => {
    menuOpenId.value = menuOpenId.value === id ? null : id;
};

const deleteOpinion = (id) => {
    emit('delete', id);
    menuOpenId.value = null;
};
</script>
