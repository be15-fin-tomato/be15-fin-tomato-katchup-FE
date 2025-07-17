<script setup>
import { useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';
import { createRevenue, getContractDetail, getContractReference } from '@/features/campaign/api.js';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import FileUploadCard from '@/features/campaign/components/FileUploadCard.vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth.js';
import { validateRequiredFields } from '@/features/campaign/utils/validator.js';

const router = useRouter();
const toast = useToast();
const authStore = useAuthStore();

const opinions = ref([]);
const contractReferences = ref([]);
const isEditing = ref(true);

const form = reactive({});

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
    {
        type: 'single',
        fields: [
            { key: 'content', label: '내용', type: 'textarea' },
            { key: 'notes', label: '피드백', type: 'textarea' },
        ],
    },
];

const fetchContractReferences = async () => {
    const res = await getContractReference();
    contractReferences.value = res.data.data.referenceList;
};

// 저장
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

        const requestForm = {
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

        await createRevenue(formData);
        toast.success('매출이 등록되었습니다.');
        isEditing.value = false;
        await router.replace('/sales/revenue');
    } catch (e) {
        toast.error(e?.response?.data?.message);
    }
};

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
// 참조 선택 시 폼 매핑
const handleReferenceSelect = async (item) => {
    if (!isEditing.value) {
        // 수정 모드 아닐 때는 무시
        toast.info('수정 상태가 아닙니다.');
        return;
    }
    const res = await getContractDetail(item.pipelineId);
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
        name: i.name,
    }));
    form.salesQuantity = resForm.availableQuantity;
    form.productPrice = resForm.productPrice;
};

// 인플루언서 선택 시 자동 매핑
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

// 총 수익 계산
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

onMounted(() => {
    fetchContractReferences();
});
</script>

<template>
    <div class="flex">
        <!-- 좌측 의견 바 -->
        <OpinionBar :opinions="opinions" @submit="handleSubmit" @delete="handleDelete" />

        <!-- 본문 영역 -->
        <div class="flex-1 flex flex-col gap-8">
            <!-- 상단: 매출 폼 -->
            <div class="container">
                <div class="page-header">
                    <div class="page-title">매출 생성</div>
                    <div class="flex justify-end gap-2">
                        <button class="btn-create" @click="save">저장</button>
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
