<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import {
  getUser,
  getClientCompany,
  getClientManager,
  getInfluencer,
  getPipeline,
  getUserNameAndEmail,
} from '@/features/campaign/api.js';

const route = useRoute();
const type = route.query.type ?? 'user';
const title = route.query.title ?? '검색';
const labelKey = route.query.labelKey ?? 'name';
const valueKey = route.query.valueKey ?? 'id';
const selectedParam = route.query.selected ?? '';
const placeholder = route.query.placeholder ?? '검색어를 입력하세요';

const searchKeyword = ref('');
const selectedItems = ref([]);
const selectedItemId = ref(null); // ✅ 단일 선택용 ID
const allItems = ref([]);

const fetchData = async () => {
  let res = null;
  try {
    if (['user', 'single-user'].includes(type)) {
      res = await getUser(searchKeyword.value.trim());
      allItems.value = res.data.data.userList;
    } else if (type === 'company') {
      res = await getClientCompany(searchKeyword.value.trim());
      allItems.value = res.data.data.clientCompanyList;
    } else if (type === 'manager') {
      const clientCompanyId = route.query.clientCompanyId ?? null;
      res = await getClientManager(clientCompanyId, searchKeyword.value.trim());
      allItems.value = res.data.data.clientManagerList;
    } else if (type === 'influencer') {
      res = await getInfluencer(searchKeyword.value.trim());
      allItems.value = res.data.data.influencerList;
    } else if (type === 'pipeline') {
      res = await getPipeline(searchKeyword.value.trim());
      allItems.value = res.data.data.campaignList;
    } else if (type === 'email') {
      res = await getUserNameAndEmail();
      allItems.value = res.data.data.emailList;
    }
  } catch (e) {
    console.error('검색 실패:', e);
  }
};

onMounted(async () => {
  await fetchData();

  if (selectedParam) {
    if (type === 'single-user') {
      selectedItemId.value = selectedParam.trim();
    } else {
      selectedItems.value = selectedParam.split(',').map((s) => s.trim());
    }
  }
});

const isSelected = (item) => {
  return type === 'single-user'
    ? selectedItemId.value === item.id
    : selectedItems.value.includes(item.id);
};

const toggleSelect = (item) => {
  const id = item.id;

  if (type === 'single-user') {
    selectedItemId.value = id;
  } else if (type === 'user' || type === 'influencer') {
    if (selectedItems.value.includes(id)) {
      selectedItems.value = selectedItems.value.filter((i) => i !== id);
    } else {
      selectedItems.value.push(id);
    }
  } else {
    selectedItems.value = [id];
    submit();
  }
};

const submit = () => {
  if (type === 'single-user') {
    const selectedObj = allItems.value.find((item) => item.id === selectedItemId.value);
    window.opener?.handleUserSelect(selectedObj?.original || selectedObj);
  } else if (type === 'user' || type === 'influencer') {
    const result = allItems.value
      .filter((item) => selectedItems.value.includes(item.id))
      .map((item) => item.original || item);
    window.opener?.handleUserSelect(result);
  } else {
    const selectedObj = allItems.value.find((item) => item.id === selectedItems.value[0]);
    window.opener?.handleUserSelect(selectedObj?.original || selectedObj);
  }

  window.close();
};

const closePopup = () => window.close();
</script>

<template>
  <div class="p-6 w-[500px] font-sans bg-white">
    <h2 class="font-bold text-lg mb-6">{{ title }}</h2>

    <div class="mb-6 flex gap-2">
      <input
        v-model="searchKeyword"
        type="text"
        :placeholder="placeholder"
        class="border border-gray-300 rounded p-3 text-base flex-1"
        @keyup.enter="fetchData"
      />
      <button @click="fetchData" type="button" class="btn-open-popup w-[70px]">검색</button>
    </div>

    <div class="pt-2">
      <div v-if="allItems.length" class="flex flex-col gap-2 max-h-[300px] overflow-y-auto">
        <div
          v-for="item in allItems"
          :key="item[valueKey]"
          class="flex justify-between items-center border border-gray-300 rounded p-3 hover:bg-blue-100 cursor-pointer"
          :class="{ 'bg-blue-200': isSelected(item) }"
          @click="toggleSelect(item)"
        >
          <span>
            <template v-if="type === 'email' || type === 'manager'">
              {{ item.name }}<span class="text-gray-400"> - {{ item.email }}</span>
            </template>
            <template v-else>
              {{ item[labelKey] }}
            </template>
          </span>
          <span v-if="isSelected(item)" class="text-blue-500 font-bold">선택됨</span>
        </div>
      </div>
      <div v-else class="text-gray-400 text-sm py-8 text-center">검색 결과가 없습니다.</div>
    </div>

    <div class="mt-8 flex gap-4 justify-end">
      <button class="px-4 py-2 bg-blue-500 text-white rounded" @click="submit">
        선택 완료
      </button>
      <button class="px-4 py-2 bg-gray-300 rounded" @click="closePopup">취소</button>
    </div>
  </div>
</template>
