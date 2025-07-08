<script setup>
import { onMounted, ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toastification';
import {
  fetchMyClientCompany,
  fetchMyContract,
  fetchMyListUp,
  fetchMyProposal,
  fetchMyQuotation, fetchMySchedule, fetchSalesActivity
} from '@/features/main/api.js';

const router = useRouter();
const toast = useToast()

const clientCompanyList = ref([]);
const eventList = ref([]);
const proposalList = ref([]);
const listUpList = ref([]);
const contractList = ref([]);
const quotationList = ref([]);
const isLoading = ref(true);
const isError = ref(false);

const statusClassMap = {
  '승인완료': 'bg-complete text-white',
  '승인요청': 'bg-request text-white',
  '보류/대기': 'bg-onhold text-white',
  '승인거절': 'bg-reject text-white',
};

const salesActivity = ref({
  client: 0,
  influencer: 0,
  contract: 0,
  campaign: 0
});


const sortedEventList = computed(() =>
    [...eventList.value].sort((a, b) => {
        return a.startTime.localeCompare(b.startTime);
    })
);

const fetchSalesActivityData = async () => {
  try {
    const res = await fetchSalesActivity();
    salesActivity.value = res.data.data;
  } catch (e) {
    console.error(e);
  }
};

const fetchClientCompany = async () => {
  try {
    const res = await fetchMyClientCompany();
    clientCompanyList.value = res.data.data;
  } catch (e) {
    toast.error('고객사 정보를 불러올 수 없습니다.')
  }
};

const fetchListUpList = async () => {
  try {
    const res = await fetchMyListUp();
    listUpList.value = res.data.data;
  } catch (e) {
    toast.error('리스트업 정보를 불러올 수 없습니다.')  }
};

const fetchProposalList = async () => {
  try {
    const res = await fetchMyProposal();
    proposalList.value = res.data.data;
  } catch (e) {
    toast.error('제안 정보를 불러올 수 없습니다.')  }
};

const fetchQuotationList = async () => {
  try {
    const res = await fetchMyQuotation();
    quotationList.value = res.data.data;
  } catch (e) {
    toast.error('견적 정보를 불러올 수 없습니다.')  }
};

const fetchContractList = async () => {
  try {
    const res = await fetchMyContract();
    contractList.value = res.data.data;
  } catch (e) {
    toast.error('계약 정보를 불러올 수 없습니다.')  }
};

const fetchEvent = async () => {
  try {
    const res = await fetchMySchedule();
    eventList.value = res.data.data;
  } catch (e) {
    toast.error('일정 정보를 불러올 수 없습니다.')  }
};

const fetchAllData = async () => {
  isLoading.value = true
  isError.value = false
  try {
    await Promise.all([
      fetchSalesActivityData(),
      fetchClientCompany(),
      fetchListUpList(),
      fetchProposalList(),
      fetchContractList(),
      fetchQuotationList(),
      fetchEvent()
    ])
  } catch (err) {
    isError.value = true
  } finally {
    isLoading.value = false
  }
};

onMounted(fetchAllData)

const limitedCompanyList = computed(() => clientCompanyList.value.slice(0, 10));

const formatPrice = (value) => {
  if (typeof value === 'number') return value.toLocaleString('ko-KR');
  const num = parseFloat(value);
  return isNaN(num) ? value : num.toLocaleString('ko-KR');
};

const goToDetail = (type, id) => {
  router.push(`/${type}/${id}`);
};

const goToList = (type) => {
  router.push(`/${type}`);
}

const goToCalendar = () => {
  router.push(`/calendar`);
};
</script>

<template>
    <div class="flex flex-col w-full min-h-full">
        <div class="flex gap-5">
            <!-- 신규 영업 활동 -->
            <div class="dashboard-section w-2/3 px-10">
                <h2 class="text-xl font-bold">신규 영업 활동</h2>
                <div class="h-[1px] bg-gray-light mt-1 mb-5 w-full"></div>
                <div class="flex space-x-7 my-9 h-[70%]">
                    <div
                        class="flex-1 text-center border border-gray-light rounded-2xl py-3"
                        @click="goToList('management/client')"
                    >
                        <div class="text-lg font-bold bg-btn-sky rounded-md py-1.5 mx-4 text-white">
                          고객사
                        </div>
                        <div class="text-5xl font-semibold pt-10">{{ salesActivity.clientCompanyCount }}</div>
                    </div>
                    <div
                        class="flex-1 text-center border border-gray-light rounded-2xl py-3"
                        @click="goToList('influencer/list')"
                    >
                        <div class="text-lg font-bold bg-btn-sky rounded-md py-1.5 mx-4 text-white">
                          인플루언서
                        </div>
                        <div class="text-5xl font-semibold pt-10">{{ salesActivity.influencerCount }}</div>
                    </div>
                    <div
                        class="flex-1 text-center border border-gray-light rounded-2xl py-3"
                        @click="goToList('sales/contract')"
                    >
                        <div class="text-lg font-bold bg-btn-sky rounded-md py-1.5 mx-4 text-white">
                          계약
                        </div>
                        <div class="text-5xl font-semibold pt-10">{{ salesActivity.contractCount }}</div>
                    </div>
                    <div
                        class="flex-1 text-center border border-gray-light rounded-2xl py-3"
                        @click="goToList('campaign')"
                    >
                        <div class="text-lg font-bold bg-btn-sky rounded-md py-1.5 mx-4 text-white">
                          파이프라인
                        </div>
                        <div class="text-5xl font-semibold pt-10">{{ salesActivity.pipelineCount }}</div>
                    </div>
                </div>
            </div>

            <!-- 일정 정보 -->
            <div class="dashboard-section w-1/3">
                <h2 class="text-xl font-bold">일정</h2>
                <div class="h-[1px] bg-gray-light mt-1 mb-3 w-full max-h-[200px] overflow-y-auto"></div>
                <ul>
                    <li
                        v-for="(event, index) in sortedEventList"
                        :key="index"
                        class="flex items-center gap-2 py-0.5 border border-gray-medium rounded p-3 mb-2 cursor-pointer hover:bg-btn-gray/20 transition-colors"
                        @click="goToCalendar"
                    >
                        <div class="w-2 h-5 rounded-sm" :style="{ backgroundColor: event.hexCode || event.hexCode }"></div>
                        <span class="text-gray-medium">{{ event.startTime.slice(0, 5) }} ~</span>
                        <span class="text-gray-medium">{{ event.endTime.slice(0, 5) }}</span>
                        <span>{{ event.content }}</span>
                    </li>
                </ul>
            </div>
        </div>

        <div class="flex gap-5">
            <!-- 리스트업 -->
            <div class="dashboard-section w-2/3">
            <h2 class="text-xl font-bold mb-2 px-3">리스트업</h2>
            <div class="h-[1px] bg-gray-light mt-1 w-full"></div>
                <ul class="flex flex-col w-full p-0 m-0 list-none max-h-[200px] overflow-y-auto">
                    <template v-for="(listUp, index) in listUpList" :key="index">
                        <li
                            v-if="index > 0"
                            class="h-[1px] bg-gray-light"
                        ></li>
                        <li
                            class="grid w-full grid-cols-4 items-center gap-2 px-3 py-4 cursor-pointer hover:bg-btn-gray/20 transition-colors"
                            @click="goToDetail('influencer/recommendation', listUp.id)"
                        >
                            <span class="text-left font-bold truncate col-span-1">{{ listUp.companyName }}</span>
                            <span class="text-left col-span-1">{{ listUp.campaignName }}</span>
                            <span class="text-left col-span-1">{{ listUp.productName }}</span>
                            <span class="text-left col-span-1">{{ listUp.listupTitle }}</span>
                        </li>
                    </template>
                </ul>

            </div>
                <!-- 고객사 -->
                <div class="dashboard-section w-1/3">
                    <h2 class="text-xl font-bold px-3">고객사</h2>
                    <div class="h-[1px] bg-gray-light mt-1 w-full"></div>
                    <ul class="max-h-[200px] overflow-y-auto">
                        <template v-for="(company, index) in limitedCompanyList" :key="index">
                            <li v-if="index > 0" class="h-[1px] bg-gray-light mx-3"></li>

                            <li
                                class="grid w-full grid-cols-5 items-center gap-2 px-3 py-4 cursor-pointer hover:bg-btn-gray/20 transition-colors"
                                @click="goToDetail('management/client', company.id)"
                            >
                                <span class="text-left col-span-2">{{ company.clientCompanyName }}</span>
                                <span class="text-left col-span-2">{{ company.telephone }}</span>
                                <span class="col-span-1 flex justify-end">
                                <span
                                    class="text-xs font-semibold px-2 py-1 rounded-md w-fit"
                                    :class="{
                                    'bg-blue-400 text-white': company.statusName === '잠재',
                                    'bg-green-400 text-white': company.statusName === '신규',
                                    'bg-yellow-400 text-white': company.statusName === '기존',
                                    'bg-gray-300 text-black': !['잠재', '신규', '기존'].includes(company.statusName)
                                  }"
                                >
                                  {{ company.statusName }}
                                </span>
                              </span>
                            </li>
                        </template>
                    </ul>


                </div>
          </div>

        <!-- 제안 -->
        <div class="dashboard-section w-full max-h-[320px] overflow-y-auto">
            <h2 class="text-xl font-bold mb-2 px-3">제안</h2>
            <div class="h-[1px] bg-gray-light mt-1 w-full"></div>
            <ul class="flex flex-col w-full p-0 m-0 list-none max-h-[200px] overflow-y-auto">
                <li
                    v-for="(proposal, index) in proposalList"
                    :key="index"
                    class="grid w-full grid-cols-18 items-center gap-2 px-3 py-4 cursor-pointer hover:bg-btn-gray/20 transition-colors"
                    @click="goToDetail('sales/proposal', proposal.id)"
                >
                    <div
                        v-if="index > 0"
                        class="col-span-full h-[1px] bg-gray-light mb-2"
                        style="grid-column: 1 / -1"
                    ></div>
                    <span class="font-bold truncate col-span-2 text-left">{{ proposal.companyName }}</span>
                    <span class="text-left col-span-3">{{ proposal.campaignName }}</span>
                    <span class="text-left col-span-3">{{ proposal.proposalTitle }}</span>
                    <span class="text-left col-span-3">{{ proposal.productName }}</span>
                    <span class="text-left col-span-2">{{ proposal.clientManagerName }}</span>
                    <span class="text-left col-span-2">{{ proposal.clientManagerPosition }}</span>
                    <span
                        class="text-center text-xs font-semibold px-2 py-1 rounded-md w-fit"
                        :class="statusClassMap[proposal.statusName] || 'bg-gray-medium'"
                    >
                        {{ proposal.statusName }}
                    </span>
                    <span class="text-right text-gray-medium text-sm col-span-2">{{ proposal.presentedAt.slice(0,10) }}</span>
                </li>
            </ul>
        </div>

        <div class="flex gap-5">
            <!-- 견적 -->
            <div class="dashboard-section w-1/2">
                <h2 class="text-xl font-bold mb-2 px-3">견적</h2>
                <div class="h-[1px] bg-gray-light mt-1 w-full"></div>
                <ul class="flex flex-col w-full p-0 m-0 list-none max-h-[200px] overflow-y-auto">
                    <template v-for="(quotation, index) in quotationList" :key="index">
                        <li v-if="index > 0" class="h-[1px] bg-gray-light mx-3"></li>
                        <li
                            class="grid w-full grid-cols-12 items-center gap-2 px-3 py-4 cursor-pointer hover:bg-btn-gray/20 transition-colors"
                            @click="goToDetail('sales/quotation', quotation.id)"
                        >
                            <span class="text-left font-bold truncate col-span-2">{{ quotation.companyName }}</span>
                            <span class="text-left col-span-6">{{ quotation.quotationTitle }}</span>
                            <span class="text-left col-span-2">{{ formatPrice(quotation.adPrice) }}</span>
                            <span class="text-left col-span-2 pl-3">{{ formatPrice(quotation.expectedProfit) }}</span>
                        </li>
                    </template>
                </ul>

            </div>
            <!-- 계약 -->
            <div class="dashboard-section w-1/2">
                <h2 class="text-xl font-bold mb-2 px-3">계약</h2>
                <div class="h-[1px] bg-gray-light mt-1 w-full"></div>
                <ul class="flex flex-col w-full p-0 m-0 list-none max-h-[200px] overflow-y-auto">
                    <template v-for="(contract, index) in contractList" :key="index">
                        <li v-if="index > 0" class="h-[1px] bg-gray-light mx-3"></li>
                        <li
                            class="grid w-full grid-cols-12 items-center gap-2 px-3 py-4 cursor-pointer hover:bg-btn-gray/20 transition-colors"
                            @click="goToDetail('sales/quotation', contract.id)"
                        >
                            <span class="text-left font-bold truncate col-span-2">{{ contract.companyName }}</span>
                            <span class="text-left col-span-3">{{ contract.campaignName }}</span>
                            <span class="text-left col-span-3">{{ contract.contractTitle }}</span>
                            <span
                                class="text-center text-xs col-span-2 font-semibold px-2 py-1 rounded-md w-fit"
                                :class="statusClassMap[contract.statusName] || 'bg-gray-medium'"
                            >
                                {{ contract.statusName }}
                            </span>
                            <span class="text-right text-gray-medium text-sm col-span-2">{{ contract.presentedAt.slice(0,10) }}</span>
                        </li>
                    </template>
                </ul>
              </div>
        </div>
  </div>
</template>

