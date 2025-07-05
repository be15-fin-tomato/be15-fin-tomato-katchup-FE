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
                        <button class="btn-delete" @click="isEditing ? cancel() : remove()">
                            {{ isEditing ? '취소' : '삭제' }}
                        </button>

                        <button class="btn-create" @click="isEditing ? save() : (isEditing = true)">
                            {{ isEditing ? '저장' : '수정' }}
                        </button>

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
import {
    deleteIdea,
    deleteQuotationDetail,
    getIdea,
    getQuotationDetail,
    postIdea,
    updateQuotationDetail,
} from '@/features/campaign/api.js';
import { useRoute, useRouter } from 'vue-router';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import { structuredForm } from '../utils/structedForm';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const opinions = ref([]);
const quotationForm = ref(null);
const form = reactive({});
const proposalReferences = ref([]);
const isEditing = ref(false);

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
                label: '캠페인',
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

const fetchQuotationDetail = async () => {
    const res = await getQuotationDetail(route.params.quotationId);
    const rawForm = res.data.data.form;

    quotationForm.value = structuredForm(rawForm);
    Object.assign(form, structuredForm(rawForm));

    // 참고 리스트
    proposalReferences.value = res.data.data.refrenceList ?? [];

    opinions.value = res.data.data.ideaList ?? [];
};

// 마운트 시 전부 패칭
onMounted(async () => {
    await Promise.all([fetchQuotationDetail()]);
});

// 의견 등록
const handleSubmit = async (newComment) => {
    try {
        await postIdea({ pipeline: route.params.quotationId, content: newComment });
        await fetchOpinion();
        toast.success('의견이 등록되었습니다.');
    } catch (e) {
        toast.error(e.data.message);
    }
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

// 의견 호출
const fetchOpinion = async () => {
    const res = await getIdea(route.params.quotationId);

    opinions.value = res.data.data.response;
};

const handleReferenceSelect = (item) => {
    if (!isEditing.value) {
        // 수정 모드 아닐 때는 무시
        alert('수정 모드가 아닙니다!');
        return;
    }
    // 필요한 값만 form에 적용 (안전하게 매핑)
    form.name = item.name;
    form.requestAt = item.requestAt;
    form.clientCompanyName = item.clientCompanyName;
    form.clientManagerName = item.clientManagerName;
    form.period = item.period;
    form.presentAt = item.presentAt;
    form.campaign = item.campaign;
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
    try {
        const requestForm = {
            pipelineId: route.params.quotationId,
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
        };

        await updateQuotationDetail(requestForm);
        toast.success('견적이 수정되었습니다.');
        await fetchQuotationDetail();
    } catch (e) {
        toast.error(e.response.data.message);
    }

    isEditing.value = false;
};

const cancel = () => {
    Object.assign(form, quotationForm.value);
    isEditing.value = false;
};

const remove = async () => {
    try {
        await deleteQuotationDetail(route.params.quotationId);
        toast.success('견적이 삭제되었습니다.');
        await router.replace('/sales/quotation');
    } catch (e) {
        toast.error(e.response.data.message);
    }
};
</script>
