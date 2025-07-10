<template>
    <div class="flex items-center justify-between mt-1 mb-5">
        <div class="flex justify-between items-center w-full">
            <div class="text-md font-bold">{{ title }} ({{ items.length }})</div>
        </div>
    </div>

    <div class="blue-line mb-4"></div>

    <div class="flex flex-col gap-2 items-start max-h-[120px] overflow-y-auto">
        <div v-if="items.length === 0" class="text-gray-400 text-sm">
            현재 등록된 참고 자료가 없습니다.
        </div>

        <div
            v-for="(item, index) in items"
            :key="item.pipelineId ?? index"
            class="hover:underline cursor-pointer"
            @click="handleSelect(item)"
        >
            <slot name="item" :item="item">
                {{ item.name }}
            </slot>
        </div>
    </div>
</template>

<script setup>
const { title, items } = defineProps({
    title: { type: String, default: '참고 리스트' },
    items: { type: Array, default: () => [] },
});

const emit = defineEmits(['create', 'select']);

const handleSelect = (item) => emit('select', item);
</script>
