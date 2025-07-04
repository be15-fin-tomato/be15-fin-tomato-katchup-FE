<script setup>
import { useRoute, useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';
import { getContractReference, getRevenueDetail } from '@/features/campaign/api.js';
import { Icon } from '@iconify/vue';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import FileUploadCard from '@/features/campaign/components/FileUploadCard.vue';

const route = useRoute();
const router = useRouter();

const opinions = ref([]);
const revenueForm = ref(null);
const form = reactive({});
const contractReferences = ref([]);
const isEditing = ref(false);

const groups = [
    {
        type: 'horizontal',
        fields: [
            { key: 'title', label: '제목', type: 'input' },
            { key: 'requestDate', label: '요청일', type: 'date', inputType: 'date' },
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
            { key: 'announcementDate', label: '발표일', type: 'input', inputType: 'date' },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'pipeline',
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
            {
                key: 'status',
                label: '진행단계',
                type: 'select',
                options: ['승인요청', '진행중', '보류', '완료'],
            },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            {
                key: 'adPrice',
                label: '광고 단가',
                type: 'input',
                inputType: 'number',
                width: 50,
            },
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
        ],
    },
    {
        type: 'horizontal',
        fields: [
            { key: 'platform', label: '컨텐츠 목록', type: 'platform', width: 24 },
            {
                key: 'totalRevenue',
                label: '총 수익',
                type: 'input',
                inputType: 'number',
                disabled: true,
                width: 25,
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

// 의견 호출
// const fetchOpinions = async () => {
//     try {
//         const res = await getOpinion(route.params.revenueId, 'revenue');
//         opinions.value = res.data.data;
//     } catch (e) {
//         console.log(e);
//     }
// };

const fetchContractReferences = async () => {
    try {
        const res = await getContractReference();
        contractReferences.value = res.data.data;
    } catch (e) {
        console.log(e);
    }
};

const fetchRevenueDetail = async () => {
    try {
        const res = await getRevenueDetail();
        revenueForm.value = res.data.data;
        Object.assign(form, res.data.data);
    } catch (e) {
        console.log(e);
    }
};

// 의견 등록
const handleSubmit = (newComment) => {
    opinions.value.push({
        id: Date.now(),
        author: '나',
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
        alert('수정 모드가 아닙니다!');
        return;
    }

    // 기존 값 초기화
    Object.keys(form).forEach((key) => {
        if (Array.isArray(form[key])) {
            form[key] = [];
        } else if (typeof form[key] === 'object' && form[key] !== null) {
            form[key] = {};
        } else {
            form[key] = '';
        }
    });

    // 매핑
    form.title = item.title;
    form.requestDate = item.requestDate;
    form.clientCompany = { ...(item.clientCompany ?? {}) };
    form.clientManager = { ...(item.clientManager ?? {}) };
    form.period = item.period;
    form.announcementDate = item.announcementDate;
    form.pipeline = item.pipeline;
    form.username = { ...(item.username ?? {}) };
    form.influencer = [...(item.influencer ?? [])];
    form.status = item.status;
    form.adPrice = item.adPrice;
    form.productPrice = item.productPrice;
    form.salesQuantity = item.salesQuantity;
    form.content = item.content;
    form.notes = item.notes;
    form.startDate = item.startDate;
    form.endDate = item.endDate;
    form.showInfluencerContentInput = item.showInfluencerContentInput ?? false;
};

// 저장 및 취소
const save = () => {
    console.log('저장할 값:', form);
    isEditing.value = false;
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
    await Promise.all([fetchRevenueDetail(), fetchOpinions(), fetchContractReferences()]);
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
                <DetailReferenceList :items="contractReferences" @select="handleReferenceSelect" />
            </div>
            <div class="container">
                <FileUploadCard :isEditing="isEditing" v-model="form.attachments" />
            </div>
        </div>
    </div>
</template>

<style scoped></style>
