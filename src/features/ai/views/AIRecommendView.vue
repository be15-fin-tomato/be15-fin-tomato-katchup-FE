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
                            <label class="input-form-label text-black">캠페인명</label>
                            <input v-model="filters.name" class="input-form-box flex-1" />

                            <label class="input-form-label text-black">고객사</label>
                            <input v-model="filters.company" class="input-form-box flex-1" />

                            <button
                                @click="applyFilter"
                                class="bg-[#A6C8FF] text-white text-sm h-[40px] px-6 rounded hover:brightness-95"
                            >
                                찾기
                            </button>
                        </div>

                        <div>
                            <label class="input-form-label mb-2 block text-black">태그</label>
                            <div class="flex flex-wrap gap-2">
                                <span
                                    v-for="tag in TAGS"
                                    :key="tag"
                                    :class="`${TAG_COLOR_MAP[tag]} px-2 py-1 rounded-full text-xs cursor-pointer`"
                                    @click="toggleTag(tag)"
                                    :style="{ opacity: selectedTags.includes(tag) ? '1' : '0.5' }"
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
                            :class="`${TAG_COLOR_MAP[tag]} px-2 py-1 rounded-full text-xs flex items-center gap-1`"
                        >
                            #{{ tag }}
                            <span
                                class="cursor-pointer font-bold text-black"
                                @click="toggleTag(tag)"
                                >×</span
                            >
                        </span>
                    </div>

                    <div
                        class="border border-gray-light rounded-md bg-white p-4 overflow-y-auto max-h-[400px]"
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
                                    v-for="(item, index) in filteredCampaigns"
                                    :key="item?.id ?? index"
                                >
                                    <tr v-if="item" class="h-[64px]">
                                        <td>{{ index + 1 }}</td>
                                        <td>
                                            <span
                                                class="text-white text-xs px-2 py-1 rounded bg-gray-600"
                                                >{{ item.status1 }}</span
                                            >
                                            <span
                                                class="text-white text-xs px-2 py-1 rounded ml-1"
                                                :class="
                                                    item.status2 === '제안'
                                                        ? 'bg-pink-300'
                                                        : 'bg-orange-300'
                                                "
                                            >
                                                {{ item.status2 }}
                                            </span>
                                        </td>
                                        <td class="font-semibold">{{ item.company }}</td>
                                        <td>{{ item.title }}</td>
                                        <td>{{ item.product }}</td>
                                        <td>
                                            <button
                                                class="bg-blue-100 text-blue-600 text-xs px-3 py-1 rounded hover:bg-blue-200"
                                                @click="getRecommendationsByCampaignId(item.id)"
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

                <div class="container overflow-y-auto max-h-[600px]">
                    <h2 class="text-lg font-bold text-black mb-2">인플루언서 검색</h2>
                    <div class="blue-line mb-4"></div>

                    <div class="grid grid-cols-7 gap-2 mb-4">
                        <button
                            v-for="category in categories"
                            :key="category"
                            :class="[
                                'text-sm h-[40px] px-6 rounded',
                                selectedCategory === category
                                    ? 'bg-[#A6C8E9] text-white'
                                    : 'text-black hover:text-blue-500',
                            ]"
                            @click="selectedCategory = category"
                        >
                            {{ category }}
                        </button>
                    </div>

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

                    <div
                        v-for="influencer in filteredInfluencers"
                        :key="influencer.id"
                        class="flex justify-between items-center mb-4 p-4 bg-white border rounded"
                    >
                        <div class="flex items-center gap-4">
                            <img
                                :src="influencer.imageUrl"
                                alt="profile"
                                class="w-12 h-12 rounded-full"
                            />
                            <div>
                                <div class="font-semibold text-black">{{ influencer.name }}</div>
                                <div class="text-xs text-gray-500">{{ influencer.username }}</div>
                                <div class="flex flex-wrap gap-2 mt-1">
                                    <span
                                        v-for="tag in influencer.tags"
                                        :key="tag"
                                        :class="`${TAG_COLOR_MAP[tag]} px-2 py-1 rounded-full text-xs`"
                                    >
                                        #{{ tag }}
                                    </span>
                                </div>
                            </div>
                        </div>
                        <div class="flex gap-4 items-center">
                            <div class="flex items-center gap-1 text-sm">
                                <Icon icon="logos:youtube-icon" width="18" height="18" />
                                <span>{{ influencer.followers }}</span>
                            </div>
                            <div class="flex items-center gap-1 text-sm">
                                <Icon icon="skill-icons:instagram" width="18" height="18" />
                                <span>{{ influencer.views }}</span>
                            </div>
                            <Icon
                                icon="icons8:plus"
                                width="24"
                                height="24"
                                class="cursor-pointer"
                                @click="addInfluencer(influencer)"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { Icon } from '@iconify/vue';
import AddedInfluencers from '../components/AddedInfluencers.vue';
import AIInfluencerCard from '../components/AIInfluencerCard.vue';
import { TAG_COLOR_MAP, TAGS } from '@/constants/tags';
import AddToListupModal from '@/features/ai/components/AddToListupModal.vue';
import { useRoute } from 'vue-router';
import { fetchListupDetail } from '@/features/ai/api.js';

const route = useRoute();

const filters = ref({ name: '', company: '' });
const selectedTags = ref([]);
const campaignList = ref([]);
const recommendedInfluencers = ref([]);
const addedInfluencers = ref([]);
const showModal = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('전체');
const allInfluencers = ref([]);
const showRecommendation = ref(false);
const categories = ['전체', '엔터테인먼트', '지식/정보', '푸드', '뷰티/패션', '키즈', '게임'];
const id = route.params.id;
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

const filteredInfluencers = computed(() => {
    return filteredAllInfluencers.value;
});

const handleAddToListup = (payload) => {
    console.log('캠페인:', payload.campaignName);
    console.log('상품:', payload.productName);
    // TODO: 실제 리스트업 처리 로직
};

const toggleTag = (tag) => {
    if (selectedTags.value.includes(tag)) {
        selectedTags.value = selectedTags.value.filter((t) => t !== tag);
    } else {
        selectedTags.value.push(tag);
    }
};

const applyFilter = () => {
    console.log('검색 이름:', filters.value.name);
    console.log('검색 고객사:', filters.value.company);
    console.log('선택된 태그:', selectedTags.value);
};

const fetchAllInfluencers = async () => {
    try {
        const res = await axios.get('/api/v1/influencers');
        allInfluencers.value = res.data.data;
    } catch (e) {
        console.error('전체 인플루언서 불러오기 실패', e);
    }
};

const filteredCampaigns = computed(() => {
    return (campaignList.value || []).filter((item) => {
        if (!item || typeof item !== 'object') return false;
        const title = item.title ?? '';
        const company = item.company ?? '';
        const tags = Array.isArray(item.tags) ? item.tags : [];
        const matchName = filters.value.name === '' || title.includes(filters.value.name);
        const matchCompany =
            filters.value.company === '' || company.includes(filters.value.company);
        const matchTags =
            selectedTags.value.length === 0 || selectedTags.value.some((tag) => tags.includes(tag));
        return matchName && matchCompany && matchTags;
    });
});

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

const filteredAllInfluencers = computed(() => {
    return allInfluencers.value.filter((influencer) => {
        const hasCategory = Array.isArray(influencer.categories);
        const matchCategory =
            selectedCategory.value === '전체' ||
            (hasCategory && influencer.categories.includes(selectedCategory.value));
        const matchSearch =
            searchQuery.value === '' ||
            influencer.name?.includes(searchQuery.value) ||
            influencer.username?.includes(searchQuery.value);
        return matchCategory && matchSearch;
    });
});

const fetchCampaigns = async () => {
    const res = await axios.get('/api/v1/ai/campaigns');
    campaignList.value = res.data.data;
    if (campaignList.value.length > 0) {
        const recRes = await axios.get(
            `/api/v1/ai/campaigns/${campaignList.value[0].id}/recommendations`,
        );
        recommendedInfluencers.value = recRes.data.data;
    }
};

const addInfluencer = (influencer, campaignName) => {
    const exists = addedInfluencers.value.find((i) => i.id === influencer.id);
    if (!exists) {
        addedInfluencers.value.push({
            ...influencer,
            campaignName,
        });
    }
};
const removeInfluencer = (id) => {
    addedInfluencers.value = addedInfluencers.value.filter((i) => i.id !== id);
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

            filters.value.name = data.campaignName ?? '';
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
    await fetchAllInfluencers();
});
</script>

<style scoped>
.blue-line {
    height: 2px;
    background-color: #a6bdfc;
}
</style>
