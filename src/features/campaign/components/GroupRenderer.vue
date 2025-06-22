<script setup>
import { reactive } from 'vue';

const emit = defineEmits(['update:form']);
const props = defineProps({
    form: Object,
    group: Object,
    isEditing: Boolean,
    expectedProfitAmount: Number,
    formatNumber: Function,
    parseNumberInput: Function,
    openPostcodeSearch: Function,
    openSearchPopup: Function,
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

const dropdownStates = reactive({});
</script>

<template>
    <div v-if="group?.fields?.length">
        <!-- 수평 그룹 -->
        <div v-if="group.type === 'horizontal'" class="flex items-center gap-4">
            <template v-for="field in group.fields" :key="field.key">
                <div :class="field.width || 'flex-1'">
                    <label class="input-form-label">{{ field.label }}</label>

                    <template v-if="field.inputType === 'number'">
                        <input
                            type="text"
                            :value="formatNumber(form[field.key])"
                            @input="
                                (e) => {
                                    parseNumberInput(e, field.key);
                                    emit('update:form', { ...form });
                                }
                            "
                            class="input-form-box"
                        />
                    </template>

                    <template v-else-if="field.type === 'select'">
                        <select
                            v-model="form[field.key]"
                            @change="emit('update:form', { ...form })"
                            class="input-form-box"
                        >
                            <option v-for="option in field.options" :key="option" :value="option">
                                {{ option }}
                            </option>
                        </select>
                    </template>

                    <input
                        v-else-if="field.inputType === 'date'"
                        type="date"
                        v-model="form[field.key]"
                        @change="emit('update:form', { ...form })"
                        class="input-form-box"
                    />

                    <template v-else>
                        <input
                            type="text"
                            v-model="form[field.key]"
                            @input="emit('update:form', { ...form })"
                            class="input-form-box"
                        />
                    </template>
                </div>
            </template>
        </div>

        <!-- 수직 그룹 -->
        <div v-else>
            <template v-for="field in group.fields" :key="field.key">
                <div class="mb-3">
                    <label class="input-form-label">{{ field.label }}</label>

                    <!-- 주소 검색 -->
                    <div v-if="field.type === 'address-search'" class="flex gap-2">
                        <input
                            type="text"
                            v-model="form[field.key]"
                            readonly
                            class="input-form-box bg-gray-100 flex-1"
                        />
                        <button type="button" class="btn-open-popup" @click="openPostcodeSearch">
                            검색
                        </button>
                    </div>

                    <!-- 팝업 검색 -->
                    <div v-else-if="field.type?.startsWith('search-')" class="flex gap-2">
                        <input
                            type="text"
                            :value="form[field.key]?.name || ''"
                            readonly
                            class="input-form-box bg-gray-100 flex-1"
                        />
                        <button
                            type="button"
                            class="btn-open-popup"
                            @click="openSearchPopup(field.key, field.searchType)"
                        >
                            검색
                        </button>
                    </div>

                    <!-- 카테고리 선택 -->
                    <div v-else-if="field.type === 'category-select'" class="relative">
                        <button
                            type="button"
                            class="input-form-box w-full text-left px-3 py-2 text-sm"
                            @click="dropdownStates[field.key] = !dropdownStates[field.key]"
                        >
                            {{
                                categories.find((c) => c.id === form[field.key])?.name ||
                                '카테고리를 선택하세요'
                            }}
                        </button>
                        <ul
                            v-if="dropdownStates[field.key]"
                            class="absolute w-full mt-1 bg-white border border-gray-300 shadow rounded max-h-40 overflow-y-auto z-10"
                        >
                            <li
                                v-for="category in categories"
                                :key="category.id"
                                @click="
                                    () => {
                                        form[field.key] = category.id;
                                        dropdownStates[field.key] = false;
                                        emit('update:form', { ...form });
                                    }
                                "
                                class="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                            >
                                {{ category.name }}
                            </li>
                        </ul>
                    </div>

                    <!-- 텍스트에어리어 -->
                    <textarea
                        v-else-if="field.type === 'textarea'"
                        v-model="form[field.key]"
                        @input="emit('update:form', { ...form })"
                        rows="3"
                        class="input-form-box"
                    />

                    <!-- 숫자 입력 -->
                    <input
                        v-else-if="field.inputType === 'number'"
                        type="text"
                        :value="formatNumber(form[field.key])"
                        @input="
                            (e) => {
                                parseNumberInput(e, field.key);
                                emit('update:form', { ...form });
                            }
                        "
                        class="input-form-box"
                    />

                    <!-- 기본 셀렉트 -->
                    <select
                        v-else-if="field.type === 'select'"
                        v-model="form[field.key]"
                        @change="emit('update:form', { ...form })"
                        class="input-form-box"
                    >
                        <option v-for="option in field.options" :key="option" :value="option">
                            {{ option }}
                        </option>
                    </select>

                    <!-- 기본 input -->
                    <input
                        v-else
                        type="text"
                        v-model="form[field.key]"
                        @input="emit('update:form', { ...form })"
                        class="input-form-box"
                    />

                    <!-- 예상 이익 금액 -->
                    <div v-if="field.key === 'expectedProfitMargin'" class="mt-2">
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
        </div>
    </div>
</template>
