<template>
    <div class="fixed inset-0 bg-black/30 flex justify-center items-center z-50">
        <div class="bg-white rounded-xl p-6 w-[554px] h-[640px] overflow-y-auto font-display">
            <h2 class="text-lg font-semibold mb-6">
                인플루언서 {{ initialData ? '수정' : '등록' }}
            </h2>

            <div class="mb-4">
                <label class="text-sm font-medium mb-1 block"
                    >본명 <span class="text-red-500">*</span></label
                >
                <input
                    type="text"
                    class="w-full h-[44px] border border-gray-medium rounded px-3 text-sm"
                    v-model="form.name"
                    required
                />
            </div>

            <div class="grid grid-cols-2 gap-x-4 gap-y-4 mb-6">
                <select
                    class="h-[44px] border border-gray-medium rounded px-3 text-sm"
                    v-model="form.genderDisplay"
                >
                    <option disabled value="">성별을 선택하세요.</option>
                    <option value="남성">남성</option>
                    <option value="여성">여성</option>
                    <option value="기타">기타</option>
                </select>

                <select
                    class="h-[44px] border border-gray-medium rounded px-3 text-sm"
                    v-model="form.manager"
                >
                    <option disabled value="">담당자를 선택하세요.</option>
                    <option v-for="manager in managerList" :key="manager.id" :value="manager.name">
                        {{ manager.name }}
                    </option>
                </select>

                <select
                    class="h-[44px] border border-gray-medium rounded px-3 text-sm"
                    v-model="form.national"
                >
                    <option disabled value="">주요 지역</option>
                    <option>국내</option>
                    <option>국외</option>
                </select>

                <input
                    type="number"
                    placeholder="광고 단가를 입력하세요."
                    class="h-[44px] border border-gray-medium rounded px-3 text-sm"
                    v-model.number="form.price"
                />
            </div>

            <div
                class="w-full min-h-[80px] border border-gray-medium rounded px-3 py-2 text-sm mb-4 flex flex-wrap gap-2 items-start"
                id="categoryInput"
            >
                <span
                    v-for="tag in selectedTags"
                    :key="tag"
                    class="px-2 py-1 rounded-full cursor-pointer"
                    :class="TAG_COLOR_MAP[tag] || 'bg-gray-200 text-black'"
                    @click="returnTag(tag)"
                >
                    # {{ tag }}
                </span>
            </div>

            <div id="categoryTags" class="border border-gray-medium rounded px-3 py-2">
                <div class="flex flex-wrap gap-2">
                    <span
                        v-for="tag in availableTags"
                        :key="tag"
                        class="text-sm px-2 py-1 rounded-full cursor-pointer"
                        :class="TAG_COLOR_MAP[tag] || 'bg-gray-200 text-black'"
                        @click="moveTagToSelected(tag)"
                    >
                        # {{ tag }}
                    </span>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-6">
                <button
                    @click="$emit('close')"
                    class="bg-[color:var(--color-gray-dark)] text-white px-6 py-2 rounded"
                >
                    취소
                </button>
                <button
                    class="bg-[color:var(--color-btn-blue)] text-white px-6 py-2 rounded"
                    @click="handleSave"
                >
                    저장
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { TAG_COLOR_MAP, TAGS } from '@/constants/tags';
import { searchUser } from '@/features/chat/api.js';

const props = defineProps({ initialData: Object });
const emit = defineEmits(['close', 'save']);

const form = ref({
    name: '',
    email: '',
    genderDisplay: '',
    manager: '',
    national: '',
    price: '',
});

const managerList = ref([]);

const selectedTags = ref([]);
const availableTags = ref([...TAGS]);

const moveTagToSelected = (tag) => {
    availableTags.value = availableTags.value.filter((t) => t !== tag);
    selectedTags.value.push(tag);
};

const returnTag = (tag) => {
    selectedTags.value = selectedTags.value.filter((t) => t !== tag);
    availableTags.value.push(tag);
};

const fetchManagers = async () => {
    try {
        const response = await searchUser('');
        managerList.value = response.userList;
    } catch (error) {
        console.error('담당자 목록을 가져오는 데 실패했습니다:', error);
        alert('담당자 목록을 불러오는 중 오류가 발생했습니다.');
    }
};

const handleSave = async () => {
    if (
        !form.value.name ||
        !form.value.email ||
        !form.value.genderDisplay ||
        !form.value.national ||
        form.value.price === ''
    ) {
        alert('모든 필수 정보를 입력해주세요.');
        return;
    }

    const genderApiValue = (() => {
        switch (form.value.genderDisplay) {
            case '남성':
                return 'M';
            case '여성':
                return 'F';
            case '기타':
                return 'O';
            default:
                return '';
        }
    })();

    const categoryIds = selectedTags.value
        .map((tagName) => {
            const index = TAGS.indexOf(tagName);
            return index !== -1 ? index + 1 : null;
        })
        .filter((id) => id !== null);

    const payload = {
        ...(props.initialData && { influencerId: props.initialData.influencerId }),
        name: form.value.name,
        email: form.value.email,
        gender: genderApiValue,
        price: form.value.price,
        national: form.value.national,
        categoryIds: categoryIds,
    };

    emit('save', payload);
};

onMounted(() => {
    fetchManagers();

    if (props.initialData) {
        Object.assign(form.value, {
            name: props.initialData.name || '',
            email: props.initialData.email || '',
            genderDisplay: (() => {
                switch (props.initialData.gender) {
                    case 'M':
                        return '남성';
                    case 'F':
                        return '여성';
                    case 'O':
                        return '기타';
                    default:
                        return '';
                }
            })(),
            national: props.initialData.national || '',
            price: props.initialData.price || '',
            manager: props.initialData.manager || props.initialData.ownerName || '',
        });

        selectedTags.value = props.initialData.tags?.map((tag) => tag.categoryName) || [];
        availableTags.value = TAGS.filter((tag) => !selectedTags.value.includes(tag));
    }
});
</script>

<style scoped>
@import url('https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable.min.css');
@import 'tailwindcss';
</style>
