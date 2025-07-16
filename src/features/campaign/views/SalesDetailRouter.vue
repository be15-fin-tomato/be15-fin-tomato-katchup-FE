<script setup>
import { useRoute } from 'vue-router';
import { computed, defineAsyncComponent } from 'vue';

const ProposalDetail = defineAsyncComponent(() => import('./ProposalDetail.vue'));
const QuotationDetail = defineAsyncComponent(() => import('./QuotationDetail.vue'));
const ContractDetail = defineAsyncComponent(() => import('./ContractDetail.vue'));

const route = useRoute();
const step = computed(() => route.params.step);

const componentMap = {
    proposal: ProposalDetail,
    quotation: QuotationDetail,
    contract: ContractDetail,
};

const SelectedComponent = computed(() => componentMap[step.value]);
</script>

<template>
    <Suspense>
        <template #default>
            <component
                v-if="SelectedComponent"
                :is="SelectedComponent"
                :pipeline-id="route.params.pipelineId"
            />
            <div v-else class="text-center text-gray-400 mt-10">
                유효하지 않은 파이프라인 단계입니다.
            </div>
        </template>

        <template #fallback>
            <div class="text-center text-gray-400 mt-10">
                불러오는 중입니다...
            </div>
        </template>
    </Suspense>
</template>
