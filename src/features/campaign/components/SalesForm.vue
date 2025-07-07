<script setup>
import { computed, ref, watch } from 'vue';
import { useRoute } from 'vue-router';

const route = useRoute();

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

const onAdPriceInput = (event, item) => {
    const raw = event.target.value.replace(/[^0-9]/g, '');
    item.adPrice = raw ? parseInt(raw, 10) : 0;
};

const parseNumberInput = (e, key) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    form[key] = raw ? parseInt(raw, 10) : 0;
};

watch(
    () => form.clientCompany?.id,
    (newVal, oldVal) => {
        if (oldVal === undefined) return;

        if (newVal !== oldVal) {
            form.clientManager = null;
            form.campaign = null;
        }
    },
);

const showInfluencerButton = computed(() => {
    return route.path.includes('revenue');
});

const initializeInfluencerContents = () => {
    if (!form.influencerList) return;

    form.influencerContents = form.influencerList.map((influencer) => {
        const youtube = influencer.youtubeLink?.trim();
        const instagram = influencer.instagramLink?.trim();

        return {
            influencerId: influencer.influencerId,
            name: influencer.influencerName,
            platform: youtube ? 'youtube' : instagram ? 'instagram' : null,
            url: youtube || instagram || '',
            adPrice: influencer.adPrice ?? 0,
        };
    });
};

const openSearchPopup = (key, type) => {
    currentFieldKey.value = key;
    const currentValue = form[key];
    const selected = currentValue?.id ?? '';

    // clientCompanyId가 필요한 경우만 별도 처리
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

    window.handleUserSelect = (selectedItem) => {
        form[currentFieldKey.value] = selectedItem;
        popup.close();
    };
};

watch(
    () => form.influencerList,
    () => {
        initializeInfluencerContents();
    },
    { immediate: true },
);
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
                                v-model="form.startedAt"
                                :disabled="!isEditing"
                                class="input-form-box"
                            />
                            <span>~</span>
                            <input
                                type="date"
                                v-model="form.endedAt"
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
                            <option
                                v-for="option in field.options"
                                :key="option.value"
                                :value="option.value"
                            >
                                {{ option.label }}
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
                        <div
                            v-else-if="field.type?.startsWith('search-')"
                            class="flex gap-2 items-center"
                        >
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

                            <!-- 인플루언서 전용 컨텐츠 입력 버튼 -->
                            <button
                                v-if="field.key === 'influencer' && showInfluencerButton"
                                type="button"
                                class="btn-create"
                                @click="
                                    form.showInfluencerContentInput =
                                        !form.showInfluencerContentInput
                                "
                            >
                                {{
                                    !isEditing
                                        ? form.showInfluencerContentInput
                                            ? '닫기'
                                            : '컨텐츠 보기'
                                        : form.showInfluencerContentInput
                                          ? '입력 닫기'
                                          : '컨텐츠 입력하기'
                                }}
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
                        <!--                        <div v-else-if="field.type === 'platform'" class="w-full">-->
                        <!--                            <button-->
                        <!--                                type="button"-->
                        <!--                                class="w-full h-[36px] text-sm font-semibold rounded-[8px] shadow transition bg-blue-500 text-white"-->
                        <!--                                @click="-->
                        <!--                                    form.showInfluencerContentInput =-->
                        <!--                                        !form.showInfluencerContentInput-->
                        <!--                                "-->
                        <!--                            >-->
                        <!--                                {{-->
                        <!--                                    form.showInfluencerContentInput-->
                        <!--                                        ? '입력 닫기'-->
                        <!--                                        : '컨텐츠 입력하기'-->
                        <!--                                }}-->
                        <!--                            </button>-->
                        <!--                        </div>-->

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

                            <!-- 플랫폼 선택 버튼 -->
                            <div class="flex gap-2">
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

                            <!-- URL + 단가 입력 -->
                            <div class="flex gap-2">
                                <input
                                    v-model="item.url"
                                    :readonly="!isEditing"
                                    type="text"
                                    placeholder="컨텐츠 URL 입력"
                                    class="input-form-box flex-1"
                                />
                                <input
                                    type="text"
                                    :value="formatNumber(item.adPrice)"
                                    @input="onAdPriceInput($event, item)"
                                    :readonly="!isEditing"
                                    placeholder="단가 (₩)"
                                    class="input-form-box w-[140px]"
                                />
                            </div>
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
