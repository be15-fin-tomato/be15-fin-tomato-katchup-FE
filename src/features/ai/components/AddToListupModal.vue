<template>
    <div class="fixed inset-0 bg-black/40 flex items-center justify-center z-[99]">
        <div class="bg-white rounded-xl shadow p-6 w-[90%] max-w-md relative">
            <h2 class="text-lg font-semibold mb-4">리스트업</h2>

            <!-- 캠페인명 입력 -->
            <div class="mb-4">
                <label class="block text-sm font-medium mb-1">캠페인 명</label>
                <div class="flex gap-2">
                    <input
                        :value="selectedCampaign?.name ?? ''"
                        type="text"
                        class="input-form-box flex-1"
                        readonly
                    />
                    <button
                        type="button"
                        class="px-3 py-1 bg-blue-500 text-white rounded"
                        @click="openSearchPopup('selectedCampaign', 'pipeline')"
                    >
                        검색
                    </button>
                </div>
            </div>

            <!-- 제목 입력 -->
            <div class="mb-6">
                <label class="block text-sm font-medium mb-1">제목</label>
                <input v-model="listupTitle" type="text" class="input-form-box w-full" />
            </div>

            <!-- 선택된 인플루언서 -->
            <div class="mb-6">
                <label class="block text-sm font-medium mb-2">선택된 인플루언서</label>
                <div
                    v-if="selectedInfluencers.length"
                    class="flex flex-wrap gap-3 max-h-[100px] overflow-y-auto pr-2"
                >
                    <div
                        v-for="influencer in selectedInfluencers"
                        :key="influencer.influencerId"
                        class="w-10 h-10 relative"
                        @mouseenter="showPopover(influencer, $event)"
                        @mouseleave="hidePopover"
                    >
                        <img
                            :src="influencer.youtube?.thumbnailUrl"
                            alt="프로필"
                            class="w-10 h-10 rounded-full object-cover"
                        />
                    </div>
                </div>
                <div v-else class="font-semibold text-sm text-gray-400 italic">
                    선택된 인플루언서가 없습니다.
                </div>
            </div>

            <!-- 버튼 영역 -->
            <div class="flex justify-end gap-2">
                <button class="btn-delete" @click="$emit('close')">취소</button>
                <button class="btn-create" @click="handleSubmit">
                    <!--                    {{ isEditing ? '저장하기' : '추가하기' }}-->
                    저장하기
                </button>
            </div>
            <teleport to="body">
                <div
                    v-if="popover.visible"
                    :style="popover.style"
                    class="fixed z-[9999] bg-white shadow-md rounded-md px-3 py-2 text-sm text-black whitespace-nowrap"
                >
                    <div class="font-semibold">{{ popover.data?.name }}</div>
                    <div class="text-gray-500">{{ popover.data?.nickname }}</div>
                </div>
            </teleport>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue';
import { createListup, updateListup } from '@/features/campaign/api.js';
import { useRoute, useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';

const emit = defineEmits(['close']);
const selectedCampaign = ref(null);
const listupTitle = ref(null);
const currentFieldKey = ref('');
const router = useRouter();
const toast = useToast();
const route = useRoute();

const popover = ref({
    visible: false,
    data: null,
    style: {
        top: '0px',
        left: '0px',
        transform: 'translateX(-50%)',
        position: 'absolute',
    },
});

const showPopover = (influencer, event) => {
    const rect = event.target.getBoundingClientRect();
    popover.value = {
        visible: true,
        data: influencer,
        style: {
            top: `${rect.top + window.scrollY + 40}px`, // 위로 조금 띄움
            left: `${rect.left + window.scrollX + rect.width / 2}px`,
            transform: 'translateX(-50%)',
            position: 'absolute',
        },
    };
};

const hidePopover = () => {
    popover.value.visible = false;
};

const props = defineProps({
    selectedInfluencers: {
        type: Array,
        required: true,
    },
    isEditing: {
        type: Boolean,
        default: false,
    },
    campaign: {
        type: Object,
        default: () => ({ id: null, name: '', title: '' }),
    },
});
const openSearchPopup = (key, type) => {
    currentFieldKey.value = key;
    const currentValue = selectedCampaign.value;

    const popup = window.open(
        `/search-popup?type=${type}&selected=${encodeURIComponent(currentValue)}`,
        'SearchPopup',
        'width=500,height=600',
    );

    window.handleUserSelect = (selectedItem) => {
        if (key === 'selectedCampaign') {
            selectedCampaign.value = selectedItem;
        }
        popup.close();
    };
};

const handleSubmit = async () => {
    try {
        if (selectedCampaign.value === null) {
            toast.error('캠페인이 선택되지 않았습니다.');
            return;
        }
        if (listupTitle.value === null || listupTitle.value === '') {
            toast.error('제목이 입력되지 않았습니다.');
            return;
        }

        if (!Array.isArray(props.selectedInfluencers) || !props.selectedInfluencers.length > 0) {
            toast.error('인플루언서가 선택되지 않았습니다.');
            return;
        }

        const payload = {
            campaignId: selectedCampaign.value.id,
            name: listupTitle.value,
            influencerId: props.selectedInfluencers.map((v) => v.influencerId),
        };

        if (props.isEditing && props.campaign?.id) {
            payload.pipelineId = route.params.id;
        }

        console.log('제출:', payload);
        if (props.isEditing) {
            await updateListup(payload);
            toast.success('리스트업이 수정되었습니다.');
        } else {
            await createListup(payload);
            toast.success('리스트업이 생성되었습니다.');
            await router.push('/sales/listup');
        }

        // await router.push('/sales/listup');

        emit('close');
    } catch (e) {
        toast.error('리스트 생성에 실패하였습니다.');
    }
};
onMounted(() => {
    if (props.isEditing) {
        selectedCampaign.value = {
            id: props.campaign?.id || null,
            name: props.campaign?.name || '',
        };
        listupTitle.value = props.campaign?.title || '';
    }
});
</script>
