<script setup>
import { ref } from 'vue';
import QuillEditor from '@/components/common/QuillEditor.vue';

const editorContent = ref('');
const title = ref('');

// 이름, 이메일은 선택된 사용자로부터 반영됨
const name = ref('');
const email = ref('');

// 팝업 검색 필드 지정용 key
const currentFieldKey = ref('');
const form = ref({
    email: null, // 선택된 사용자 전체 객체
});

const openSearchPopup = (key, type) => {
    currentFieldKey.value = key;
    const currentValue = form.value[key];
    const selected = currentValue?.id ?? '';

    const popup = window.open(
        `/search-popup?type=${type}&selected=${encodeURIComponent(selected)}&labelKey=fullLabel`,
        'SearchPopup',
        'width=500,height=600',
    );

    window.handleUserSelect = (selectedItem) => {
        form.value[currentFieldKey.value] = selectedItem;

        if (key === 'email') {
            name.value = selectedItem.name;
            email.value = selectedItem.email;
        }

        popup.close();
    };
};
</script>

<template>
    <div class="border border-gray-dark rounded-lg bg-white p-6 mt-6">
        <!-- 이름 -->
        <div class="mb-4 flex items-center gap-2">
            <label class="w-[76px] font-semibold">이름</label>
            <input
                type="text"
                :value="name"
                disabled
                class="border px-2 py-1 rounded w-[10%] bg-gray-100 border-gray-dark"
            />
        </div>

        <!-- 이메일 -->
        <div class="mb-4 flex items-center gap-2">
            <label class="w-[75px] font-semibold">이메일</label>
            <input
                type="email"
                :value="form.email?.email ?? ''"
                disabled
                class="border px-2 py-1 rounded w-[20%] bg-gray-100 border-gray-dark"
            />
            <button
                type="button"
                class="btn-open-popup"
                @click="openSearchPopup('email', 'manager')"
            >
                검색
            </button>
        </div>

        <!-- 제목 -->
        <div class="mb-4 flex items-start gap-2">
            <label class="w-[75px] font-semibold">제목</label>
            <input type="text" v-model="title" class="input-form-box flex-1 border-gray-dark" />
        </div>

        <div class="mb-4 flex items-start gap-2">
            <label class="w-[75px] font-semibold pt-2">내용</label>
            <div class="flex-1">
                <QuillEditor v-model:content="editorContent" />
                <div class="flex justify-end mt-4">
                    <button class="btn-create">전송</button>
                </div>
            </div>
        </div>
    </div>
</template>
