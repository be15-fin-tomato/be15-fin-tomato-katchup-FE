<script setup>

import CommonFiltering from '@/components/layout/CommonFiltering.vue';
import PagingBar from '@/components/common/PagingBar.vue';
import EmailCard from '@/features/user/components/EmailCard.vue'
import { computed, ref } from 'vue';

const currentPage = ref(1)
const pageSize = 6

const emailList = ref([
    {
        client_name: '고객사 직원명_1',
        clientCompany_name: '고객 회사명',
        client_email: '고객 이메일',
        contacts: '담당자',
        artist_name: '인플루언서명',
        campaign_name: '캠페인 명'
    },
    {
        client_name: '고객사 직원명_2',
        clientCompany_name: '고객 회사명',
        client_email: '고객 이메일',
        contacts: '담당자',
        artist_name: '인플루언서명',
        campaign_name: '캠페인 명'
    },
    {
        client_name: '고객사 직원명_3',
        clientCompany_name: '고객 회사명',
        client_email: '고객 이메일',
        contacts: '담당자',
        artist_name: '인플루언서명',
        campaign_name: '캠페인 명'
    },
    {
        client_name: '고객사 직원명_4',
        clientCompany_name: '고객 회사명',
        client_email: '고객 이메일',
        contacts: '담당자',
        artist_name: '인플루언서명',
        campaign_name: '캠페인 명'
    },
    {
        client_name: '고객사 직원명_5',
        clientCompany_name: '고객 회사명',
        client_email: '고객 이메일',
        contacts: '담당자',
        artist_name: '인플루언서명',
        campaign_name: '캠페인 명'
    },
    {
        client_name: '고객사 직원명_6',
        clientCompany_name: '고객 회사명',
        client_email: '고객 이메일',
        contacts: '담당자',
        artist_name: '인플루언서명',
        campaign_name: '캠페인 명'
    },
])

const totalCount = emailList.value.length
const totalPages = computed(() => Math.ceil(totalCount / pageSize))

const paginatedEmail = computed(() => {
    const start = (currentPage.value - 1) * pageSize
    return emailList.value.slice(start, start + pageSize)
})
</script>

<template>
  <div class="w-full min-h-screen bg-background flex">
    <CommonFiltering :showFilterSort="false" />
    <div class="flex flex-col flex-1 container bg-white">
      <!-- 제목 + 등록 버튼 -->
      <div class="page-header">
        <div class="page-title">
          만족도 조사
        </div>
      </div>
      <div class="blue-line"></div>

      <div class="grid grid-cols-2 gap-x-9 gap-y-9 px-1">
          <EmailCard
              v-for="(email, client_name) in paginatedEmail"
              :key="client_name"
              :emailList="email"
          />
      </div>

      <!-- 페이지네이션 -->
      <div class="flex justify-center mt-8">
        <PagingBar
          :totalPages="totalPages"
          :currentPage="currentPage"
          @update:currentPage="(val) => (currentPage = val)"
        />
      </div>
    </div>
  </div>

</template>

<style scoped>

</style>
