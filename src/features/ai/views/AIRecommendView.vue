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
                                <input v-model="campaignNameModel" class="input-form-box flex-1" />
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

                    <div class="border border-gray-light rounded-md bg-white">
                        <!-- 상단 패딩 유지 영역 -->
                        <div class="px-4 pt-4"></div>

                        <!-- 테이블 스크롤 영역 -->
                        <div class="px-4 pb-4 overflow-y-auto max-h-[300px]">
                            <table class="w-full text-sm text-center border-collapse">
                                <thead
                                    class="sticky top-0 bg-white z-10 text-xs text-gray-500 border-b border-gray-light"
                                >
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
                                    <template v-if="campaignLoading">
                                        <tr
                                            v-for="n in 4"
                                            :key="'skeleton-' + n"
                                            class="h-[64px] animate-pulse"
                                        >
                                            <td>
                                                <div
                                                    class="h-4 bg-gray-200 rounded w-6 mx-auto"
                                                ></div>
                                            </td>
                                            <td>
                                                <div
                                                    class="h-6 w-14 bg-gray-300 rounded mx-auto"
                                                ></div>
                                            </td>
                                            <td>
                                                <div
                                                    class="h-4 bg-gray-200 rounded w-20 mx-auto"
                                                ></div>
                                            </td>
                                            <td>
                                                <div
                                                    class="h-4 bg-gray-200 rounded w-48 mx-auto"
                                                ></div>
                                            </td>
                                            <td>
                                                <div
                                                    class="h-4 bg-gray-200 rounded w-20 mx-auto"
                                                ></div>
                                            </td>
                                            <td>
                                                <div
                                                    class="h-6 bg-gray-300 rounded w-20 mx-auto"
                                                ></div>
                                            </td>
                                        </tr>
                                    </template>
                                    <template
                                        v-else
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
                                                        'bg-orange-300':
                                                            item.campaignStatusId === 3,
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
                                            <td class="font-semibold break-words whitespace-normal">
                                                {{ item.clientCompanyName }}
                                            </td>
                                            <td class="break-words whitespace-normal w-80">
                                                {{ item.campaignName }}
                                            </td>
                                            <td>{{ item.productName }}</td>
                                            <td>
                                                <button
                                                    class="btn-recommend"
                                                    @click="
                                                        selectedCampaignId = item.campaignId;
                                                        getRecommendationsByCampaignId(
                                                            item.campaignId,
                                                        );
                                                    "
                                                    :disabled="recommendLoading"
                                                    :class="{
                                                        'opacity-50 cursor-not-allowed':
                                                            recommendLoading,
                                                    }"
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
                            :influencers="recommendedInfluencerList"
                            :filterOptions="filterOptions"
                            :getRecommendationsByCampaignId="getRecommendationsByCampaignId"
                            :isLoading="recommendLoading"
                            :addedInfluencerIds="addedInfluencers.map((i) => i.influencerId)"
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
                            <template v-if="influencerLoading">
                                <div
                                    v-for="n in 6"
                                    :key="'skeleton-influencer-' + n"
                                    class="flex justify-between items-center mb-4 p-4 bg-white border rounded animate-pulse"
                                >
                                    <div class="flex items-center gap-4">
                                        <div class="w-12 h-12 rounded-full bg-gray-300"></div>
                                        <div class="space-y-2">
                                            <div class="w-40 h-4 bg-gray-200 rounded"></div>
                                            <div class="w-32 h-3 bg-gray-200 rounded"></div>
                                            <div class="flex gap-2">
                                                <div class="w-12 h-3 bg-gray-200 rounded"></div>
                                                <div class="w-16 h-3 bg-gray-200 rounded"></div>
                                            </div>
                                        </div>
                                    </div>
                                    <div class="flex flex-col gap-2">
                                        <div class="w-20 h-4 bg-gray-300 rounded"></div>
                                        <div class="w-20 h-4 bg-gray-300 rounded"></div>
                                    </div>
                                </div>
                            </template>

                            <!-- 실제 인플루언서 데이터 렌더링 -->
                            <template v-else>
                                <div
                                    v-for="influencer in influencerList"
                                    :key="influencer.influencerId"
                                    :class="[
                                        'flex justify-between items-center mb-4 p-4 border rounded cursor-pointer hover:shadow',
                                        addedInfluencers.some(
                                            (i) => i.influencerId === influencer.influencerId,
                                        )
                                            ? 'bg-indigo-50 border-indigo-300'
                                            : 'bg-white border-gray-medium',
                                    ]"
                                    @click="addInfluencer(influencer)"
                                >
                                    <div class="flex items-center gap-4">
                                        <img
                                            :src="
                                                influencer.youtube?.thumbnailUrl?.includes('ggpht')
                                                    ? influencer.youtube?.thumbnailUrl
                                                    : '/tomato.png'
                                            "
                                            alt="profile"
                                            class="w-12 h-12 rounded-full object-cover"
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
                                            <Icon
                                                icon="logos:youtube-icon"
                                                width="18"
                                                height="18"
                                            />
                                            <span>{{
                                                formatCount(influencer.youtube?.subscriber) ||
                                                '해당 없음'
                                            }}</span>
                                        </div>
                                        <div class="flex items-center gap-1 text-sm">
                                            <Icon
                                                icon="skill-icons:instagram"
                                                width="18"
                                                height="18"
                                            />
                                            <span>{{
                                                formatCount(influencer.instagram?.follower) ||
                                                '해당 없음'
                                            }}</span>
                                        </div>
                                    </div>
                                </div>
                            </template>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, reactive, watch } from 'vue';
import { Icon } from '@iconify/vue';
import AddedInfluencers from '../components/AddedInfluencers.vue';
import AIInfluencerCard from '../components/AIInfluencerCard.vue';
import { TAG_COLOR_MAP, TAGS } from '@/constants/tags';
import AddToListupModal from '@/features/ai/components/AddToListupModal.vue';
import { useRoute } from 'vue-router';
import {
    fetchCampaignList,
    fetchListupDetail,
    fetchRecommendInfluencerList,
} from '@/features/ai/api.js';
import InfluencerCategory from '@/features/influencer/components/InfluencerCategory.vue';
import { fetchCategoryList, fetchInfluencerList } from '@/features/influencer/api.js';
import { useToast } from 'vue-toastification';

const route = useRoute();

const filters = reactive({
    clientCompany: null,
    campaign: null,
});

const filterOptions = reactive([
    {
        label: '활성도가 높아요',
        checked: true,
        level: '75% 이상',
        levels: ['25% 이상', '50% 이상', '75% 이상'],
    },
    {
        label: '알고리즘 스코어가 높아요',
        checked: false,
        level: '75% 이상',
        levels: ['25% 이상', '50% 이상', '75% 이상'],
    },
    {
        label: '카테고리가 일치해요',
        checked: false,
    },
    {
        label: '선호 성별이 일치해요',
        level: '남자',
        levels: ['남자', '여자'],
        checked: false,
    },
    {
        label: '선호 연령이 일치해요',
        level: '18 ~ 24',
        levels: ['13 ~ 17', '18 ~ 24', '25 ~ 34', '25 ~ 44', '45 ~ 54', '55 ~ 64', '65이상'],
        checked: false,
    },
    {
        label: '광고주 만족도가 높아요',
        checked: true,
        level: '50% 이상',
        levels: ['25% 이상', '50% 이상', '75% 이상'],
    },
    {
        label: '인플루언서 구독자/팔로워 수',
        checked: false,
        level: '1천 이상',
        levels: ['500 이상', '1천 이상', '1만 이상', '10만 이상', '100만 이상', '200만 이상'],
    },
]);
const toast = useToast();

function mapFiltersToRequest(filterOptions) {
    const mapLevel = (level) => {
        if (!level) return null;
        if (level.includes('25')) return 25;
        if (level.includes('50')) return 50;
        if (level.includes('75')) return 75;
        if (level.includes('500')) return 500;
        if (level.includes('1천')) return 1000;
        if (level.includes('1만')) return 10000;
        if (level.includes('10만')) return 100000;
        if (level.includes('100만')) return 1000000;
        if (level.includes('200만')) return 2000000;
        return null;
    };

    const mapGender = (label) => {
        if (label === '남자') return 1;
        if (label === '여자') return 2;
        return null;
    };

    const mapAge = (label) => {
        if (label === '13 ~ 17') return 1317;
        if (label === '18 ~ 24') return 1824;
        if (label === '25 ~ 34') return 2534;
        if (label === '25 ~ 44') return 2544;
        if (label === '45 ~ 54') return 4554;
        if (label === '55 ~ 64') return 5564;
        if (label === '65이상') return 65;
        return null;
    };

    return {
        engagement: filterOptions[0].checked ? mapLevel(filterOptions[0].level) : null,
        algorithmScore: filterOptions[1].checked ? mapLevel(filterOptions[1].level) : null,
        categories: !!filterOptions[2].checked,
        preferredGender: filterOptions[3].checked ? mapGender(filterOptions[3].level) : null,
        preferredAgeRange: filterOptions[4].checked ? mapAge(filterOptions[4].level) : null,
        advertiserSatisfaction: filterOptions[5].checked ? mapLevel(filterOptions[5].level) : null,
        followerCount: filterOptions[6].checked ? mapLevel(filterOptions[6].level) : null,
    };
}
const selectedTags = ref([]);
const campaignList = ref([]);
const recommendedInfluencerList = ref([]);
const addedInfluencers = ref([]);
const showModal = ref(false);
const searchQuery = ref('');
const selectedCategory = ref('전체');
const selectedCampaignId = ref(null);
const influencerList = ref([]);
const showRecommendation = ref(false);
const campaignLoading = ref(false); // 캠페인 리스트 로딩
const influencerLoading = ref(false); // 인플루언서 리스트 로딩
const recommendLoading = ref(false); // AI 추천 로딩

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

async function loadInfluencers() {
    influencerLoading.value = true;
    try {
        const res = await fetchInfluencerList({ page: 0, size: 50 });
        const rawList = res.data.data.data;

        if (selectedCategory.value === '전체') {
            influencerList.value = rawList;
        } else {
            const selectedEngCategory = categoryMap[selectedCategory.value];
            influencerList.value = rawList.filter((influencer) =>
                influencer.tags?.some((tag) => tag.categoryName === selectedEngCategory),
            );
        }
    } catch (e) {
        console.error(e);
    } finally {
        influencerLoading.value = false;
    }
}
let initialized = false;

const campaignStatus = {
    1: '취소',
    2: '진행중',
    3: '보류',
    4: '게시대기',
    5: '완료',
};

const fetchCampaigns = async () => {
    campaignLoading.value = true;
    try {
        const res = await fetchCampaignList({
            clientCompanyId: filters.clientCompany?.id ?? null,
            campaignName: filters.campaign?.name ?? null,
            tags: selectedTags.value.length > 0 ? selectedTags.value : undefined,
        });
        campaignList.value = res.data.data.campaignList;
    } catch (e) {
        console.error(e);
    } finally {
        campaignLoading.value = false;
    }
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

const getRecommendationsByCampaignId = async () => {
    try {
        recommendLoading.value = true;
        showRecommendation.value = true;
        recommendedInfluencerList.value = [];
        const dto = mapFiltersToRequest(filterOptions);
        const campaignId = selectedCampaignId.value;

        const res = await fetchRecommendInfluencerList(campaignId, dto);
        recommendedInfluencerList.value = res.data.data.influencerList;
    } catch (e) {
        toast.error(e.response.data.message);
    } finally {
        recommendLoading.value = false;
    }
};

const campaignNameModel = computed({
    get: () => filters.campaign?.name ?? '',
    set: (val) => {
        if (!filters.campaign) filters.campaign = {};
        filters.campaign.name = val;
    },
});

watch(
    () => filters.clientCompany,
    () => {
        if (initialized) {
            filters.campaign = null;
        }
    },
);
onMounted(async () => {
    campaignLoading.value = true;
    influencerLoading.value = true;
    categoryList.value = ['전체'];
    filters.clientCompany = null;
    filters.campaign = null;
    const categoryRes = await fetchCategoryList();
    const rawCategories = categoryRes.data.data;
    categoryList.value = [
        '전체',
        ...rawCategories.map((cat) => reverseCategoryMap[cat.categoryName] || cat.categoryName),
    ];
    await loadInfluencers();

    if (id) {
        try {
            const res = await fetchListupDetail(id);
            const campaignId = res.data.data.campaignId;
            const campaignName = res.data.data.campaignName;
            const clientCompanyId = res.data.data.clientCompanyId;
            const clientCompanyName = res.data.data.clientCompanyName;
            const pipelineName = res.data.data.name;

            // 캠페인 정보 정리
            editingCampaign.value = {
                id: campaignId ?? null,
                name: campaignName ?? '',
                title: pipelineName ?? '',
            };

            filters.clientCompany = {
                id: clientCompanyId,
                name: clientCompanyName,
            };

            filters.campaign = {
                id: campaignId,
                name: campaignName,
            };

            const influencerList = res.data.data.influencerList;
            for (const influencer of influencerList) {
                if (influencer.youtube && typeof influencer.youtube.thumbnailUrl === 'string') {
                    influencer.youtube.thumbnailUrl = influencer.youtube.thumbnailUrl.replace(
                        /^"+|"+$/g,
                        '',
                    );
                }
                addInfluencer(influencer, campaignName);
            }

            showModal.value = false;
        } catch (e) {
            console.error('리스트업 상세 조회 실패', e);
        }
    }
    await fetchCampaigns();
    initialized = true;
});
</script>

<style scoped>
.blue-line {
    height: 2px;
    background-color: #a6bdfc;
}
</style>
