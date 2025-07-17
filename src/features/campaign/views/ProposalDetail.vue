<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import { Icon } from '@iconify/vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import ProposalAccordionItem from '@/features/campaign/components/ProposalAccordionItem.vue';
import {
    deleteIdea,
    deleteProposal,
    getIdea,
    getInfluencerDetail,
    getListupDetail,
    getListupReference,
    getProposalDetail,
    postIdea,
    updateProposal,
} from '@/features/campaign/api.js';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import { validateRequiredFields } from '@/features/campaign/utils/validator.js';
import { useToast } from 'vue-toastification';
import { structuredForm } from '@/features/campaign/utils/structedForm.js';
import { fetchCampaignListByInfluencer } from '@/features/dashboard/api.js';

const router = useRouter();
const toast = useToast();

const opinions = ref([]);
const proposalForm = ref(null);
const form = reactive({});
const listUpReferences = ref([]);
const accordionItems = ref([]);
const isEditing = ref(false);
const isSaving = ref(false);
const route = useRoute();

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
            { key: 'notes', label: '피드백', type: 'textarea' },
        ],
    },
];

const openIndexes = ref([]);
const toggle = (index) => {
    if (openIndexes.value.includes(index)) {
        openIndexes.value = openIndexes.value.filter((i) => i !== index);
    } else {
        openIndexes.value.push(index);
    }
};

const handleReferenceSelect = async (item) => {
    if (!isEditing.value) {
        toast.info('수정 상태가 아닙니다.');
        return;
    }

    const res = await getListupDetail(item.pipelineId);
    const resForm = res.data.data.influencerList;
    // form.influencer = resForm;
    form.influencer = resForm.map((i) => ({
        id: i.influencerId,
        name: i.name,
        strength: '',
        notes: '',
    }));
};

// 저장 및 취소
const save = async () => {
    isSaving.value = true;
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
        await updateProposal(payload);
        toast.success('제안이 수정되었습니다.');
    } catch (e) {
        toast.error(e.response.data.message);
    } finally {
        isEditing.value = false;
        isSaving.value = false;
        await fetchProposalDetail();
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
        pipelineId: route.params.proposalId,
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
    };
};

const fetchProposalDetail = async () => {
    try {
        const res = await getProposalDetail(route.params.proposalId);
        const rawForm = res.data.data.form;

        const parsedForm = structuredForm(rawForm);
        proposalForm.value = parsedForm;
        Object.assign(form, parsedForm);

        listUpReferences.value = res.data.data.referenceList ?? [];
        opinions.value = res.data.data.ideaList ?? [];
    } catch (e) {
        toast.error(e.response.data.message || '제안 상세 조회에 실패하였습니다.');
    }
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
                const responseArray = Array.isArray(res) ? res : [res];

                const enrichedRawList = await Promise.all(
                    responseArray.map(async (raw) => {
                        const campaignRes = await fetchCampaignListByInfluencer(raw.influencerId);

                        raw.campaignRecord = campaignRes.data.data ?? [];

                        return raw;
                    }),
                );

                const detailed = enrichedRawList.map(normalizeInfluencer);

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
                toast.error(e.response?.data?.message || '인플루언서 상세 조회에 실패하였습니다.');
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
const handleSubmit = async (newComment) => {
    try {
        await postIdea({ pipeline: route.params.proposalId, content: newComment });
        await fetchOpinion();
        toast.success('의견이 등록되었습니다.');
    } catch (e) {
        toast.error(e.data.message);
    }
};

const fetchOpinion = async () => {
    const res = await getIdea(route.params.proposalId);

    opinions.value = res.data.data.response;
};

// 의견 삭제
const handleDelete = async (id) => {
    try {
        await deleteIdea(id);
        await fetchOpinion();
        toast.success('의견이 삭제되었습니다.');
    } catch (e) {
        toast.error(e.response.data.message);
    }
};

const remove = async () => {
    try {
        await deleteProposal(route.params.proposalId);
        toast.success('제안이 삭제되었습니다.');
        await router.replace('/sales/proposal');
    } catch (e) {
        toast.error(e.response.data.message);
    }
};

onMounted(async () => {
    /* TODO 댓글, 래퍼런스, 상세 정보 불러와야 함!*/
    // await fetchOpinions();
    // await fetchProposalDetail();
    await Promise.all([fetchProposalDetail()]);
});

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
                        <button class="btn-delete" @click="isEditing ? cancel() : remove()">
                            {{ isEditing ? '취소' : '삭제' }}
                        </button>

                        <button
                            class="btn-create flex items-center gap-1 justify-center transition"
                            @click="isEditing ? save() : (isEditing = true)"
                            :disabled="isSaving"
                        >
                            <span
                                v-if="isSaving"
                                class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"
                            ></span>
                            {{ isEditing ? (isSaving ? '저장 중...' : '저장') : '수정' }}
                        </button>
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

            <!-- 하단: 참조 리스트 -->
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
