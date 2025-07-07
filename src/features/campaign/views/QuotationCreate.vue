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
                <DetailReferenceList :items="proposalReferences" @select="handleReferenceSelect" />
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, reactive, ref } from 'vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import { createQuotation, getProposalReference } from '@/features/campaign/api.js';
import { useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth.js';

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
            { key: 'name', label: '제목', type: 'input' },
            { key: 'requestAt', label: '요청일', type: 'date', inputType: 'date' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'clientCompany',
                label: '광고업체',
                type: 'search-company',
                searchType: 'company',
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
            },
            { key: 'presentAt', label: '발표일', type: 'input', inputType: 'date' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'campaign',
                label: '해당 파이프라인',
                type: 'search-pipeline',
                searchType: 'pipeline',
            },
            { key: 'username', label: '담당자', type: 'search-user', searchType: 'user' },
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

const fetchProposalReferences = async () => {
    const res = await getProposalReference();
    proposalReferences.value = res.data.data;
};

// 마운트 시 전부 패칭
onMounted(async () => {
    await Promise.all([fetchProposalReferences()]);
});

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

const handleReferenceSelect = (item) => {
    if (!isEditing.value) {
        // 수정 모드 아닐 때는 무시
        alert('수정 모드가 아닙니다!');
        return;
    }
    // 필요한 값만 form에 적용 (안전하게 매핑)
    form.title = item.title;
    form.requestDate = item.requestDate;
    form.clientCompany = item.clientCompany;
    form.clientManager = item.clientManager;
    form.period = item.period;
    form.announcementDate = item.announcementDate;
    form.pipeline = item.pipeline;
    form.username = item.username;
    form.influencer = item.influencer;
    form.price = item.price;
    form.supplyAmount = item.supplyAmount;
    form.extraProfit = item.extraProfit;
    form.content = item.content;
    form.notes = item.notes;
};

// 저장 및 취소
const save = async () => {
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
