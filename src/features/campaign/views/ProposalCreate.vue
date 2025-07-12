<script setup>
import { useRouter } from 'vue-router';
import { reactive, ref, watch } from 'vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import { Icon } from '@iconify/vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import ProposalAccordionItem from '@/features/campaign/components/ProposalAccordionItem.vue';
import {
    createProposal,
    getInfluencerDetail,
    getListupDetail,
    getListupReference,
} from '@/features/campaign/api.js';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import { validateRequiredFields } from '@/features/campaign/utils/validator.js';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth.js';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();
const opinions = ref([]);
const proposalForm = ref(null);
const form = reactive({});
const listUpReferences = ref([]);
const accordionItems = ref([]);
const isEditing = ref(true);

const groups = [
    {
        type: 'horizontal',
        fields: [
            { key: 'name', label: '제목', type: 'input', essential: true },
            { key: 'requestAt', label: '요청일', type: 'date', inputType: 'date' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'clientCompany',
                label: '고객사',
                type: 'search-company',
                searchType: 'company',
                essential: true,
            },
            { key: 'period', label: '제안 기간', type: 'date-range' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'clientManager',
                label: '광고담당자',
                type: 'search-manager',
                searchType: 'manager',
                essential: true,
                extends: 'clientCompany',
            },
            { key: 'presentAt', label: '발표일', type: 'input', inputType: 'date' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'campaign',
                label: '캠페인',
                type: 'search-pipeline',
                searchType: 'pipeline',
                essential: true,
                extends: 'clientCompany',
            },
            {
                key: 'username',
                label: '담당자',
                type: 'search-user',
                searchType: 'user',
                essential: true,
            },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'influencer',
                label: '인플루언서',
                type: 'search-influencer',
                searchType: 'influencer',
                essential: true,
            },
            {
                key: 'status',
                label: '진행단계',
                type: 'select',
                options: [
                    { value: 1, label: '승인요청' },
                    { value: 2, label: '승인완료' },
                    { value: 3, label: '보류/대기' },
                    { value: 4, label: '승인거절' },
                ],
                essential: true,
            },
        ],
    },
    {
        type: 'single',
        fields: [
            { key: 'content', label: '내용', type: 'textarea' },
            { key: 'notes', label: '비고', type: 'textarea' },
        ],
    },
];

const AGE_LABELS = {
    youtube: {
        youtubeAge1317: '13-17',
        youtubeAge1824: '18-24',
        youtubeAge2534: '25-34',
        youtubeAge3544: '35-44',
        youtubeAge4554: '45-54',
        youtubeAge5564: '55-64',
        youtubeAge65Plus: '65+',
    },
    instagram: {
        instagramAge1317: '13-17',
        instagramAge1824: '18-24',
        instagramAge2534: '25-34',
        instagramAge3544: '35-44',
        instagramAge4554: '45-54',
        instagramAge5564: '55-64',
        instagramAge65Plus: '65+',
    },
};

const calculateAgeTop = (data, platform) => {
    const ageMap = AGE_LABELS[platform];

    const entries = Object.entries(ageMap)
        .map(([key, label]) => ({
            label,
            rate: data[key],
        }))
        .filter((item) => item.rate !== null && item.rate !== undefined);

    return entries.sort((a, b) => b.rate - a.rate).slice(0, 3);
};

const normalizeInfluencer = (raw) => {
    return {
        influencerId: raw.influencerId,
        name: raw.youtubeName || raw.instagramName || '이름 없음',
        imageUrl: raw.imageUrl,
        strength: raw.strength || '',
        note: raw.note || '',
        campaignHistory: raw.campaignRecord || [],
        platform: {
            youtube: {
                subscribers: raw.subscriber,
                averageView: raw.youtubeAvgViews,
                averageLike: raw.youtubeAvgLikes,
                averageComment: raw.youtubeAvgComments,
                category: null,
                ageTop1: calculateAgeTop(raw, 'youtube')[0] ?? null,
                ageTop2: calculateAgeTop(raw, 'youtube')[1] ?? null,
                ageTop3: calculateAgeTop(raw, 'youtube')[2] ?? null,
                genderTop1:
                    raw.youtubeGenderMale !== null
                        ? { label: '남성', rate: raw.youtubeGenderMale }
                        : null,
                genderTop2:
                    raw.youtubeGenderFemale !== null
                        ? { label: '여성', rate: raw.youtubeGenderFemale }
                        : null,
            },
            instagram: {
                averageView: raw.instagramAvgViews,
                averageLike: raw.instagramAvgLikes,
                averageComment: raw.instagramAvgComments,
                followers: raw.follower,
                category: null,
                ageTop1: calculateAgeTop(raw, 'instagram')[0] ?? null,
                ageTop2: calculateAgeTop(raw, 'instagram')[1] ?? null,
                ageTop3: calculateAgeTop(raw, 'instagram')[2] ?? null,
                genderTop1:
                    raw.instagramGenderMale !== null
                        ? { label: '남성', rate: raw.instagramGenderMale }
                        : null,
                genderTop2:
                    raw.instagramGenderFemale !== null
                        ? { label: '여성', rate: raw.instagramGenderFemale }
                        : null,
            },
        },
    };
};

const buildProposalPayload = (form, accordionItems) => {
    return {
        campaignId: form.campaign?.id,
        campaignName: form.campaign?.name,
        pipelineStatusId: form.status,
        clientCompanyId: form.clientCompany?.id,
        clientManagerId: form.clientManager?.id,
        userId: form.username?.map((u) => u.id) ?? [],
        name: form.name,
        requestAt: form.requestAt,
        startedAt: form.startedAt,
        endedAt: form.endedAt,
        presentedAt: form.presentAt,
        content: form.content,
        notes: form.notes,
        influencerList: accordionItems.map((item) => {
            const inf = item.influencer;
            return {
                influencerId: inf.influencerId,
                strength: inf.strength ?? '',
                notes: inf.note ?? '',
            };
        }),
        ideaList: opinions.value.map((op) => ({ content: op.content })),
    };
};

const openIndexes = ref([]);
const toggle = (index) => {
    if (openIndexes.value.includes(index)) {
        openIndexes.value = openIndexes.value.filter((i) => i !== index);
    } else {
        openIndexes.value.push(index);
    }
};

// 저장 및 취소
const save = async () => {
    const requiredFields = [
        { key: 'name', label: '제목' },
        { key: 'clientCompany', label: '고객사' },
        { key: 'clientManager', label: '광고담당자' },
        { key: 'campaign', label: '해당 파이프라인' },
        { key: 'username', label: '담당자' },
        { key: 'influencer', label: '인플루언서' },
        { key: 'status', label: '진행단계' },
    ];
    if (!validateRequiredFields(form, requiredFields, toast)) return;

    const payload = buildProposalPayload(form, accordionItems.value);

    try {
        console.log('전송 데이터:', payload);
        await createProposal(payload);
        toast.success('제안이 등록되었습니다.');
        isEditing.value = false;
        await router.push('/sales/proposal');
    } catch (e) {
        toast.error(e?.response?.data?.message);
    }
};

const cancel = () => {
    Object.assign(form, proposalForm.value);
    isEditing.value = false;
};

const fetchInfluencerDetail = async (ids) => {
    const res = await getInfluencerDetail(ids);
    return res.data.data.influencerDetail;
};

watch(
    () => form.influencer,
    async (influencers) => {
        if (!influencers || influencers.length === 0) {
            accordionItems.value = [];
            openIndexes.value = [];
            return;
        }

        if (influencers[0] && !influencers[0].platform) {
            const ids = influencers.map((i) => i.id);
            try {
                const res = await fetchInfluencerDetail(ids);
                const detailed = Array.isArray(res)
                    ? res.map(normalizeInfluencer)
                    : [normalizeInfluencer(res)];

                // 👉 form.influencer의 strength/note 병합
                const enriched = detailed.map((inf) => {
                    const origin = influencers.find((i) => i.id === inf.influencerId);
                    return {
                        ...inf,
                        strength: origin?.strength ?? '',
                        note: origin?.note ?? '',
                    };
                });

                accordionItems.value = enriched.map((inf, idx) => ({
                    title: `${idx + 1}. ${inf.name}`,
                    component: ProposalAccordionItem,
                    influencer: inf,
                }));
                openIndexes.value = enriched.map((_, i) => i);
            } catch (e) {
                console.error('인플루언서 상세 fetch 실패:', e);
            }
        }

        if (influencers[0] && influencers[0].platform) {
            accordionItems.value = influencers.map((inf, idx) => ({
                title: `${idx + 1}. ${inf.name}`,
                component: ProposalAccordionItem,
                influencer: inf,
            }));
            openIndexes.value = influencers.map((_, i) => i);
        }
    },
    { immediate: true },
);

// 의견 등록
const handleSubmit = (newComment) => {
    opinions.value.push({
        id: Date.now(),
        userName: authStore.userName,
        content: newComment,
        createdAt: new Date().toISOString().slice(0, 19).replace('T', ' '),
    });
};

// 의견 삭제
const handleDelete = (id) => {
    opinions.value = opinions.value.filter((opinion) => opinion.id !== id);
};

const handleReferenceSelect = async (item) => {
    if (!isEditing.value) {
        alert('수정 모드가 아닙니다!');
        return;
    }

    const res = await getListupDetail(item.pipelineId);
    const resForm = res.data.data.influencerList;
    // form.influencer = resForm;
    form.influencer = resForm.map((i) => ({
        id: i.influencerId,
        name: i.influencerName,
        strength: '',
        notes: '',
    }));
};

watch(
    () => form.campaign?.id,
    async (newVal) => {
        if (newVal) {
            const res = await getListupReference(newVal);
            listUpReferences.value = res.data.data.referenceList;
        } else {
            listUpReferences.value = []; // campaignId 없으면 초기화
        }
    },
);

// onMounted(async () => {
//     /* TODO 댓글, 래퍼런스, 상세 정보 불러와야 함!*/
//     await fetchListupReference();
// });
</script>

<template>
    <div class="flex">
        <!-- 좌측 의견 바 -->
        <OpinionBar :opinions="opinions" @submit="handleSubmit" @delete="handleDelete" />

        <!-- 본문 영역 -->
        <div class="flex-1 flex flex-col gap-8">
            <!-- 상단: 견적 폼 -->
            <div class="container">
                <div class="page-header">
                    <div class="page-title">제안</div>
                    <div class="flex justify-end gap-2">
                        <button class="btn-create" @click="save">저장</button>
                        <Icon
                            icon="material-symbols:lists-rounded"
                            width="32"
                            height="32"
                            class="text-btn-gray"
                            @click="router.push('/sales/proposal')"
                        />
                    </div>
                </div>

                <div class="blue-line"></div>

                <SalesForm v-model="form" :groups="groups" :isEditing="isEditing" />
            </div>

            <div class="container">
                <DetailReferenceList
                    :title="'제안 정보 자동 입력'"
                    :items="listUpReferences"
                    @select="handleReferenceSelect"
                />
            </div>
            <div class="w-full mx-auto">
                <div
                    v-for="(item, index) in accordionItems"
                    :key="index"
                    class="mb-2 rounded-xl shadow border border-gray-200"
                >
                    <!-- 아코디언 헤더 -->
                    <button
                        @click="toggle(index)"
                        class="w-full px-4 py-3 flex justify-between items-center text-left font-medium rounded-t-lg bg-btn-sky text-gray-700 hover:brightness-95 transition"
                    >
                        <span>{{ item.title }}</span>
                        <svg
                            :class="[
                                'w-5 h-5 transition-transform duration-200',
                                { 'rotate-180': openIndexes.includes(index) },
                            ]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M19 9l-7 7-7-7"
                            />
                        </svg>
                    </button>

                    <!-- 아코디언 콘텐츠 -->
                    <transition name="accordion">
                        <div
                            v-show="openIndexes.includes(index)"
                            class="px-4 py-3 text-sm text-gray-600 bg-white"
                        >
                            <ProposalAccordionItem
                                :influencer="item.influencer"
                                :isEditing="isEditing"
                            />
                        </div>
                    </transition>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
    transition: max-height 0.3s ease;
}
.accordion-enter-from,
.accordion-leave-to {
    max-height: 0;
}
.accordion-enter-to,
.accordion-leave-from {
    max-height: 800px; /* 충분한 최대 높이 */
}
</style>
