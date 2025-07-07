<template>
    <div class="cardLists" @click="$emit('click')">
        <!-- 상단: 제목 / 상태 -->
        <div class="flex justify-between items-center mb-2">
            <div class="text-base font-semibold truncate max-w-[70%]">
                {{ managementOption.name }}
            </div>

            <div class="flex items-center gap-2">
                <div
                    v-if="managementOption.statusName"
                    :class="[
                        'px-2 py-1 rounded text-white text-sm',
                        statusColor(managementOption.statusName),
                    ]"
                >
                    {{ managementOption.statusName }}
                </div>

                <div class="relative">
                    <button
                        @click.stop="$emit('menuToggle', managementOption.pipelineId)"
                        class="p-1 hover:bg-gray-100 rounded"
                    >
                        <Icon icon="mdi:dots-vertical" width="20" height="20" />
                    </button>

                    <div
                        v-if="openMenuId === managementOption.pipelineId"
                        class="absolute right-0 mt-2 bg-white border border-gray-medium rounded shadow-lg w-24 text-sm z-10"
                    >
                        <button
                            @click.stop="$emit('delete', managementOption.pipelineId)"
                            class="block w-full text-left px-4 py-2 hover:bg-gray-medium"
                        >
                            삭제
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- 캠페인 명 -->
        <div class="text-gray-dark text-sm mb-1 truncate max-w-full">
            {{ managementOption.campaignName }}
        </div>

        <!-- 상품명 (Quotation, Contract, Revenue 전용) -->
        <div
            v-if="['quotation', 'contract', 'revenue'].includes(pageType)"
            class="text-gray-dark text-sm truncate max-w-full"
        >
            상품명 : {{ managementOption.productName ?? '-' }}
        </div>

        <!-- 상세 정보 -->
        <div class="flex justify-between text-sm text-gray-dark mt-8 mb-3">
            <div class="flex items-center gap-1 max-w-[40%]">
                <Icon icon="tabler:building" width="24" height="24" class="mr-2" />
                <span class="truncate">{{ managementOption.clientCompanyName }}</span>
            </div>

            <div class="flex gap-4 items-center truncate max-w-[50%]">
                <div class="flex items-center gap-1 truncate">
                    <Icon icon="mdi:person-tie" width="24" height="24" class="mr-2" />
                    <span>{{ renderListupCount(managementOption.userName) }}</span>
                </div>
                <div class="flex items-center gap-1 truncate">
                    <Icon icon="mdi:account-check" width="24" height="24" class="mr-2" />
                    <span>{{ managementOption.clientManagerName }}</span>
                </div>
            </div>
        </div>

        <!-- 하단 상세 -->
        <div class="flex flex-row gap-2 text-sm text-gray-dark border-t pt-2 w-full max-w-full">
            <template v-if="pageType === 'proposal'">
                <div class="truncate">요청일 : {{ formatDate(managementOption.requestAt) }}</div>
                <div class="truncate">발표일 : {{ formatDate(managementOption.presentAt) }}</div>
            </template>

            <template v-else-if="['quotation', 'contract'].includes(pageType)">
                <div class="truncate">
                    예상매출 : {{ formatMoney(managementOption.expectedRevenue) }}
                </div>
            </template>

            <template v-else-if="['revenue'].includes(pageType)">
                <div class="truncate">
                    총 광고료 : {{ formatMoney(managementOption.totalAdPrice) }}
                </div>
            </template>

            <template v-else-if="pageType === 'listup' || pageType === 'campaignResult'">
                <!-- 상품명 (우측 시작) -->
                <div class="flex w-full max-w-[60%] justify-start">
                    <div class="truncate text-right">{{ managementOption.productName ?? '-' }}</div>
                </div>

                <!-- 인플루언서 (우측 시작) -->
                <div class="flex w-full justify-end max-w-[40%]">
                    <div class="truncate text-right">
                        {{ renderListupCount(managementOption.influencers) }}
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>

<script setup>
import { Icon } from '@iconify/vue';

const { managementOption, openMenuId, pageType } = defineProps({
    managementOption: { type: Object, required: true },
    openMenuId: { type: Number, default: null },
    pageType: { type: String, default: 'listUp' },
});

// 날짜 포맷
const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${(date.getMonth() + 1).toString().padStart(2, '0')}.${date.getDate().toString().padStart(2, '0')}`;
};

// 금액 포맷
const formatMoney = (price) => {
    if (price == null) return '-';
    return `￦ ${Number(price).toLocaleString()}`;
};

// 리스트업 인플루언서 수 표기
const renderListupCount = (list = []) => {
    if (!list || list.length === 0) return '0명';
    if (list.length === 1) return list[0].name ?? list[0];
    return `${list[0].name ?? list[0]} 외 ${list.length - 1}명`;
};

// 상태 색상
const statusColor = (status) => {
    switch (status) {
        case '승인완료':
            return 'bg-complete';
        case '승인요청':
            return 'bg-request';
        case '보류/대기':
            return 'bg-onhold';
        case '승인거절':
            return 'bg-reject';
        default:
            return 'bg-gray-300';
    }
};
</script>
