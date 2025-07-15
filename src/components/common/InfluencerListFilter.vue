<script setup>
import { ref, defineEmits, onMounted, onUnmounted } from 'vue';
import { TAGS } from '@/constants/tags';

const emit = defineEmits(['apply-filters']);

const influencerNameQuery = ref('');

const categories = ref(
    TAGS.map((tag, index) => ({
        name: tag,
        value: tag,
        id: index + 1,
    }))
);
const selectedCategories = ref([]);
const isCategoryDropdownOpen = ref(false);
const categoryDropdownRef = ref(null);

const displaySelectedCategories = ref('전체');
const updateDisplayCategories = () => {
    if (selectedCategories.value.length === 0) {
        displaySelectedCategories.value = '전체';
    } else {
        displaySelectedCategories.value = selectedCategories.value
            .map((name) => name)
            .join(', ');
    }
};
const handleCategoryChange = () => {
    updateDisplayCategories();
};
const toggleCategoryDropdown = () => {
    isCategoryDropdownOpen.value = !isCategoryDropdownOpen.value;
};
const handleClickOutsideCategory = (event) => {
    if (
        categoryDropdownRef.value &&
        !categoryDropdownRef.value.contains(event.target)
    ) {
        isCategoryDropdownOpen.value = false;
    }
};

const subscriberOptions = ref([
    { label: '전체', min: null, max: null },
    { label: '1만 미만', min: 0, max: 9999 },
    { label: '1만 ~ 5만', min: 10000, max: 49999 },
    { label: '5만 ~ 10만', min: 50000, max: 99999 },
    { label: '10만 ~ 50만', min: 100000, max: 499999 },
    { label: '50만 ~ 100만', min: 500000, max: 999999 },
    { label: '100만 이상', min: 1000000, max: null },
]);
const selectedSubscriberRange = ref(subscriberOptions.value[0]);

const followerOptions = ref([
    { label: '전체', min: null, max: null },
    { label: '1만 미만', min: 0, max: 9999 },
    { label: '1만 ~ 5만', min: 10000, max: 49999 },
    { label: '5만 ~ 10만', min: 50000, max: 99999 },
    { label: '10만 ~ 50만', min: 100000, max: 499999 },
    { label: '50만 ~ 100만', min: 500000, max: 999999 },
    { label: '100만 이상', min: 1000000, max: null },
]);
const selectedFollowerRange = ref(followerOptions.value[0]);

const resetFilters = () => {
    influencerNameQuery.value = '';
    selectedCategories.value = [];
    updateDisplayCategories();
    selectedSubscriberRange.value = subscriberOptions.value[0];
    selectedFollowerRange.value = followerOptions.value[0];
    applyFilters();
};

const applyFilters = () => {
    const categoryIdsToEmit = selectedCategories.value
        .map((name) => {
            const found = categories.value.find((cat) => cat.name === name);
            return found ? found.id : null;
        })
        .filter((id) => id !== null);

    const filtersToEmit = {
        influencerName: influencerNameQuery.value || null,
        categoryIds: categoryIdsToEmit.length > 0 ? categoryIdsToEmit : null,
        minSubscriber: selectedSubscriberRange.value.min,
        maxSubscriber: selectedSubscriberRange.value.max,
        minFollower: selectedFollowerRange.value.min,
        maxFollower: selectedFollowerRange.value.max,
    };

    for (const key in filtersToEmit) {
        if (
            filtersToEmit[key] === null ||
            filtersToEmit[key] === '' ||
            (Array.isArray(filtersToEmit[key]) && filtersToEmit[key].length === 0)
        ) {
            delete filtersToEmit[key];
        }
    }

    emit('apply-filters', filtersToEmit);
};

const handleEnterKey = (event) => {
    if (event.key === 'Enter') {
        applyFilters();
    }
};

onMounted(() => {
    document.addEventListener('click', handleClickOutsideCategory);
    updateDisplayCategories();
});
onUnmounted(() => {
    document.removeEventListener('click', handleClickOutsideCategory);
});
</script>

<template>
    <div class="custom-sidebar flex flex-col gap-2 overflow-y-auto">
        <p class="text-md font-semibold mb-3 mt-2">검색조건</p>

        <input
            type="text"
            v-model="influencerNameQuery"
            placeholder="인플루언서명"
            class="w-full border border-gray-medium rounded-md p-2 mb-3 focus:outline-none text-sm"
            @keyup.enter="handleEnterKey"
        />

        <p class="text-md font-semibold mb-3 mt-4">필터</p>

        <label class="block text-sm text-gray-dark mb-1">카테고리</label>
        <div class="relative mb-3" ref="categoryDropdownRef">
            <div
                class="w-full border border-gray-medium rounded-md p-2 cursor-pointer flex justify-between items-center"
                @click="toggleCategoryDropdown"
            >
                <span class="text-sm text-gray-dark truncate">{{ displaySelectedCategories }}</span>
                <i class="bi bi-chevron-down text-gray-500 text-sm" :class="{ 'rotate-180': isCategoryDropdownOpen }"></i>
            </div>

            <div
                v-if="isCategoryDropdownOpen"
                class="absolute z-10 w-full mt-1 bg-white border border-gray-medium rounded-md shadow-lg max-h-60 overflow-y-auto"
            >
                <div class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100">
                    <input
                        type="checkbox"
                        id="category-all"
                        :checked="selectedCategories.length === 0"
                        @change="selectedCategories = []; updateDisplayCategories();"
                        class="mr-2 h-4 w-4 text-blue-600 border-gray-medium rounded cursor-pointer"
                    />
                    <label for="category-all" class="text-sm text-gray-dark cursor-pointer">전체</label>
                </div>
                <div
                    v-for="category in categories"
                    :key="category.id"
                    class="flex items-center px-3 py-2 cursor-pointer hover:bg-gray-100"
                >
                    <input
                        type="checkbox"
                        :id="`category-${category.id}`"
                        :value="category.name"
                        v-model="selectedCategories"
                        @change="handleCategoryChange"
                        class="mr-2 h-4 w-4 text-blue-600 border-gray-medium rounded cursor-pointer"
                    />
                    <label :for="`category-${category.id}`" class="text-sm text-gray-dark cursor-pointer">
                        {{ category.name }}
                    </label>
                </div>
            </div>
        </div>

        <label class="block text-sm text-gray-dark mb-1">구독자 수 (만명)</label>
        <div class="relative mb-3">
            <select
                v-model="selectedSubscriberRange"
                class="appearance-none w-full border border-gray-medium rounded-md p-2 leading-tight focus:outline-none"
            >
                <option v-for="option in subscriberOptions" :key="option.label" :value="option">
                    {{ option.label }}
                </option>
            </select>
            <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <i class="bi bi-chevron-down text-gray-500 text-sm"></i>
            </div>
        </div>

        <label class="block text-sm text-gray-dark mb-1">팔로워 수 (만명)</label>
        <div class="relative mb-3">
            <select
                v-model="selectedFollowerRange"
                class="appearance-none w-full border border-gray-medium rounded-md p-2 leading-tight focus:outline-none"
            >
                <option v-for="option in followerOptions" :key="option.label" :value="option">
                    {{ option.label }}
                </option>
            </select>
            <div class="absolute inset-y-0 right-3 flex items-center pointer-events-none">
                <i class="bi bi-chevron-down text-gray-500 text-sm"></i>
            </div>
        </div>

        <button
            class="w-full bg-btn-blue text-white font-semibold py-2 rounded-md hover:brightness-95 active:scale-95 active:brightness-90 transition transform shadow-sm hover:shadow-md text-sm"
            @click="applyFilters"
        >
            검색
        </button>

        <button
            class="w-full bg-gray-200 text-gray-700 font-semibold py-2 rounded-md mb-5 hover:bg-gray-300 transition-colors shadow-md text-sm"
            @click="resetFilters"
        >
            초기화
        </button>
    </div>
</template>
