<script setup>
import { Icon } from '@iconify/vue';
import { computed } from 'vue';

const props = defineProps({
    addedInfluencers: Array,
    showModal: Boolean,
    isEditing: {
        type: Boolean,
        default: false,
    },
});
const emit = defineEmits(['remove', 'update:showModal']);

const modalState = computed({
    get: () => props.showModal,
    set: (val) => emit('update:showModal', val),
});
</script>

<template>
    <div class="custom-sidebar flex flex-col h-full">
        <h3 class="text-center font-bold mb-4">추가된 인플루언서</h3>

        <div class="flex-1 max-h-[440px] overflow-y-auto pr-1">
            <div
                v-for="influencer in addedInfluencers"
                :key="influencer.id"
                class="flex items-center justify-between p-3 bg-gray-50 rounded-lg mb-3"
            >
                <div class="flex items-center gap-3">
                    <img
                        :src="influencer.youtube?.thumbnailUrl"
                        alt="profile"
                        class="w-10 h-10 rounded-full object-cover"
                    />
                    <div class="flex flex-col">
                        <span class="text-sm font-semibold">
                            {{ influencer.name }}
                        </span>
                        <span class="text-sm font-semibold text-gray-500">
                            {{
                                influencer.youtube?.name ||
                                influencer.instagram?.name ||
                                '해당 없음'
                            }}
                        </span>
                    </div>
                </div>
                <Icon
                    icon="iconamoon:close-bold"
                    class="cursor-pointer text-gray-400 hover:text-red-500"
                    width="20"
                    @click="$emit('remove', influencer.influencerId)"
                />
            </div>
        </div>

        <div class="mt-4">
            <button
                class="btn-create flex justify-center items-center w-full"
                @click="modalState = true"
            >
                {{ isEditing ? '수정하기' : '추가하기' }}
            </button>
        </div>
    </div>
</template>
