<script setup>
import { ref } from 'vue';

const props = defineProps({
    modelValue: Object,
    groups: Array,
    isEditing: Boolean,
});
const emit = defineEmits(['update:modelValue', 'submit', 'cancel']);

const form = props.modelValue;
const currentFieldKey = ref(null);

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
</script>

<template>
    <form @submit.prevent="emit('submit')" class="grid grid-cols-1 gap-4">
        <template v-for="(group, index) in groups" :key="index">
            <div v-if="group.type === 'horizontal'" class="flex gap-4">
                <template v-for="field in group.fields" :key="field.key">
                    <div
                        class="flex-1"
                        :style="{ flexBasis: (field.width ?? 100 / group.fields.length) + '%' }"
                    >
                        <label class="input-form-label">{{ field.label }}</label>

                        <!-- 날짜 범위 -->
                        <div v-if="field.type === 'date-range'" class="flex items-center gap-2">
                            <input
                                type="date"
                                v-model="form.startDate"
                                :disabled="!isEditing"
                                class="input-form-box"
                            />
                            <span>~</span>
                            <input
                                type="date"
                                v-model="form.endDate"
                                :disabled="!isEditing"
                                class="input-form-box"
                            />
                        </div>

                        <!-- 셀렉트 박스 -->
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

                        <!-- 숫자 입력 -->
                        <input
                            v-else-if="field.inputType === 'number'"
                            type="text"
                            :value="formatNumber(form[field.key])"
                            @input="parseNumberInput($event, field.key)"
                            :readonly="!isEditing || field.disabled"
                            class="input-form-box"
                        />

                        <!-- 검색 팝업 -->
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

                        <!-- 날짜 입력 -->
                        <input
                            v-else-if="field.inputType === 'date'"
                            type="date"
                            v-model="form[field.key]"
                            :disabled="!isEditing"
                            class="input-form-box"
                        />

                        <!-- 컨텐츠 입력 버튼 -->
                        <div v-else-if="field.type === 'platform'" class="w-full">
                            <button
                                type="button"
                                class="w-full h-[36px] text-sm font-semibold rounded-[8px] shadow transition bg-blue-500 text-white"
                                @click="
                                    form.showInfluencerContentInput =
                                        !form.showInfluencerContentInput
                                "
                            >
                                {{
                                    form.showInfluencerContentInput
                                        ? '입력 닫기'
                                        : '컨텐츠 입력하기'
                                }}
                            </button>
                        </div>

                        <!-- 기본 텍스트 입력 -->
                        <input
                            v-else-if="field.type === 'input' || !field.type"
                            type="text"
                            v-model="form[field.key]"
                            :readonly="!isEditing || field.disabled"
                            class="input-form-box"
                        />
                    </div>
                </template>
            </div>

            <!-- textarea 전용 영역 -->
            <template v-else>
                <!-- 아코디언 전환 -->
                <Transition name="accordion">
                    <div
                        v-show="form.showInfluencerContentInput && form.influencerContents?.length"
                        class="overflow-hidden mt-4"
                    >
                        <div
                            v-for="item in form.influencerContents"
                            :key="item.influencerId"
                            class="p-4 mb-2 border border-gray-dark rounded-lg bg-white space-y-2"
                        >
                            <div class="font-semibold">{{ item.name }}</div>

                            <div class="flex gap-2">
                                <!-- 유튜브 버튼 -->
                                <button
                                    type="button"
                                    :disabled="!isEditing"
                                    @click="isEditing && (item.platform = 'youtube')"
                                    :class="[
                                        'w-[100px] h-[32px] text-sm font-semibold rounded shadow transition',
                                        item.platform === 'youtube'
                                            ? 'bg-[#FF0000] text-white'
                                            : 'bg-gray-200 text-gray-600',
                                    ]"
                                >
                                    유튜브
                                </button>

                                <!-- 인스타그램 버튼 -->
                                <button
                                    type="button"
                                    :disabled="!isEditing"
                                    @click="isEditing && (item.platform = 'instagram')"
                                    :class="[
                                        'w-[100px] h-[32px] text-sm font-semibold rounded shadow transition',
                                        item.platform === 'instagram'
                                            ? 'text-white'
                                            : 'bg-gray-200 text-gray-600',
                                    ]"
                                    :style="
                                        item.platform === 'instagram'
                                            ? {
                                                  background:
                                                      'linear-gradient(45deg, #feda75, #fa7e1e, #d62976, #962fbf, #4f5bd5)',
                                              }
                                            : {}
                                    "
                                >
                                    인스타그램
                                </button>
                            </div>

                            <input
                                v-model="item.url"
                                :readonly="!isEditing"
                                type="text"
                                placeholder="컨텐츠 URL 입력"
                                class="input-form-box w-full"
                            />
                        </div>
                    </div>
                </Transition>
                <template v-for="field in group.fields" :key="field.key">
                    <div>
                        <label class="input-form-label">{{ field.label }}</label>
                        <textarea
                            v-if="field.type === 'textarea'"
                            v-model="form[field.key]"
                            :readonly="!isEditing || field.disabled"
                            class="input-form-box"
                            rows="3"
                        />
                    </div>
                </template>
            </template>
        </template>
    </form>
</template>

<style scoped>
.accordion-enter-active,
.accordion-leave-active {
    transition: max-height 0.3s ease;
}
.accordion-enter-from,
.accordion-leave-to {
    max-height: 0;
}
.accordion-enter-to,
.accordion-leave-from {
    max-height: 1000px; /* 충분히 큰 값 */
}
</style>
