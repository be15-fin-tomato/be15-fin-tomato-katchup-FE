<script setup>
import { reactive } from 'vue';
import { useRouter } from 'vue-router';
import { createCampaign } from '@/features/campaign/api.js';
import CreateCampaignForm from '@/features/campaign/components/CreateCampaignForm.vue';

const router = useRouter();
const form = reactive({
    title: '',
    requestDate: '',
    announcementDate: '',
    period: '',
    pipeline: '',
    status: 2,
    clientCompany: null,
    clientManager: null,
    username: '',
    address: '',
    addressDetail: '',
    awarenessPath: '',
    productName: '',
    productPrice: 0,
    category: null,
    expectedRevenue: 0,
    expectedProfitMargin: 0,
    notes: '',
    influencer: [],
    price: 0,
    supplyAmount: 0,
    extraProfit: 0,
    content: '',
    user: [],
});

const buildRequestPayload = () => {
    const getId = (obj) => (typeof obj === 'object' && obj !== null ? obj.id : (obj ?? null));
    const getListOfIds = (list) =>
        Array.isArray(list) ? list.map(getId).filter((id) => id !== null) : [];

    return {
        campaignName: form.title,
        campaignStatusId: form.status,
        clientCompanyId: getId(form.clientCompany),
        clientManagerId: getId(form.clientManager),
        startedAt: form.requestDate,
        endedAt: form.announcementDate,
        userList: getListOfIds(form.user),
        awarenessPath: form.awarenessPath,
        productName: form.productName,
        productPrice: form.productPrice,
        expectedRevenue: form.expectedRevenue,
        expectedProfitMargin: form.expectedProfitMargin,
        notes: form.notes,
        categoryList: Array.isArray(form.category)
            ? form.category.map(getId)
            : form.category !== null
              ? [getId(form.category)]
              : [],
    };
};

const save = async () => {
    try {
        const payload = buildRequestPayload();
        console.log('📦 최종 전송 페이로드:', payload);
        const res = await createCampaign(payload);
        alert('캠페인이 생성되었습니다!');
        router.push('/campaign');
    } catch (e) {
        console.error(e);
        alert('캠페인 생성 실패');
    }
};
</script>

<template>
    <div class="container">
        <div class="page-header">
            <div class="page-title">캠페인 생성</div>
            <div class="flex justify-end gap-2">
                <button class="btn-create" @click="save()">저장</button>
                <button class="btn-delete" @click="router.back()">취소</button>
            </div>
        </div>
        <div class="blue-line"></div>
        <div class="flex">
            <div class="w-full">
                <CreateCampaignForm v-model:form="form" :isEditing="true" />
            </div>
        </div>
    </div>
</template>
