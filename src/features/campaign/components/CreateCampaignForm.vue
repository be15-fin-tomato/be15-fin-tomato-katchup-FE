<script setup>
import { ref, reactive, watch } from 'vue';

const emit = defineEmits(['update:form']);
const props = defineProps({
    form: Object,
    isEditing: Boolean,
});

const dropdownStates = reactive({
    category: false,
});

const expectedProfitAmount = ref(0);

watch(
    () => [props.form.expectedRevenue, props.form.expectedProfitMargin],
    ([revenue, margin]) => {
        const rev = Number(revenue || 0);
        const mar = Number(margin || 0);
        expectedProfitAmount.value = Math.round((rev * mar) / 100);
    },
    { immediate: true },
);

const formatNumber = (val) =>
    val === null || val === undefined || isNaN(val)
        ? ''
        : val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const parseNumberInput = (e, key) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    props.form[key] = raw ? parseInt(raw, 10) : 0;
};

function openSearchPopup(key, type) {
    const selected = props.form[key]?.id ?? '';
    const left = window.screenX + (window.outerWidth - 500) / 1.3;
    const top = window.screenY + (window.outerHeight - 600) / 2;
    const popup = window.open(
        `/search-popup?type=${type}&selected=${encodeURIComponent(selected)}`,
        'SearchPopup',
        `width=500,height=600,left=${left},top=${top},resizable=no,scrollbars=yes`,
    );
    window.handleUserSelect = (item) => {
        props.form[key] = item;
        popup.close();
    };
}

const campaignStatuses = [
    { id: 1, name: '취소' },
    { id: 2, name: '진행중' },
    { id: 3, name: '보류' },
    { id: 4, name: '게시대기' },
    { id: 5, name: '성공' },
];

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

function toggleCategory(catId) {
    if (!Array.isArray(props.form.category)) {
        props.form.category = [];
    }

    const selected = props.form.category.slice(); // 새 배열 복사

    const index = selected.indexOf(catId);
    if (index > -1) {
        selected.splice(index, 1); // 제거
    } else {
        selected.push(catId); // 추가
    }

    props.form.category = selected; // 새 배열로 할당 → 반응성 보장
}
</script>

<template>
    <div class="grid grid-cols-2 gap-4 relative">
        <div class="absolute top-0 bottom-0 left-1/2 w-px bg-gray-medium"></div>

        <!-- 왼쪽 -->
        <div class="flex flex-col gap-4 pr-4">
            <div class="flex gap-4">
                <div class="flex-1">
                    <label class="input-form-label text-red-500">*</label>
                    <label class="input-form-label">캠페인명</label>
                    <input type="text" v-model="props.form.title" class="input-form-box" />
                </div>
                <div class="w-40">
                    <label class="input-form-label text-red-500">*</label>
                    <label class="input-form-label">상태</label>
                    <select v-model="props.form.status" class="input-form-box">
                        <option
                            v-for="status in campaignStatuses"
                            :key="status.id"
                            :value="status.id"
                        >
                            {{ status.name }}
                        </option>
                    </select>
                </div>
            </div>

            <div class="flex gap-4">
                <div class="flex-1">
                    <label class="input-form-label">
                        고객사 <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            :value="props.form.clientCompany?.name || ''"
                            class="input-form-box bg-gray-100 flex-1"
                            readonly
                        />
                        <button
                            class="btn-open-popup"
                            @click="openSearchPopup('clientCompany', 'company')"
                        >
                            검색
                        </button>
                    </div>
                </div>
                <div class="flex-1">
                    <label class="input-form-label">
                        사원 <span class="text-red-500 ml-1">*</span>
                    </label>
                    <div class="flex gap-2">
                        <input
                            type="text"
                            :value="props.form.clientManager?.name || ''"
                            class="input-form-box bg-gray-100 flex-1"
                            readonly
                        />
                        <button
                            class="btn-open-popup"
                            @click="openSearchPopup('clientManager', 'manager')"
                        >
                            검색
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <label class="input-form-label">
                    담당자 <span class="text-red-500 ml-1">*</span>
                </label>
                <div class="flex gap-2">
                    <input
                        type="text"
                        :value="
                            Array.isArray(props.form.user)
                                ? props.form.user.map((u) => u.name).join(', ')
                                : props.form.user?.name || ''
                        "
                        class="input-form-box bg-gray-100 flex-1"
                        readonly
                    />
                    <button class="btn-open-popup" @click="openSearchPopup('user', 'user')">
                        검색
                    </button>
                </div>
            </div>

            <div class="flex gap-4">
                <div class="flex-1">
                    <label class="input-form-label">
                        시작일 <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="date" v-model="props.form.requestDate" class="input-form-box" />
                </div>
                <div class="flex-1">
                    <label class="input-form-label">
                        종료일 <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input
                        type="date"
                        v-model="props.form.announcementDate"
                        class="input-form-box"
                    />
                </div>
            </div>

            <div>
                <label class="input-form-label">인지 경로</label>
                <input type="text" v-model="props.form.awarenessPath" class="input-form-box" />
            </div>
        </div>

        <!-- 오른쪽 -->
        <div class="flex flex-col gap-4 pl-4">
            <div class="flex gap-4">
                <div class="flex-1">
                    <label class="input-form-label">
                        상품명 <span class="text-red-500 ml-1">*</span>
                    </label>
                    <input type="text" v-model="props.form.productName" class="input-form-box" />
                </div>
                <div class="flex-1">
                    <label class="input-form-label">상품 가격</label>
                    <input
                        type="text"
                        :value="formatNumber(props.form.productPrice)"
                        @input="(e) => parseNumberInput(e, 'productPrice')"
                        class="input-form-box"
                    />
                </div>
            </div>

            <div>
                <label class="input-form-label">
                    카테고리 <span class="text-red-500 ml-1">*</span>
                </label>
                <div class="relative">
                    <button
                        class="input-form-box w-full text-left"
                        @click="dropdownStates.category = !dropdownStates.category"
                    >
                        {{
                            Array.isArray(props.form.category)
                                ? categories
                                      .filter((c) => props.form.category.includes(c.id))
                                      .map((c) => c.name)
                                      .join(', ') || '카테고리 선택'
                                : '카테고리 선택'
                        }}
                    </button>
                    <ul
                        v-if="dropdownStates.category"
                        class="absolute w-full mt-1 bg-white border rounded shadow z-10 max-h-40 overflow-y-auto"
                    >
                        <li
                            v-for="c in categories"
                            :key="c.id"
                            class="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center gap-2"
                            @click="toggleCategory(c.id)"
                        >
                            <input
                                type="checkbox"
                                :checked="props.form.category?.includes(c.id)"
                                @change.stop
                            />
                            {{ c.name }}
                        </li>
                    </ul>
                </div>
            </div>

            <div>
                <label class="input-form-label">예상 매출</label>
                <input
                    type="text"
                    :value="formatNumber(props.form.expectedRevenue)"
                    @input="(e) => parseNumberInput(e, 'expectedRevenue')"
                    class="input-form-box"
                />
            </div>

            <div>
                <label class="input-form-label">예상 이익률 (%)</label>
                <input
                    type="text"
                    :value="formatNumber(props.form.expectedProfitMargin)"
                    @input="(e) => parseNumberInput(e, 'expectedProfitMargin')"
                    class="input-form-box"
                />
            </div>

            <div>
                <label class="input-form-label">예상 이익 금액</label>
                <input
                    type="text"
                    :value="formatNumber(expectedProfitAmount)"
                    class="input-form-box bg-gray-100"
                    readonly
                />
            </div>

            <div class="col-span-2">
                <label class="input-form-label">피드백</label>
                <textarea
                    v-model="props.form.notes"
                    rows="3"
                    class="input-form-box w-full"
                ></textarea>
            </div>
        </div>
    </div>
</template>
