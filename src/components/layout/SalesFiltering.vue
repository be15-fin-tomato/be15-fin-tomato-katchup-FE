<template>
    <form @submit.prevent="emitSearch" class="custom-sidebar flex flex-col gap-4">
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
                    :value="localValue.user?.name ?? ''"
                    placeholder="담당자"
                    class="input-form-box flex-1"
                    readonly
                />
                <button
                    @click="openUserSearch"
                    type="button"
                    class="ml-1 px-2 bg-gray-200 rounded text-sm"
                >
                    <img src="@/assets/icons/add.svg" alt="sort" class="w-5 select-none" />
                </button>
            </div>
        </div>

        <!-- 필터/정렬 -->
        <div v-if="filterOptions.length > 0">
            <div class="font-bold mb-3">상태</div>

            <!-- 필터 -->
            <select v-model="localValue.filter" class="input-form-box mb-2 w-full">
                <option value="">전체</option>
                <option v-for="option in filterOptions" :key="option.value" :value="option.value">
                    {{ option.label }}
                </option>
            </select>
        </div>
        <div>
            <!-- 정렬 -->
            <div class="font-bold mb-3">정렬</div>
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
        <button
            type="submit"
            class="w-full bg-btn-blue text-white font-semibold py-2 rounded-md hover:brightness-95 active:scale-95 active:brightness-90 transition transform shadow-sm hover:shadow-md"
        >
            검색
        </button>
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
    const modelValue = {
        category: val.category,
        keyword: val.keyword,
        userId: val.userId,
        filter: val.filter,
        sort: val.sort,
        sortOrder: val.sortOrder,
    };
    emit('update:modelValue', modelValue);
});

const emitSearch = () => {
    const searchParams = {
        category: localValue.category,
        keyword: localValue.keyword,
        userId: localValue.userId,
        filter: localValue.filter,
        sort: localValue.sort,
        sortOrder: localValue.sortOrder,
    };
    emit('search', searchParams);
};
const toggleSortOrder = () => {
    localValue.sortOrder = localValue.sortOrder === 'asc' ? 'desc' : 'asc';
};

const openUserSearch = () => {
    const popup = window.open(
        `/search-popup?type=one-user&selected=${localValue.user?.id ?? ''}`,
        'SearchPopup',
        'width=500,height=600',
    );

    window.handleUserSelect = (selectedItem) => {
        localValue.userId = selectedItem.id;
        localValue.user = selectedItem;
        popup.close();
    };
};

function defaultSearch() {
    return {
        category: '',
        keyword: '',
        userId: null,
        filter: '',
        sort: 'date',
        sortOrder: 'asc',
    };
}
</script>
