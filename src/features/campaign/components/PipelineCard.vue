<template>
    <div>
        <div
            v-for="campaign in campaigns"
            :key="campaign.campaignId"
            @click="gotoDetail(campaign.campaignId)"
            class="campaign-card border-1 border-solid border-gray-medium mb-[16px] px-4 py-3 hover:bg-dropdown/10 active:bg-dropdown/15"
        >
            <div class="campaign-header mb-2">
                <CampaignBadge :label="campaign.campaignStatusName" status="default" />
                <span class="campaign-title text-lg font-medium">{{ campaign.campaignName }}</span>
            </div>
            <div class="pipeline flex items-center w-full mb-1">
                <PipelineDiagram :diagramInfo="campaign.pipelineSteps" />
                <div class="flex items-center gap-2 min-h-[60px]">
                    <span class="success-rate font-medium ml-8">성공 확률</span>
                    <div
                        class="success-rate-box bg-gray-200 relative w-[112px] h-[56px] rounded-lg overflow-hidden flex items-center justify-center"
                    >
                        <div
                            class="absolute top-0 left-0 h-full bg-pipeline-quotation transition-all duration-500 z-0"
                            :style="{ width: `${campaign.successProbability}%` }"
                        ></div>
                        <div class="relative z-10 text-white text-sm font-bold">
                            {{ campaign.successProbability }}%
                        </div>
                    </div>
                </div>
            </div>
            <div class="campaign-info text-md text-gray-dark flex flex-wrap">
                <span class="client-company mr-2 flex items-center"
                    ><Icon icon="mdi:account-check" width="24" height="24" class="mr-2" />{{
                        campaign.clientCompanyName
                    }}
                    {{ campaign.clientManagerName }} {{ campaign.clientManagerPosition }}</span
                >
                <span class="bar mx-2">|</span>
                <span class="client-name mx-2 flex items-center">
                    <Icon icon="la:coins" width="24" height="24" class="mr-2" />
                    {{
                        campaign.expectedRevenue !== null
                            ? formatPrice(campaign.expectedRevenue)
                            : '정보 없음'
                    }}
                </span>
                <span class="bar mx-2">|</span>
                <span class="campaign-term mx-2 flex items-center">
                    <Icon icon="mdi:calendar-blank" width="24" height="24" class="mr-2" />{{
                        campaign.startedAt
                    }}
                    ~ {{ campaign.endedAt }}</span
                >
                <span class="bar mx-2">|</span>
                <span class="username ml-2 flex items-center">
                    <Icon icon="mdi:person-box" width="24" height="24" class="mr-2" />{{
                        campaign.pipelineUserName
                    }}
                    {{ campaign.pipelineUserPosition }}</span
                >
                <div class="produce-name w-full flex items-center">
                    <Icon icon="ant-design:product-filled" width="24" height="24" class="mr-2" />{{
                        campaign.productName
                    }}
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import CampaignBadge from '@/components/common/CampaignBadge.vue';
import { Icon } from '@iconify/vue';
import { useRouter } from 'vue-router';
import PipelineDiagram from '@/features/campaign/components/PipelineDiagram.vue';
const { campaigns } = defineProps({
    campaigns: {
        type: Array,
        required: true,
    },
});

const router = useRouter();

// const getLastPipelineIndex = (pipeLine) => {
//     const keys = Object.keys(pipeLine || {});
//     const lastKey = pipelineSteps.findLast((step) => keys.includes(step.key));
//     return pipelineSteps.findIndex((step) => step.key === lastKey?.key);
// };
//
// const getSuccessRate = (pipeLine) => {
//     const filledCount = getLastPipelineIndex(pipeLine) + 1;
//     const totalSteps = pipelineSteps.length;
//     return Math.round((filledCount / totalSteps) * 100);
// };

const pipelineSteps = [
    { key: 'chance', label: '기회인지', colorVar: 'bg-pipeline-chance' },
    { key: 'listUp', label: '리스트업', colorVar: 'bg-pipeline-list-up' },
    { key: 'proposal', label: '제안', colorVar: 'bg-pipeline-proposal' },
    { key: 'quotation', label: '견적', colorVar: 'bg-pipeline-quotation' },
    { key: 'negotiation', label: '협상', colorVar: 'bg-pipeline-negotiation' },
    { key: 'contract', label: '계약', colorVar: 'bg-pipeline-contract' },
    { key: 'aftercare', label: '사후관리', colorVar: 'bg-pipeline-aftercare' },
];

const getLastPipelineIndex = (pipelineData) => {
    if (!pipelineData || pipelineData.length === 0) {
        return -1;
    }

    let lastActiveIndex = -1;
    // pipelineSteps 정의 순서에 따라 진행 단계를 확인합니다.
    for (let i = 0; i < pipelineSteps.length; i++) {
        const currentStepLabel = pipelineSteps[i].label;
        const matchingBackendStep = pipelineData.find(
            (s) => s.stepType === currentStepLabel && s.startedAt !== null,
        );
        if (matchingBackendStep) {
            lastActiveIndex = i; // 해당 단계가 완료되었다면 인덱스 업데이트
        }
    }
    return lastActiveIndex;
};

// 성공률을 계산합니다.
const getSuccessRate = (pipelineData) => {
    const filledCount = getLastPipelineIndex(pipelineData) + 1; // 완료된 단계 수
    const totalSteps = pipelineSteps.length; // 전체 단계 수

    if (totalSteps === 0) return 0; // 0으로 나누는 것 방지

    return Math.round((filledCount / totalSteps) * 100);
};

const gotoDetail = async (campaignId) => {
    await router.push(`/campaign/${campaignId}`);
};

const formatPrice = (price) => price.toLocaleString();
</script>

<style scoped></style>
