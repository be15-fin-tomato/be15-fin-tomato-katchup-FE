<script setup>
import { useRouter } from 'vue-router';
import { onMounted, reactive, ref, watch } from 'vue';
import OpinionBar from '@/components/layout/OpinionBar.vue';
import { Icon } from '@iconify/vue';
import SalesForm from '@/features/campaign/components/SalesForm.vue';
import ProposalAccordionItem from '@/features/campaign/components/ProposalAccordionItem.vue';
import { getInfluencerDetail, getListupReference } from '@/features/campaign/api.js';
import DetailReferenceList from '@/features/campaign/components/DetailReferenceList.vue';
const router = useRouter();

const opinions = ref([]);
const proposalForm = ref(null);
const form = reactive({});
const listUpReferences = ref([]);
const accordionItems = ref([]);
const isEditing = ref(true);

const groups = [
    {
        type: 'horizontal',
        fields: [
            { key: 'title', label: '제목', type: 'input', essential: true },
            { key: 'requestDate', label: '요청일', type: 'date', inputType: 'date' },
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
            {
                key: 'status',
                label: '진행단계',
                type: 'select',
                options: ['승인요청', '진행중', '보류', '완료'],
                essential: true,
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

const openIndexes = ref([]);
const toggle = (index) => {
    if (openIndexes.value.includes(index)) {
        openIndexes.value = openIndexes.value.filter((i) => i !== index);
    } else {
        openIndexes.value.push(index);
    }
};

// 저장 및 취소
const save = async () => {
    const payload = {
        ...form,
        opinions: opinions.value,
    };

    try {
        console.log('전송 데이터:', payload);
        await getInfluencerDetail(payload);
        await router.push('/sales/proposal');
    } catch (e) {
        console.error('저장 실패:', e);
    }
};

const cancel = () => {
    Object.assign(form, proposalForm.value);
    isEditing.value = false;
};

const fetchInfluencerDetail = async (ids) => {
    const res = await getInfluencerDetail(ids);
    console.log('??', res);
    return res.data.data;
};

// 실제 개발 시에는 파이프 라인 아이디 보내줘야함!
const fetchListupReference = async () => {
    try {
        const res = await getListupReference();
        listUpReferences.value = res.data.data;
    } catch (e) {
        console.log(e);
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
                const res = await fetchInfluencerDetail(ids); // API 요청
                console.log(res);
                form.influencer = res; // form에 상세 정보로 재할당
                return; // 이후 watch가 다시 트리거됨
            } catch (e) {
                console.error('인플루언서 상세 fetch 실패:', e);
                return;
            }
        }

        if (influencers[0] && influencers[0].platform) {
            console.log('!!!!');
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

    form.clientCompany = item.clientCompany;
    form.influencer = item.influencer;
};

onMounted(async () => {
    /* TODO 댓글, 래퍼런스, 상세 정보 불러와야 함!*/
    await fetchListupReference();
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
                    <div class="page-title">제안</div>
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
