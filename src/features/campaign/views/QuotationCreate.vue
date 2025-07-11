<template>
    <div class="flex">
        <!-- 좌측 의견 바 -->
        <OpinionBar :opinions="opinions" @submit="handleSubmit" @delete="handleDelete" />

        <!-- 본문 영역 -->
        <div class="flex-1 flex flex-col gap-8">
            <!-- 상단: 견적 폼 -->
            <div class="container">
                <div class="page-header">
                    <div class="page-title">견적</div>
                    <div class="flex justify-end gap-2">
                        <button class="btn-create" @click="save">저장</button>
                        <Icon
                            icon="material-symbols:lists-rounded"
                            width="32"
                            height="32"
                            class="text-btn-gray"
                            @click="router.push('/sales/quotation')"
                        />
                    </div>
                </div>

                <div class="blue-line"></div>

                <SalesForm v-model="form" :groups="groups" :isEditing="isEditing" />
            </div>

            <!-- 하단: 참조 리스트 -->
            <div class="container">
                <DetailReferenceList
                    :title="'견적 정보 자동 입력'"
                    :items="proposalReferences"
                    @select="handleReferenceSelect"
                />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref, watch } from 'vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import {
    createQuotation,
    getContractReference,
    getProposalDetail,
    getProposalReference,
    getQuotationDetail,
} from '@/features/campaign/api.js';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth.js';
import { validateRequiredFields } from '@/features/campaign/utils/validator.js';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const opinions = ref([]);
const form = reactive({});
const proposalReferences = ref([]);
const isEditing = ref(true);

// form 그룹 정의
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
            { key: 'price', label: '견적가', type: 'input', inputType: 'number' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
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
            { key: 'supplyAmount', label: '공급가능수량', type: 'input', inputType: 'number' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            { key: '', label: '', type: 'spacer' },
            { key: 'extraProfit', label: '기대수익', type: 'input', inputType: 'number' },
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

const fetchProposalReferences = async (param) => {
    const res = await getProposalReference(param);
    proposalReferences.value = res.data.data.referenceList;
};

// 마운트 시 전부 패칭
// onMounted(async () => {
//     // await Promise.all([fetchProposalReferences()]);
// });

watch(
    () => form.campaign?.id,
    async (newVal) => {
        if (newVal) {
            const res = await fetchProposalReferences(newVal);
            proposalReferences.value = res.data.data.referenceList;
        } else {
            proposalReferences.value = []; // campaignId 없으면 초기화
        }
    },
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
        // 수정 모드 아닐 때는 무시
        alert('수정 모드가 아닙니다!');
        return;
    }

    const res = await getProposalDetail(item.pipelineId);
    const resForm = res.data.data.form;
    form.name = resForm.name;
    form.requestAt = resForm.requestAt;
    form.clientCompanyName = resForm.clientCompanyName;
    form.clientManagerName = resForm.clientManagerName;
    form.period = resForm.period;
    form.presentAt = resForm.presentAt;
    form.campaign = resForm.campaign;
    form.username = resForm.username;
    form.influencer = resForm.influencer;
    form.price = resForm.price;
    form.supplyAmount = resForm.supplyAmount;
    form.extraProfit = resForm.extraProfit;
    form.content = resForm.content;
    form.notes = resForm.notes;
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
    const requestForm = {
        campaignId: form.campaign?.id ?? null,
        pipelineStatusId: form.status,
        clientCompanyId: form.clientCompany?.id ?? null,
        clientManagerId: form.clientManager?.id ?? null,
        userId: form.username ? form.username.map((user) => user.id) : null,
        name: form.name,
        requestAt: form.requestAt,
        startedAt: form.startedAt,
        endedAt: form.endedAt,
        presentedAt: form.presentAt,
        campaignName: form.campaign?.name ?? '',
        content: form.content,
        notes: form.notes,
        influencerId: form.influencer ? form.influencer.map((inf) => inf.id) : null,
        expectedRevenue: form.price,
        availableQuantity: form.supplyAmount,
        expectedProfit: form.extraProfit,
        ideaList: opinions.value.map((op) => ({ content: op.content })),
    };

    try {
        await createQuotation(requestForm);
        isEditing.value = false;
        await router.push('/sales/quotation'); // 저장 후 목록으로 이동
    } catch (e) {
        toast.error(e.response.data.message);
    }
};

// const cancel = () => {
//     Object.assign(form, quotationForm.value);
//     isEditing.value = false;
// };
</script>
