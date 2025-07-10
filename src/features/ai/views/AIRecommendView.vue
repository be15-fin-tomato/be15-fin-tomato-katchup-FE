<template>
    <div class="relative">
        <div class="flex gap-6">
            <AddedInfluencers
                v-model:showModal="showModal"
                :added-influencers="addedInfluencers"
                :isEditing="!!id"
                @remove="removeInfluencer"
            />
            <AddToListupModal
                v-if="showModal"
                :selectedInfluencers="addedInfluencers"
                :isEditing="!!id"
                :campaign="editingCampaign"
                @close="showModal = false"
                @submit="handleAddToListup"
            />

            <div class="flex-1">
                <!-- 캠페인 검색 -->
                <div class="container mb-10">
                    <h2 class="text-lg font-bold text-black mb-2">캠페인 검색</h2>
                    <div class="blue-line mb-4"></div>

                    <div class="border border-gray-light rounded-md p-6 mb-6 w-full">
                        <div class="flex items-center gap-4 mb-4">
                            <!-- 고객사 -->
                            <label class="input-form-label text-black">고객사</label>
                            <div class="flex flex-1 gap-2">
                                <input
                                    :value="filters.clientCompany?.name ?? ''"
                                    class="input-form-box flex-1"
                                    readonly
                                />
                                <button
                                    class="btn-open-popup"
                                    @click="openSearchPopup(filters, 'clientCompany', 'company')"
                                >
                                    검색
                                </button>
                            </div>
                            <!-- 캠페인명 -->
                            <label class="input-form-label text-black">캠페인명</label>
                            <div class="flex flex-1 gap-2">
                                <input
                                    :value="filters.campaign?.name ?? ''"
                                    class="input-form-box flex-1"
                                />
                                <button
                                    class="btn-open-popup"
                                    :disabled="!filters.clientCompany"
                                    @click="
                                        openSearchPopup(
                                            filters,
                                            'campaign',
                                            'pipeline',
                                            'clientCompany',
                                        )
                                    "
                                >
                                    검색
                                </button>
                            </div>

                            <button
                                @click="fetchCampaigns"
                                class="bg-[#A6C8FF] text-white text-sm h-[40px] px-6 rounded hover:brightness-95"
                            >
                                찾기
                            </button>
                        </div>

                        <div>
                            <label class="input-form-label mb-2 block text-black">태그</label>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="(tag, i) in TAGS"
                                    :key="i + 1"
                                    :class="`${TAG_COLOR_MAP[tag]} px-2 py-1 rounded-full text-xs cursor-pointer`"
                                    @click="toggleTag(tag)"
                                    :style="{ opacity: selectedTags.includes(i + 1) ? '1' : '0.5' }"
                                >
                                    #{{ tag }}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div v-if="selectedTags.length" class="flex flex-wrap gap-2 mb-6">
                        <span
                            v-for="tag in selectedTags"
                            :key="tag"
                            :class="`${TAG_COLOR_MAP[TAGS[tag - 1]]} px-2 py-1 rounded-full text-xs flex items-center gap-1`"
                        >
                            #{{ TAGS[tag - 1] }}
                            <span
                                class="cursor-pointer font-bold text-black"
                                @click="toggleTag(TAGS[tag - 1])"
                                >×</span
                            >
                        </span>
                    </div>

                    <div
                        class="border border-gray-light rounded-md bg-white p-4 overflow-y-auto max-h-[300px]"
                    >
                        <table class="w-full text-sm text-center">
                            <thead class="text-xs text-gray-500 border-b border-gray-light">
                                <tr>
                                    <th class="py-2">#</th>
                                    <th>상태</th>
                                    <th>광고 업체</th>
                                    <th>캠페인명</th>
                                    <th>상품명</th>
                                    <th>AI 추천</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template
                                    v-for="(item, index) in campaignList"
                                    :key="item.campaignId"
                                >
                                    <tr v-if="item" class="h-[64px]">
                                        <td>{{ index + 1 }}</td>
                                        <td>
                                            <span
                                                class="text-white text-xs px-2 py-1 rounded ml-1"
                                                :class="{
                                                    'bg-red-300': item.campaignStatusId === 1,
                                                    'bg-pink-300': item.campaignStatusId === 2,
                                                    'bg-orange-300': item.campaignStatusId === 3,
                                                    'bg-blue-300': item.campaignStatusId === 4,
                                                    'bg-green-400': item.campaignStatusId === 5,
                                                }"
                                            >
                                                {{
                                                    campaignStatus[item.campaignStatusId] ??
                                                    '알수없음'
                                                }}
                                            </span>
                                        </td>
                                        <td class="font-semibold">{{ item.clientCompanyName }}</td>
                                        <td>{{ item.campaignName }}</td>
                                        <td>{{ item.productName }}</td>
                                        <td>
                                            <button
                                                class="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded hover:bg-blue-200"
                                                @click="
                                                    getRecommendationsByCampaignId(item.campaignId)
                                                "
                                            >
                                                AI 추천 받기
                                            </button>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </table>
                    </div>
                </div>

                <div v-if="showRecommendation" class="container mb-10 relative">
                    <button
                        class="absolute top-3 right-3 text-gray-400 hover:text-black z-10"
                        @click="showRecommendation = false"
                    >
                        <Icon icon="flowbite:close-outline" width="28" height="28" />
                    </button>

                    <AIInfluencerCard
                        :influencers="filteredAiInfluencers"
                        @close="showRecommendation = false"
                        @add-influencer="addInfluencer"
                    />
                </div>

                <div class="container">
                    <h2 class="text-lg font-bold text-black mb-2">인플루언서 검색</h2>
                    <div class="blue-line mb-4"></div>
                    <InfluencerCategory
                        :categories="categoryList"
                        @update:selected="selectedCategory = $event"
                    />

                    <div class="flex gap-2 mb-6 items-center">
                        <input
                            v-model="searchQuery"
                            class="input-form-box w-[300px]"
                            placeholder="Search"
                        />
                        <button class="bg-[#A6C8FF] text-white text-sm h-[40px] px-6 rounded">
                            찾기
                        </button>
                    </div>
                    <div class="overflow-y-auto max-h-[400px]">
                        <div
                            v-for="influencer in influencerList"
                            :key="influencer.influencerId"
                            class="flex justify-between items-center mb-4 p-4 bg-white border rounded"
                            @click="addInfluencer(influencer)"
                        >
                            <div class="flex items-center gap-4">
                                <img
                                    :src="influencer.youtube?.thumbnailUrl"
                                    alt="profile"
                                    class="w-12 h-12 rounded-full"
                                />
                                <div>
                                    <div class="font-semibold text-black">
                                        {{ influencer.youtube?.name || '해당 없음' }}
                                        <span class="text-xs text-gray-500"
                                            >({{ influencer.name }})</span
                                        >
                                    </div>
                                    <div class="font-semibold text-gray-500">
                                        @{{ influencer.instagram?.name || '해당 없음' }}
                                    </div>
                                    <div class="flex flex-wrap gap-2 mt-1">
                                        <span
                                            v-for="tag in influencer.tags ?? []"
                                            :key="tag.categoryId"
                                            :class="`${tagStyle(tag.categoryName)} px-2 py-1 rounded-full text-xs`"
                                        >
                                            #{{ tag.categoryName }}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div class="flex gap-4 items-center">
                                <div class="flex items-center gap-1 text-sm">
                                    <Icon icon="logos:youtube-icon" width="18" height="18" />
                                    <span>
                                        {{
                                            formatCount(influencer.youtube?.subscriber) ||
                                            '해당 없음'
                                        }}
                                    </span>
                                </div>
                                <div class="flex items-center gap-1 text-sm">
                                    <Icon icon="skill-icons:instagram" width="18" height="18" />
                                    <span>
                                        {{
                                            formatCount(influencer.instagram?.follower) ||
                                            '해당 없음'
                                        }}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive } from 'vue';
import axios from 'axios';
import { Icon } from '@iconify/vue';
import AddedInfluencers from '../components/AddedInfluencers.vue';
import AIInfluencerCard from '../components/AIInfluencerCard.vue';
import { TAG_COLOR_MAP, TAGS } from '@/constants/tags';
import AddToListupModal from '@/features/ai/components/AddToListupModal.vue';
import { useRoute } from 'vue-router';
import { fetchCampaignList, fetchListupDetail } from '@/features/ai/api.js';
import InfluencerCategory from '@/features/influencer/components/InfluencerCategory.vue';
import { fetchCategoryList, fetchInfluencerList } from '@/features/influencer/api.js';

const route = useRoute();

const filters = reactive({
    clientCompany: null,
    campaign: null,
    name: '',
    company: '',
});
const selectedTags = ref([]);
const campaignList = ref([]);
const recommendedInfluencers = ref([]);
const addedInfluencers = ref([]);
const showModal = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('전체');
const influencerList = ref([]);
const showRecommendation = ref(false);

const categoryMap = {
    전체: 'ALL',
    엔터테인먼트: 'Entertainment',
    일상: 'LifeStyle',
    푸드: 'Food',
    게임: 'Gaming',
    '뷰티/패션': 'Fashion & Beauty',
    여행: 'Travel',
    동물: 'Pet',
    교육: 'Education',
    기술: 'Technology',
    '건강/운동': 'Health & Fitness',
    키즈: 'Family & Kids',
};
const categoryList = ref([]);
const id = route.params.id;

const reverseCategoryMap = Object.fromEntries(
    Object.entries(categoryMap).map(([ko, en]) => [en, ko]),
);

const editingCampaign = ref({
    id: null,
    name: '',
    title: '',
});
const editingListup = ref(null);

const openSearchPopup = (targetObj, key, type, extendKey = null) => {
    if (extendKey && !targetObj[extendKey]) {
        alert('먼저 관련 값을 선택해주세요.');
        return;
    }

    const currentValue = targetObj[key];
    const selected = currentValue?.id ?? '';

    const clientCompanyId = targetObj.clientCompany?.id ?? '';

    const queryParams = new URLSearchParams({
        type,
        selected,
        ...(type === 'manager' || type === 'pipeline' ? { clientCompanyId } : {}),
    });

    const popup = window.open(
        `/search-popup?${queryParams.toString()}`,
        'SearchPopup',
        'width=500,height=600',
    );

    window.handleUserSelect = (selectedItem) => {
        targetObj[key] = selectedItem;
        popup.close();
    };
};

const handleAddToListup = (payload) => {
    console.log('캠페인:', payload.campaignName);
    console.log('상품:', payload.productName);
    console.log(payload);
    // TODO: 실제 리스트업 처리 로직
};

const toggleTag = (tag) => {
    const index = TAGS.indexOf(tag) + 1;
    if (selectedTags.value.includes(index)) {
        selectedTags.value = selectedTags.value.filter((i) => i !== index);
    } else {
        selectedTags.value.push(index);
    }
};

const tagStyle = (tag) => {
    return TAG_COLOR_MAP[tag] ?? 'bg-gray-200 text-black';
};

const formatCount = (value) => {
    if (!value || isNaN(value)) return '해당 없음';

    const num = Number(value);

    if (num < 10000) {
        return num.toLocaleString(); // 1,000처럼 쉼표 찍기
    }

    return (num / 10000).toFixed(1).replace(/\.0$/, '') + '만'; // 소수점 첫째자리, .0 제거
};

const filteredAiInfluencers = computed(() => {
    return recommendedInfluencers.value.filter((influencer) => {
        const matchCategory =
            selectedCategory.value === '전체' ||
            influencer.categories?.includes(selectedCategory.value);
        const matchSearch =
            searchQuery.value === '' ||
            influencer.name.includes(searchQuery.value) ||
            influencer.username.includes(searchQuery.value);
        return matchCategory && matchSearch;
    });
});

async function loadInfluencers() {
    const params = {
        page: 0,
        size: 50,
    };

    const res = await fetchInfluencerList(params);
    const rawList = res.data.data.data;

    if (selectedCategory.value === '전체') {
        influencerList.value = rawList;
    } else {
        const selectedEngCategory = categoryMap[selectedCategory.value];
        influencerList.value = rawList.filter((influencer) =>
            influencer.tags?.some((tag) => tag.categoryName === selectedEngCategory),
        );
    }
}

const campaignStatus = {
    1: '취소',
    2: '진행중',
    3: '보류',
    4: '게시대기',
    5: '완료',
};

const fetchCampaigns = async () => {
    const res = await fetchCampaignList({
        clientCompanyId: filters.clientCompany?.id ?? null,
        campaignName: filters.campaign?.name ?? null,
        tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
    });

    campaignList.value = res.data.data.campaignList;
};

const addInfluencer = (influencer, campaignName) => {
    const index = addedInfluencers.value.findIndex(
        (i) => i.influencerId === influencer.influencerId,
    );

    if (index === -1) {
        // 존재하지 않으면 추가
        addedInfluencers.value.push({
            ...influencer,
            campaignName,
        });
    } else {
        // 존재하면 삭제
        addedInfluencers.value.splice(index, 1);
    }
};

const removeInfluencer = (influencerId) => {
    addedInfluencers.value = addedInfluencers.value.filter((i) => i.influencerId !== influencerId);
};

const getRecommendationsByCampaignId = async (campaignId) => {
    try {
        const res = await axios.get(`/api/v1/ai/campaigns/${campaignId}/recommendations`);
        recommendedInfluencers.value = res.data.data;
        showRecommendation.value = true;
    } catch (e) {
        console.error('AI 추천 로딩 실패', e);
    }
};

onMounted(async () => {
    const categoryRes = await fetchCategoryList();
    const rawCategories = categoryRes.data.data;
    categoryList.value = [
        '전체',
        ...rawCategories.map((cat) => reverseCategoryMap[cat.categoryName] || cat.categoryName),
    ];
    await loadInfluencers();

    if (id) {
        try {
            const data = await fetchListupDetail(id);
            editingListup.value = data;

            // 캠페인 정보 정리
            editingCampaign.value = {
                id: data.id ?? null,
                name: data.campaignName ?? '',
                title: data.title ?? '',
            };

            filters.name = data.campaignName ?? '';
            searchQuery.value = data.searchQuery ?? '';
            selectedCategory.value = data.category ?? '전체';
            selectedTags.value = Array.isArray(data.tags) ? [...data.tags] : [];
            addedInfluencers.value = Array.isArray(data.influencers) ? [...data.influencers] : [];

            showModal.value = false;
        } catch (e) {
            console.error('리스트업 상세 조회 실패', e);
        }
    }

    await fetchCampaigns();
});
</script>

<style scoped>
.blue-line {
    height: 2px;
    background-color: #a6bdfc;
}
</style>
