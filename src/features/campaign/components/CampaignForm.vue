<script setup>
import { reactive, ref, watch, defineExpose } from 'vue';
import { useToast } from 'vue-toastification';

const props = defineProps({
  modelValue: Object,
  isEditing: Boolean,
});

const toast = useToast();

watch(() => props.modelValue, (newValue) => {
  Object.assign(form, newValue);
}, { deep: true });


const currentFieldKey = ref(null);
const form = reactive({ ...props.modelValue });
const expectedProfitAmount = ref(0);

// 유효성 검사 후, 성공하면 form 데이터를 반환하고 실패하면 null을 반환합니다.
const submit = () => {
  if (!validateRequiredFields()) {
    return null; // 유효성 검사 실패
  }
  return form; // 유효성 검사 성공 시, 최신 form 데이터 반환
};

const validateRequiredFields = () => {
  const missingFields = [];

  for (const [key, label] of requiredFieldMap.entries()) {
    const value = form[key];

    if (
      value === null ||
      value === undefined ||
      (typeof value === 'string' && value.trim() === '') ||
      (typeof value === 'number' && isNaN(value))
    ) {
      missingFields.push(label);
    } else if (Array.isArray(value) && value.length === 0) {
      missingFields.push(label);
    } else if (
      typeof value === 'object' && !Array.isArray(value) && !('id' in value) &&
      !('name' in value)
    ) {
      missingFields.push(label);
    }
  }

  if (missingFields.length === 1) {
    toast.error(`${missingFields[0]}은(는) 필수 입력값입니다.`);
    return false;
  } else if (missingFields.length > 1) {
    toast.error(`필수 입력값을 입력하세요.`);
    return false;
  }

  return true;
};

watch(
  () => [form.expectedRevenue, form.expectedProfitMargin],
  ([revenue, margin]) => {
    const rev = Number(revenue || 0);
    const mar = Number(margin || 0);
    expectedProfitAmount.value = Math.round((rev * mar) / 100);
  },
  { immediate: true },
);

const formatNumber = (value) => {
  if (value === null || value === undefined || isNaN(value)) return '';
  return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseNumberInput = (e, key) => {
  const raw = e.target.value.replace(/[^0-9]/g, '');
  form[key] = raw ? parseInt(raw, 10) : 0;
};

const openSearchPopup = (key, type) => {
  currentFieldKey.value = key;
  const currentValue = form[key];
  const selected = Array.isArray(currentValue)
    ? currentValue.map((u) => u.id).join(',')
    : (currentValue?.id ?? '');

  const clientCompanyId = form.clientCompany?.id ?? '';

  const queryParams = new URLSearchParams({
    type,
    selected,
    ...((type === 'manager' || type === 'pipeline') && clientCompanyId
      ? { clientCompanyId }
      : {}),
  });

  const popup = window.open(
    `/search-popup?${queryParams.toString()}`,
    'SearchPopup',
    'width=500,height=600',
  );

  window.handleUserSelect = (selectedItems) => {
    if (['clientCompany', 'clientManager'].includes(currentFieldKey.value)) {
      form[currentFieldKey.value] = selectedItems;
    } else {
      form[currentFieldKey.value] = Array.isArray(selectedItems)
        ? selectedItems
        : [selectedItems];
    }
    popup.close();
  };
};

function formatToDate(value) {
  if (!value) return '';
  return value.replace(/\./g, '-');
}

const dropdownStates = reactive({
  category: false,
});

const categories = [
  { id: 1, name: '엔터테인먼트' },
  { id: 2, name: '일상' },
  { id: 3, name: '푸드' },
  { id: 4, name: '게임' },
  { id: 5, name: '뷰티/패션' },
  { id: 6, name: '여행' },
  { id: 7, name: '교육' },
  { id: 8, name: '기술' },
  { id: 9, name: '건강/피트니스' },
  { id: 10, name: '가족/키즈' },
];

const groups = [
  {
    type: 'horizontal',
    fields: [
      { key: 'title', label: '영업 기회명', type: 'input', inputType: 'text' ,required: true, readOnly: false },
      {
        key: 'status',
        label: '진행 상태',
        type: 'select',
        options: [
          { label: '취소', value: 1 },
          { label: '진행중', value: 2 },
          { label: '보류', value: 3 },
          { label: '게시대기', value: 4 },
          { label: '완료', value: 5 },
        ],
        width: 'w-40',
        required: true,
        readOnly: false
      },
    ],
  },
  {
    type: 'single',
    fields: [
      {
        key: 'clientCompany',
        label: '고객사',
        type: 'search-company',
        searchType: 'company',
        required: true,
        readOnly: false
      },
    ],
  },
  {
    type: 'single',
    fields: [
      {
        key: 'clientManager',
        label: '광고 담당자',
        type: 'search-manager',
        searchType: 'manager',
        extends: 'clientCompany',
        required: true,
        readOnly: false
      },
    ],
  },
  {
    type: 'horizontal',
    fields: [
      { key: 'productName', label: '상품명', type: 'input', inputType: 'text',required: true, readOnly: false },
      {
        key: 'productPrice',
        label: '상품 가격',
        type: 'input',
        inputType: 'number',
        width: 'w-40',
        required: false,
        readOnly: false
      },
    ],
  },
  {
    type: 'single',
    fields: [
      { key: 'category', label: '카테고리', type: 'category', inputType: 'text',required: false,readOnly: true},
      { key: 'expectedRevenue', label: '예상 매출', type: 'input', inputType: 'number',required: false, readOnly: true },
      {
        key: 'expectedProfitMargin',
        label: '예상 이익률 (%)',
        type: 'input',
        inputType: 'number',
        required: false,
        readOnly: true
      },
      { key: 'startedAt', label: '시작일', type: 'input', inputType: 'date' ,required: false, readOnly: true},
      { key: 'endedAt', label: '종료일', type: 'input', inputType: 'date' ,required: false, readOnly: true},
      { key: 'address', label: '주소 검색', type: 'address-search',required: false, readOnly: true },
      { key: 'detailAddress', label: '상세 주소', type: 'input', inputType: 'text',required: false,readOnly: true },
      { key: 'userList', label: '담당자', type: 'search-user', searchType: 'user' ,required: false,readOnly: true},
      { key: 'awarenessPath', label: '인지 경로', type: 'input', inputType: 'text' ,required: false, readOnly: false},
      { key: 'notes', label: '비고', type: 'textarea', required: false ,readOnly: true},
    ],
  },
];

const requiredFieldMap = new Map(
  groups.flatMap(group =>
    group.fields
      .filter(field => field.required)
      .map(field => [field.key, field.label]),
  )
);

defineExpose({ submit });
</script>

<template>
  <form @submit.prevent="submit" class="grid grid-cols-1 gap-4">
    <template v-for="(group, index) in groups" :key="index">
      <div v-if="group.type === 'horizontal'" class="flex items-center gap-4">
        <template v-for="field in group.fields" :key="field.key">
          <div :class="field.width || 'flex-1'">
            <label class="input-form-label">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>

            <input
              v-if="field.inputType === 'number'"
              type="text"
              :value="formatNumber(form[field.key])"
              @input="parseNumberInput($event, field.key)"
              :readonly="!isEditing || field.readOnly"
              :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
            />

            <select
              v-else-if="field.type === 'select'"
              v-model="form[field.key]"
              :disabled="!isEditing || field.readOnly"
              :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
            >
              <option
                v-for="option in field.options"
                :key="option.value ?? option"
                :value="option.value ?? option"
              >
                {{ option.label ?? option }}
              </option>
            </select>

            <input
              v-else
              type="text"
              v-model="form[field.key]"
              :readonly="!isEditing || field.readOnly"
              :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
            />
          </div>
        </template>
      </div>

      <template v-else>
        <template v-for="field in group.fields" :key="field.key">
          <div>
            <label class="input-form-label">
              {{ field.label }}
              <span v-if="field.required" class="text-red-500">*</span>
            </label>

            <div v-if="field.type === 'address-search'">
              <div class="flex gap-2">
                <input
                  type="text"
                  v-model="form[field.key]"
                  readonly
                  :class="['input-form-box flex-1', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
                />
              </div>
            </div>

            <div v-else-if="field.type === 'category'">
              <div class="relative">
                <button
                  class="input-form-box w-full text-left px-3 py-2"
                  :class="(isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white'"
                  @click.prevent="dropdownStates.category = !dropdownStates.category"
                  :disabled="field.readOnly"
                >
                  {{ categories.find((c) => c.id === form.category)?.name || '카테고리 선택' }}
                </button>
                <ul
                  v-if="dropdownStates.category && !field.readOnly && isEditing"
                  class="absolute w-full mt-1 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto"
                >
                  <li
                    v-for="c in categories"
                    :key="c.id"
                    class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                    @click="() => { form.category = c.id; dropdownStates.category = false; }"
                  >
                    {{ c.name }}
                  </li>
                </ul>
              </div>
            </div>

            <div v-else-if="field.type?.startsWith('search-')" class="flex gap-2">
              <input
                type="text"
                :value="Array.isArray(form[field.key]) ? form[field.key].map((u) => u.name).join(', ') : (form[field.key]?.name ?? '')"
                readonly
                :class="['input-form-box flex-1', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
              />
              <button
                type="button"
                v-if="isEditing && !field.readOnly"
                class="btn-open-popup"
                @click="openSearchPopup(field.key, field.searchType)"
                :disabled="field.extends && !form[field.extends]"
              >
                검색
              </button>
            </div>

            <textarea
              v-else-if="field.type === 'textarea'"
              v-model="form[field.key]"
              :readonly="!isEditing || field.readOnly"
              rows="3"
              :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
            />

            <input
              v-else-if="field.inputType === 'number'"
              type="text"
              :value="formatNumber(form[field.key])"
              @input="parseNumberInput($event, field.key)"
              :readonly="!isEditing || field.readOnly"
              :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
            />

            <input
              v-else-if="field.inputType === 'date'"
              type="date"
              :value="formatToDate(form[field.key])"
              @input="form[field.key] = $event.target.value"
              :disabled="!isEditing || field.readOnly"
              :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
            />

            <input
              v-else
              type="text"
              v-model="form[field.key]"
              :readonly="!isEditing || field.readOnly"
              :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
            />

            <div v-if="field.key === 'expectedProfitMargin'" class="mt-4">
              <label class="input-form-label">예상 이익 금액</label>
              <input
                type="text"
                :value="formatNumber(expectedProfitAmount)"
                :readonly="!isEditing || field.readOnly"
                :class="['input-form-box', (isEditing && field.readOnly) ? 'bg-gray-100' : 'bg-white']"
              />
            </div>
          </div>
        </template>
      </template>
    </template>
  </form>
</template>


