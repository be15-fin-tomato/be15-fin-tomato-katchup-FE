<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';
import {
    deleteContract,
    deleteIdea,
    getContractDetail,
    getIdea,
    getQuotationDetail,
    getQuotationReference,
    postIdea,
    updateContractDetail,
} from '@/features/campaign/api.js';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import FileUploadCard from '@/features/campaign/components/FileUploadCard.vue';
import { structuredForm } from '@/features/campaign/utils/structedForm.js';
import { useToast } from 'vue-toastification';
import { validateRequiredFields } from '@/features/campaign/utils/validator.js';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const opinions = ref([]);
const contractForm = ref(null);
const form = reactive({});
const quotationReferences = ref([]);
const isEditing = ref(false);

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

const fetchContractDetail = async () => {
    try {
        const res = await getContractDetail(route.params.contractId);
        const rawForm = res.data.data.form;
        const fileList = res.data.data.fileList ?? [];

        const parsedForm = structuredForm(rawForm, fileList);
        contractForm.value = parsedForm;
        Object.assign(form, parsedForm);

        quotationReferences.value = res.data.data.referenceList ?? [];
        opinions.value = res.data.data.ideaList ?? [];
    } catch (e) {
        toast.error(e.data.message);
    }
};

// 의견 등록
const handleSubmit = async (newComment) => {
    try {
        await postIdea({ pipeline: route.params.contractId, content: newComment });
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

const fetchOpinion = async () => {
    const res = await getIdea(route.params.contractId);

    opinions.value = res.data.data.response;
};

const handleReferenceSelect = async (item) => {
    if (!isEditing.value) {
        // 수정 모드 아닐 때는 무시
        alert('수정 모드가 아닙니다!');
        return;
    }
    const res = await getQuotationDetail(item.pipelineId);
    const resForm = res.data.data.form;

    // form 필드 매핑
    form.clientCompany = {
        id: resForm.clientCompanyId,
        name: resForm.clientCompanyName,
    };
    form.clientManager = {
        id: resForm.clientManagerId,
        name: resForm.clientManagerName,
    };
    form.username = resForm.userList.map((u) => ({
        id: u.userId,
        name: u.userName,
    }));
    form.campaign = {
        id: resForm.campaignId,
        name: resForm.campaignName,
    };
    form.requestAt = resForm.requestAt;
    form.presentAt = resForm.presentAt;
    form.startedAt = resForm.startedAt;
    form.endedAt = resForm.endedAt;

    form.influencer = resForm.influencerList.map((i) => ({
        id: i.influencerId,
        name: i.influencerName,
    }));
    form.price = resForm.expectedRevenue;
    form.supplyAmount = resForm.availableQuantity;
    form.extraProfit = resForm.expectedProfit;
};

// 저장 및 취소
const save = async () => {
    try {
        const requiredFields = [
            { key: 'name', label: '제목' },
            { key: 'clientCompany', label: '고객사' },
            { key: 'clientManager', label: '광고담당자' },
            { key: 'campaign', label: '캠페인' },
            { key: 'username', label: '담당자' },
            { key: 'influencer', label: '인플루언서' },
            { key: 'status', label: '진행단계' },
        ];
        if (!validateRequiredFields(form, requiredFields, toast)) return;

        // 1. JSON DTO 구성
        const requestForm = {
            pipelineId: route.params.contractId,
            campaignId: form.campaign?.id ?? null,
            pipelineStatusId: form.status,
            clientCompanyId: form.clientCompany?.id ?? null,
            clientManagerId: form.clientManager?.id ?? null,
            userId: form.username?.map((user) => user.id) ?? [],
            name: form.name,
            requestAt: form.requestAt,
            startedAt: form.startedAt,
            endedAt: form.endedAt,
            presentedAt: form.presentAt,
            campaignName: form.campaign?.name ?? '',
            content: form.content,
            notes: form.notes,
            influencerId: form.influencer?.map((inf) => inf.id) ?? [],
            expectedRevenue: form.price,
            availableQuantity: form.supplyAmount,
            expectedProfit: form.extraProfit,

            existingFileList: form.attachment.filter((f) => !f.file && f.id).map((f) => f.id),
        };

        // 2. FormData 생성
        const formData = new FormData();
        formData.append(
            'request',
            new Blob([JSON.stringify(requestForm)], { type: 'application/json' }),
        );

        // 3. 새 파일만 첨부
        for (const f of form.attachment || []) {
            if (f.file) {
                formData.append('files', f.file);
            }
        }

        // 4. API 호출
        await updateContractDetail(formData);
        toast.success('견적이 수정되었습니다.');
        await fetchContractDetail(); // 다시 조회
    } catch (e) {
        toast.error(e?.response?.data?.message);
    }

    isEditing.value = false;
};

const cancel = () => {
    Object.assign(form, contractForm.value);
    isEditing.value = false;
};

const remove = async () => {
    try {
        await deleteContract(route.params.contractId);
        toast.success('계약이 삭제되었습니다.');
        await router.replace('/sales/contract');
    } catch (e) {
        toast.error(e.response.data.message);
    }
};

watch(
    () => form.campaign?.id,
    async (newVal) => {
        if (newVal) {
            const res = await getQuotationReference(newVal);
            quotationReferences.value = res.data.data.referenceList;
        } else {
            quotationReferences.value = []; // campaignId 없으면 초기화
        }
    },
);

onMounted(async () => {
    // await Promise.all([fetchContractDetail(), fetchQuotationReferences()]);
    await Promise.all([fetchContractDetail()]);
});
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
                    <div class="page-title">계약</div>
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
                            @click="router.push('/sales/contract')"
                        />
                    </div>
                </div>

                <div class="blue-line"></div>

                <SalesForm v-model="form" :groups="groups" :isEditing="isEditing" />
            </div>

            <!-- 하단: 참조 리스트 -->
            <div class="container">
                <DetailReferenceList
                    :title="'계약 정보 자동 입력'"
                    :items="quotationReferences"
                    @select="handleReferenceSelect"
                />
            </div>
            <div class="container">
                <FileUploadCard :isEditing="isEditing" v-model="form.attachment" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
