<script setup>
import { ref, watch } from 'vue';
import { Icon } from '@iconify/vue';
import { downloadFile } from '@/features/campaign/api.js';

const props = defineProps({
    modelValue: { type: Array, default: () => [] },
    isEditing: { type: Boolean, default: true },
});
const emit = defineEmits(['update:modelValue', 'submit']);

const fileInput = ref();
const files = ref([...props.modelValue]);

watch(
    () => props.modelValue,
    (val) => {
        files.value = [...val];
    },
);

const handleFileChange = (e) => {
    const newFiles = Array.from(e.target.files).map((file) => ({
        name: file.name,
        file: file,
    }));

    // 기존 파일명과 비교해서 중복 제거
    const existingNames = files.value.map((f) => f.name);
    const filteredNewFiles = newFiles.filter((f) => !existingNames.includes(f.name));

    files.value = [...files.value, ...filteredNewFiles];
    emit('update:modelValue', files.value);
    e.target.value = null;
};

const handleRemove = (index) => {
    files.value.splice(index, 1);
    emit('update:modelValue', files.value);
};

const handleDownload = async (fileObj) => {
    if (fileObj.file) {
        // 로컬에서 업로드된 파일
        const blobUrl = URL.createObjectURL(fileObj.file);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileObj.name;
        link.click();
        URL.revokeObjectURL(blobUrl);
    } else if (fileObj.key) {
        // 서버에서 다운로드
        try {
            const res = await downloadFile(fileObj.key);
            const blob = new Blob([res.data], { type: res.headers['content-type'] });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');
            link.href = url;
            link.download = decodeURIComponent(
                getFileNameFromHeader(res.headers['content-disposition']) || fileObj.name,
            );
            link.click();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('파일 다운로드 실패:', err);
        }
    }
};

function getFileNameFromHeader(disposition) {
    if (!disposition) return null;
    const filenameRegex = /filename\*=UTF-8''(.+)|filename="(.+)"/;
    const matches = filenameRegex.exec(disposition);
    return decodeURIComponent(matches?.[1] || matches?.[2] || '');
}
</script>

<template>
    <div class="flex justify-between items-center mb-2">
        <div class="font-semibold text-md">첨부파일 ({{ files.length }})</div>

        <div class="flex items-center gap-2">
            <button v-if="isEditing" class="btn-create" @click="fileInput.click()">등록</button>
        </div>
    </div>

    <input type="file" multiple ref="fileInput" class="hidden" @change="handleFileChange" />

    <div v-if="files.length === 0" class="text-gray-400 text-sm">첨부된 파일이 없습니다.</div>

    <ul v-else class="mt-2">
        <li
            v-for="(file, index) in files"
            :key="index"
            class="flex justify-start items-center py-1 border-b border-b-gray-medium gap-3"
        >
            <div
                class="flex items-center gap-1 cursor-pointer hover:underline hover:underline-offset-4 hover:decoration-gray-medium"
                @click="handleDownload(file)"
            >
                <span class="truncate text-gray-dark text-md">{{ file.name }}</span>
            </div>

            <div class="flex gap-2 items-center">
                <button class="text-gray-dark text-md cursor-pointer" @click="handleDownload(file)">
                    <Icon icon="mdi:download" />
                </button>

                <button
                    v-if="isEditing"
                    class="text-reject text-md cursor-pointer"
                    @click="handleRemove(index)"
                >
                    <Icon icon="mdi:close" />
                </button>
            </div>
        </li>
    </ul>
</template>
