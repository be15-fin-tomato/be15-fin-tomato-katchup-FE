<script setup>
import { ref, computed, onMounted } from 'vue';
import CommonFiltering from '@/components/layout/CommonFiltering.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import EmailCard from '@/features/user/components/EmailCard.vue';
import { fetchSatisfactionList } from '@/features/user/api';

const currentPage = ref(1);
const pageSize = 6;

const totalPages = ref(0);
const emailList = ref([]);

const loadEmailList = async () => {
  try {
    const { data } = await fetchSatisfactionList({
      page: currentPage.value,
      size: pageSize,
    });
    emailList.value = data.data.campaignSatisfaction;
    totalPages.value = data.data.pagination.totalPage;
  } catch (err) {
    console.error('📛 만족도 조회 실패', err);
  }
};

const paginatedEmail = computed(() => emailList.value);

onMounted(() => {
  loadEmailList();
});
</script>

<template>
  <div class="w-full min-h-screen bg-background flex">
    <CommonFiltering :showFilterSort="false" ref="filterRef" />
    <div class="flex flex-col flex-1 container bg-white">
      <div class="page-header">
        <div class="page-title">만족도 조사</div>
      </div>
      <div class="blue-line"></div>

      <div class="grid grid-cols-2 gap-x-9 gap-y-9 px-1">
        <EmailCard
          v-for="(email, index) in paginatedEmail"
          :key="index"
          :emailList="{
            satisfaction_id: email.satisfactionId,
            client_name: email.clientManagerName,
            clientCompany_name: email.clientCompanyName,
            client_email: email.email,
            contacts: email.userName,
            artist_name: email.influencerName,
            campaign_name: email.campaignName,
            email_status: email.emailStatus
          }"
          @refreshList="loadEmailList"
        />

      </div>

      <div class="flex justify-center mt-8">
        <PagingBar
          :totalPages="totalPages"
          :currentPage="currentPage"
          @update:currentPage="(val) => {
            currentPage.value = val;
            loadEmailList();
          }"
        />
      </div>
    </div>
  </div>
</template>
