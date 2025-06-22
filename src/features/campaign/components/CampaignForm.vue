<script setup>
import { nextTick, reactive, ref, watch } from 'vue';

const props = defineProps({
    modelValue: Object,
    isEditing: Boolean,
});
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const popupWidth = 500;
const popupHeight = 600;
const currentFieldKey = ref(null);

const form = props.modelValue;

const expectedProfitAmount = ref(0);

watch(
    () => [form.expectedRevenue, form.expectedProfitMargin],
    ([revenue, margin]) => {
        const rev = Number(revenue || 0);
        const mar = Number(margin || 0);
        expectedProfitAmount.value = Math.round((rev * mar) / 100);
        console.log('💸 예상 이익 금액:', expectedProfitAmount.value);
    },
    { immediate: true }, // 초기값 계산까지 포함
);
const formatNumber = (value) => {
    if (value === null || value === undefined || isNaN(value)) return '';
    return value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

const parseNumberInput = (e, key) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    form[key] = raw ? parseInt(raw, 10) : 0;
};

function openPostcodeSearch() {
    new daum.Postcode({
        oncomplete: function (data) {
            const selectedAddress = data.roadAddress || data.jibunAddress;
            form.value.address = selectedAddress;
            nextTick(() => {
                const detailInput = document.getElementById('detailAddress');
                detailInput?.focus();
            });
        },
    }).open({
        left: window.screen.width / 2 - popupWidth / 2,
        top: window.screen.height / 2 - popupHeight / 2,
    });
}

const openSearchPopup = (key, type) => {
    currentFieldKey.value = key;
    const currentValue = form[key];
    const selected = currentValue?.id ?? '';

    const popup = window.open(
        `/search-popup?type=${type}&selected=${encodeURIComponent(selected)}`,
        'SearchPopup',
        'width=500,height=600',
    );

    window.handleUserSelect = (selectedItem) => {
        form[currentFieldKey.value] = selectedItem;
        popup.close();
    };
};

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

// FormGroups
const groups = [
    {
        type: 'horizontal',
        fields: [
            { key: 'title', label: '영업 기회명', type: 'input', inputType: 'text' },
            {
                key: 'status',
                label: '진행 상태',
                type: 'select',
                options: ['진행중', '보류', '완료', '취소'],
                width: 'w-40',
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
            },
        ],
    },
    {
        type: 'horizontal',
        fields: [
            { key: 'productName', label: '상품명', type: 'input', inputType: 'text' },
            {
                key: 'productPrice',
                label: '상품 가격',
                type: 'input',
                inputType: 'number',
                width: 'w-40',
            },
        ],
    },
    {
        type: 'single',
        fields: [
            { key: 'category', label: '카테고리', type: 'category', inputType: 'text' },
            { key: 'expectedRevenue', label: '예상 매출', type: 'input', inputType: 'number' },
            {
                key: 'expectedProfitMargin',
                label: '예상 이익률 (%)',
                type: 'input',
                inputType: 'number',
            },
            { key: 'startDate', label: '시작일', type: 'input', inputType: 'date' },
            { key: 'endDate', label: '종료일', type: 'input', inputType: 'date' },
            { key: 'address', label: '주소 검색', type: 'address-search' },
            { key: 'addressDetail', label: '상세 주소', type: 'input', inputType: 'text' },
            { key: 'username', label: '담당자', type: 'search-user', searchType: 'user' },
            { key: 'awarenessPath', label: '인지 경로', type: 'input', inputType: 'text' },
            { key: 'notes', label: '비고', type: 'textarea' },
        ],
    },
];
</script>

<template>
    <form @submit.prevent="emit('submit')" class="grid grid-cols-1 gap-4">
        <template v-for="(group, index) in groups" :key="index">
            <div v-if="group.type === 'horizontal'" class="flex items-center gap-4">
                <template v-for="field in group.fields" :key="field.key">
                    <div :class="field.width || 'flex-1'">
                        <label class="input-form-label">{{ field.label }}</label>

                        <input
                            v-if="field.inputType === 'number'"
                            type="text"
                            :value="formatNumber(form[field.key])"
                            @input="parseNumberInput($event, field.key)"
                            :readonly="!isEditing"
                            class="input-form-box"
                        />

                        <select
                            v-else-if="field.type === 'select'"
                            v-model="form[field.key]"
                            :disabled="!isEditing"
                            class="input-form-box"
                        >
                            <option v-for="option in field.options" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>

                        <input
                            v-else
                            type="text"
                            v-model="form[field.key]"
                            :readonly="!isEditing"
                            class="input-form-box"
                        />
                    </div>
                </template>
            </div>

            <template v-else>
                <template v-for="field in group.fields" :key="field.key">
                    <div>
                        <label class="input-form-label">{{ field.label }}</label>

                        <div v-if="field.type === 'address-search'">
                            <div class="flex gap-2">
                                <input
                                    type="text"
                                    v-model="form[field.key]"
                                    readonly
                                    class="input-form-box flex-1 bg-gray-100"
                                />
                                <button
                                    type="button"
                                    class="btn-open-popup"
                                    @click="openPostcodeSearch"
                                    v-if="isEditing"
                                >
                                    검색
                                </button>
                            </div>
                        </div>

                        <div v-else-if="field.type === 'category'">
                            <div class="relative">
                                <button
                                    class="input-form-box w-full text-left px-3 py-2"
                                    @click="dropdownStates.category = !dropdownStates.category"
                                >
                                    {{
                                        categories.find((c) => c.id === form.category)?.name ||
                                        '카테고리 선택'
                                    }}
                                </button>
                                <ul
                                    v-if="dropdownStates.category"
                                    class="absolute w-full mt-1 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto"
                                >
                                    <li
                                        v-for="c in categories"
                                        :key="c.id"
                                        class="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                                        @click="
                                            () => {
                                                form.category = c.id;
                                                dropdownStates.category = false;
                                            }
                                        "
                                    >
                                        {{ c.name }}
                                    </li>
                                </ul>
                            </div>
                        </div>
                        <div v-else-if="field.type?.startsWith('search-')" class="flex gap-2">
                            <input
                                type="text"
                                :value="
                                    Array.isArray(form[field.key])
                                        ? form[field.key].map((u) => u.name).join(', ')
                                        : (form[field.key]?.name ?? '')
                                "
                                readonly
                                class="input-form-box flex-1"
                            />
                            <button
                                type="button"
                                v-if="isEditing"
                                class="btn-open-popup"
                                @click="openSearchPopup(field.key, field.searchType)"
                            >
                                검색
                            </button>
                        </div>
                        <textarea
                            v-else-if="field.type === 'textarea'"
                            v-model="form[field.key]"
                            :readonly="!isEditing"
                            rows="3"
                            class="input-form-box"
                        />

                        <input
                            v-else-if="field.inputType === 'number'"
                            type="text"
                            :value="formatNumber(form[field.key])"
                            @input="parseNumberInput($event, field.key)"
                            :readonly="!isEditing"
                            class="input-form-box"
                        />

                        <select
                            v-else-if="field.type === 'select'"
                            v-model="form[field.key]"
                            :disabled="!isEditing"
                            class="input-form-box"
                        >
                            <option v-for="option in field.options" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>

                        <input
                            v-else-if="field.inputType === 'date'"
                            type="date"
                            v-model="form[field.key]"
                            :disabled="!isEditing"
                            class="input-form-box"
                        />

                        <input
                            v-else
                            type="text"
                            v-model="form[field.key]"
                            :readonly="!isEditing"
                            class="input-form-box"
                        />

                        <div v-if="field.key === 'expectedProfitMargin'" class="mt-4">
                            <label class="input-form-label">예상 이익 금액</label>
                            <input
                                type="text"
                                :value="formatNumber(expectedProfitAmount)"
                                readonly
                                class="input-form-box bg-gray-100"
                            />
                        </div>
                    </div>
                </template>
            </template>
        </template>
    </form>
</template>
