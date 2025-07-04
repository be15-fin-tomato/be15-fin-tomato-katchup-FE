<template>
    <form @submit.prevent="emitSearch" class="custom-sidebar flex flex-col gap-8">
        <!-- 검색조건 -->
        <div>
            <div class="font-bold mb-3">검색조건</div>

            <!-- 카테고리 -->
            <select v-model="localValue.category" class="input-form-box mb-2 w-full">
                <option value="">전체</option>
                <option v-for="option in categoryOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>

            <!-- 키워드 -->
            <input
                v-model="localValue.keyword"
                placeholder="검색어"
                class="input-form-box mb-2 w-full"
            />

            <!-- 담당자 -->
            <div class="flex mb-2">
                <input
                    :value="localValue.manager?.name ?? ''"
                    placeholder="담당자"
                    class="input-form-box flex-1"
                    readonly
                />
                <button
                    @click="openManagerSearch"
                    type="button"
                    class="ml-1 px-2 bg-gray-200 rounded text-sm"
                >
                    <img src="@/assets/icons/add.svg" alt="sort" class="w-5 select-none" />
                </button>
            </div>
        </div>

        <!-- 필터/정렬 -->
        <div>
            <div class="font-bold mb-3">필터/정렬</div>

            <!-- 필터 -->
            <select v-model="localValue.filter" class="input-form-box mb-2 w-full">
                <option value="">필터</option>
                <option v-for="option in filterOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>

            <!-- 정렬 -->
            <div class="flex gap-1 items-center">
                <select v-model="localValue.sort" class="input-form-box flex-1">
                    <option value="date">등록일</option>
                    <option value="title">제목</option>
                </select>

                <button
                    @click="toggleSortOrder"
                    type="button"
                    class="w-[40px] h-[40px] bg-btn-gray rounded-md flex items-center justify-center"
                >
                    <span v-if="localValue.sortOrder === 'asc'">
                        <img src="@/assets/icons/sort.svg" alt="sort" class="w-5 select-none" />
                    </span>
                    <span v-else>⬇</span>
                </button>
            </div>
        </div>

        <!-- 검색 버튼 -->
        <button type="submit" class="w-full bg-blue-400 text-white py-2 rounded">검색</button>
    </form>
</template>

<script setup>
import { reactive, watch } from 'vue';

const props = defineProps({
    modelValue: Object,
    categoryOptions: { type: Array, default: () => [] },
    filterOptions: { type: Array, default: () => [] },
});

const emit = defineEmits(['update:modelValue', 'search']);

const localValue = reactive({ ...(props.modelValue ?? defaultSearch()) });

watch(localValue, (val) => {
    emit('update:modelValue', val);
});

const emitSearch = () => {
    emit('search', localValue);
};

const toggleSortOrder = () => {
    localValue.sortOrder = localValue.sortOrder === 'asc' ? 'desc' : 'asc';
};

const openManagerSearch = () => {
    const popup = window.open(
        `/search-popup?type=manager&selected=${localValue.manager?.id ?? ''}`,
        'SearchPopup',
        'width=500,height=600',
    );

    window.handleUserSelect = (selectedItem) => {
        localValue.manager = selectedItem;
        popup.close();
    };
};

function defaultSearch() {
    return {
        category: '',
        keyword: '',
        manager: null,
        filter: '',
        sort: 'date',
        sortOrder: 'asc',
    };
}
</script>
