<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';
import {
    deleteIdea,
    deleteRevenue,
    getContractDetail,
    getContractReference,
    getIdea,
    getRevenueDetail,
    postIdea,
    updateRevenueDetail,
} from '@/features/campaign/api.js';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import FileUploadCard from '@/features/campaign/components/FileUploadCard.vue';
import { structuredForm } from '@/features/campaign/utils/structedForm.js';
import { useToast } from 'vue-toastification';

const route = useRoute();
const router = useRouter();
const toast = useToast();

const opinions = ref([]);
const revenueForm = ref(null);
const form = reactive({});
const contractReferences = ref([]);
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
                label: '해당 파이프라인',
                type: 'search-pipeline',
                searchType: 'campaign',
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
                key: 'productPrice',
                label: '상품 가격',
                type: 'input',
                inputType: 'number',
                width: 24,
            },
            {
                key: 'salesQuantity',
                label: '판매 수량',
                type: 'input',
                inputType: 'number',
                width: 24,
            },
            {
                key: 'totalRevenue',
                label: '총 수익',
                type: 'input',
                inputType: 'number',
                disabled: true,
                width: 50,
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
    // {
    //     type: 'horizontal',
    //     fields: [{ key: 'platform', label: '컨텐츠 목록', type: 'platform', width: 24 }],
    // },
    {
        type: 'single',
        fields: [
            { key: 'content', label: '내용', type: 'textarea' },
            { key: 'notes', label: '비고', type: 'textarea' },
        ],
    },
];

// 의견 호출
// const fetchOpinions = async () => {
//     try {
//         const res = await getOpinion(route.params.revenueId, 'revenue');
//         opinions.value = res.data.data;
//     } catch (e) {
//         console.log(e);
//     }
// };

// const fetchContractReferences = async () => {
//     try {
//         const res = await getContractReference();
//         contractReferences.value = res.data.data;
//     } catch (e) {
//         console.log(e);
//     }
// };

const fetchRevenueDetail = async () => {
    try {
        const res = await getRevenueDetail(route.params.revenueId);
        const rawForm = res.data.data.form;
        const fileList = res.data.data.fileList ?? [];

        const parsedForm = structuredForm(rawForm, fileList);
        revenueForm.value = parsedForm;
        Object.assign(form, parsedForm);

        contractReferences.value = res.data.data.referenceList ?? [];
        opinions.value = res.data.data.ideaList ?? [];
    } catch (e) {
        toast.error(e.data.message);
    }
};

// 의견 등록
const handleSubmit = async (newComment) => {
    try {
        await postIdea({ pipeline: route.params.revenueId, content: newComment });
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
    const res = await getIdea(route.params.revenueId);

    opinions.value = res.data.data.response;
};

const handleReferenceSelect = async (item) => {
    if (!isEditing.value) {
        alert('수정 모드가 아닙니다!');
        return;
    }

    // 기존 값 초기화
    // Object.keys(form).forEach((key) => {
    //     if (Array.isArray(form[key])) {
    //         form[key] = [];
    //     } else if (typeof form[key] === 'object' && form[key] !== null) {
    //         form[key] = {};
    //     } else {
    //         form[key] = '';
    //     }
    // });

    const res = await getContractDetail(item.pipelineId);
    const resForm = res.data.data.form;

    // 매핑
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
    form.salesQuantity = resForm.availableQuantity;
    form.productPrice = resForm.productPrice;
};

// 저장 및 취소
const save = async () => {
    try {
        const requestForm = {
            pipelineId: route.params.revenueId,
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
            productPrice: form.productPrice ?? 0,
            salesQuantity: form.salesQuantity ?? 0,
            influencerList:
                form.influencerContents?.map((i) => ({
                    influencerId: i.influencerId,
                    youtubeLink: i.platform === 'youtube' ? i.url : null,
                    instagramLink: i.platform === 'instagram' ? i.url : null,
                    adPrice: i.adPrice,
                })) ?? [],

            existingFileList: form.attachment.filter((f) => !f.file && f.id).map((f) => f.id),
        };

        const formData = new FormData();
        formData.append(
            'request',
            new Blob([JSON.stringify(requestForm)], { type: 'application/json' }),
        );

        for (const f of form.attachment || []) {
            if (f.file) {
                formData.append('files', f.file);
            }
        }

        await updateRevenueDetail(formData);
        toast.success('매출이 수정되었습니다.');
        await fetchRevenueDetail();
    } catch (e) {
        toast.error(e?.response?.data?.message);
    }
    isEditing.value = false;
};

const remove = async () => {
    try {
        await deleteRevenue(route.params.revenueId);
        toast.success('매출이 삭제되었습니다.');
        await router.replace('/sales/revenue');
    } catch (e) {
        toast.error(e.response.data.message);
    }
};

const cancel = () => {
    Object.keys(form).forEach((key) => {
        const original = revenueForm.value?.[key];

        if (Array.isArray(original)) {
            form[key] = [...original];
        } else if (typeof original === 'object' && original !== null) {
            form[key] = { ...original };
        } else {
            form[key] = original ?? '';
        }
    });

    const price = parseInt(form.productPrice) || 0;
    const quantity = parseInt(form.salesQuantity) || 0;
    form.totalRevenue = price * quantity;
    isEditing.value = false;
};
watch(
    () => [form.productPrice, form.salesQuantity],
    ([productPrice, salesQuantity]) => {
        const price = parseInt(productPrice) || 0;
        const quantity = parseInt(salesQuantity) || 0;
        form.totalRevenue = price * quantity;
    },
);

watch(
    () => form.campaign?.id,
    async (newVal) => {
        if (newVal) {
            const res = await getContractReference(newVal);
            contractReferences.value = res.data.data.referenceList;
        } else {
            contractReferences.value = []; // campaignId 없으면 초기화
        }
    },
);

// 인플루언서 선택 변경 시 자동 생성
watch(
    () => form.influencer,
    (influencers) => {
        if (!Array.isArray(influencers)) return;

        form.influencerContents =
            form.influencerContents?.filter((item) =>
                influencers.some((inf) => inf.id === item.influencerId),
            ) ?? [];

        for (const inf of influencers) {
            if (!form.influencerContents.some((i) => i.influencerId === inf.id)) {
                form.influencerContents.push({
                    influencerId: inf.id,
                    name: inf.name,
                    platform: 'youtube',
                    url: '',
                });
            }
        }
    },
    { immediate: true },
);

onMounted(async () => {
    await Promise.all([fetchRevenueDetail()]);
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
                    <div class="page-title">매출</div>
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
                            @click="router.push('/sales/revenue')"
                        />
                    </div>
                </div>

                <div class="blue-line"></div>

                <SalesForm v-model="form" :groups="groups" :isEditing="isEditing" />
            </div>

            <!-- 하단: 참조 리스트 -->
            <div class="container">
                <DetailReferenceList
                    :title="'매출 정보 자동 입력'"
                    :items="contractReferences"
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
