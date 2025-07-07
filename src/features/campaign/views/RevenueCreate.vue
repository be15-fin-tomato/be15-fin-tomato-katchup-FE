<script setup>
import { useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';
import { createRevenue, getContractReference } from '@/features/campaign/api.js';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import FileUploadCard from '@/features/campaign/components/FileUploadCard.vue';
import { useToast } from 'vue-toastification';
import { useAuthStore } from '@/stores/auth.js';

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

// 저장
const save = async () => {
    try {
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
    console.log('의견 등록', authStore.userName);
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
const handleReferenceSelect = (item) => {
    if (!isEditing.value) {
        alert('수정 모드가 아닙니다!');
        return;
    }

    Object.keys(form).forEach((key) => {
        form[key] = Array.isArray(form[key]) ? [] : typeof form[key] === 'object' ? {} : '';
    });

    form.title = item.title;
    form.requestDate = item.requestDate;
    form.clientCompany = { ...(item.clientCompany ?? {}) };
    form.clientManager = { ...(item.clientManager ?? {}) };
    form.period = item.period;
    form.announcementDate = item.announcementDate;
    form.pipeline = item.pipeline;
    form.username = { ...(item.username ?? {}) };
    form.influencer = Array.isArray(item.influencer) ? [...item.influencer] : [item.influencer];
    form.status = item.status;
    form.adPrice = item.price;
    form.productPrice = item.supplyAmount;
    form.salesQuantity = item.extraProfit;
    form.content = item.content;
    form.notes = item.notes;
    form.startDate = item.startDate;
    form.endDate = item.endDate;
    form.showInfluencerContentInput = true;
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

// 계약 참조 불러오기
const fetchContractReferences = async () => {
    try {
        const res = await getContractReference();
        contractReferences.value = res.data.data;
    } catch (e) {
        console.error(e);
    }
};

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
                <DetailReferenceList :items="contractReferences" @select="handleReferenceSelect" />
            </div>

            <div class="container">
                <FileUploadCard :isEditing="isEditing" v-model="form.attachment" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
