<script setup>
import { ref, computed } from 'vue';
import { Icon } from '@iconify/vue';
import SmallTemplateModal from '@/features/contract/components/SmallTemplateModal.vue';
import SmallTemplateEditModal from '@/features/contract/components/SmallTemplateEditModal.vue';
import SendEmail from '@/features/contract/components/SendEmail.vue';

const bigList = ref([
    { id: 1, name: '계약서' },
    { id: 2, name: '이메일' },
]);

const smallList = ref([
    {
        id: 1,
        name: '특수 계약서',
        parentId: 1,
        content: '특수 계약서에 대한 상세내용',
        createdAt: '2025-06-18',
        active: false,
        parentName: '계약서',
    },
    {
        id: 2,
        name: '일반 계약서',
        parentId: 1,
        content: '일반 계약서 설명',
        createdAt: '2025-06-17',
        active: false,
        parentName: '계약서',
    },
    {
        id: 3,
        name: '제안문의 메일',
        parentId: 2,
        content: '제안 관련 메일',
        createdAt: '2025-06-10',
        active: false,
        parentName: '이메일',
    },
    {
        id: 4,
        name: '일정조정 메일',
        parentId: 2,
        content: '일정 조정 메일',
        createdAt: '2025-06-11',
        active: false,
        parentName: '이메일',
    },
]);

const selectedBig = ref(bigList.value[0]);
const selectedSmall = ref(null);
const showBigInput = ref(false);
const newBigName = ref('');
const showSmallModal = ref(false);
const showEditModal = ref(false);
const editTarget = ref(null);

const editingBigId = ref(null);
const editBigName = ref('');

function startEditBig(item) {
    editingBigId.value = item.id;
    editBigName.value = item.name;
}

function confirmEditBig(item) {
    const target = bigList.value.find((b) => b.id === item.id);
    if (target) {
        target.name = editBigName.value;
        if (selectedBig.value.id === item.id) {
            selectedBig.value = { ...target };
        }
    }
    editingBigId.value = null;
    editBigName.value = '';
}

function cancelEditBig() {
    editingBigId.value = null;
    editBigName.value = '';
}

function handleAddSmall(newItem) {
    const parent = bigList.value.find((b) => b.id === newItem.parentId);
    if (parent) {
        newItem.parentName = parent.name;
    }
    smallList.value.push(newItem);
}

function handleUpdateSmall(updatedItem) {
    const index = smallList.value.findIndex((s) => s.id === updatedItem.id);
    if (index !== -1) {
        smallList.value[index] = updatedItem;
        if (selectedSmall.value?.id === updatedItem.id) {
            selectedSmall.value = { ...updatedItem };
        }
    }
}

const filteredSmallList = computed(() =>
    smallList.value.filter((s) => s.parentId === selectedBig.value.id),
);

function editItem(item) {
    editTarget.value = { ...item };
    showEditModal.value = true;
}

function deleteItem(item, type) {
  if (type === 'big') {
    const bigIndex = bigList.value.findIndex((b) => b.id === item.id);
    if (bigIndex !== -1) {
      bigList.value.splice(bigIndex, 1);
      if (selectedBig.value?.id === item.id) {
        selectedBig.value = bigList.value[0] || null;
      }

      // 해당 종류에 속한 small도 삭제
      smallList.value = smallList.value.filter(s => s.parentId !== item.id);
    }
  } else if (type === 'small') {
    const smallIndex = smallList.value.findIndex((s) => s.id === item.id);
    if (smallIndex !== -1) {
      smallList.value.splice(smallIndex, 1);
      if (selectedSmall.value?.id === item.id) {
        selectedSmall.value = null;
      }
    }
  }
}

function confirmAddBig() {
    const name = newBigName.value.trim();
    if (!name) return alert('이름을 입력해주세요.');
    if (bigList.value.some((item) => item.name === name)) {
        return alert('이미 존재하는 이름입니다.');
    }
    bigList.value.push({ id: Date.now(), name });
    newBigName.value = '';
    showBigInput.value = false;
}

function cancelAddBig() {
    newBigName.value = '';
    showBigInput.value = false;
}
</script>

<template>
    <div class="container">
        <div class="page-header">
            <div class="page-title">템플릿 목록</div>
        </div>
        <div class="blue-line mb-6"></div>

        <!-- 전체 콘텐츠 박스 -->
        <div class="tem-box w-full max-w-full">
            <!-- 상단 영역: 큰틀, 작은틀, 정보 -->
            <div class="flex gap-6 min-w-0">
                <!-- 큰 틀 -->
                <div class="w-[300px] border border-gray-dark rounded bg-white flex flex-col">
                    <div class="flex items-center justify-between px-4 pt-4 pb-2">
                        <h3 class="font-bold text-sm">종류</h3>
                        <button
                            class="text-gray-dark text-sm cursor-pointer"
                            @click="showBigInput = true"
                        >
                            <Icon icon="tdesign:plus" width="24" height="24" />
                        </button>
                    </div>
                    <div class="border-t border-gray-dark mb-2"></div>

                    <div class="overflow-y-auto flex-1 px-4">
                        <div v-for="item in bigList" :key="item.id" class="group relative mb-2">
                            <div class="flex items-center gap-2">
                                <template v-if="editingBigId === item.id">
                                    <input
                                        v-model="editBigName"
                                        class="w-full border px-2 py-1 rounded text-sm"
                                    />
                                    <button @click="confirmEditBig(item)">
                                        <Icon
                                            icon="teenyicons:tick-small-outline"
                                            class="w-5 h-5"
                                        />
                                    </button>
                                    <button @click="cancelEditBig">
                                        <Icon icon="iconoir:cancel" width="18" height="18" />
                                    </button>
                                </template>
                                <template v-else>
                                    <input
                                        type="radio"
                                        :value="item"
                                        v-model="selectedBig"
                                        :disabled="showBigInput"
                                    />
                                    <input
                                        type="text"
                                        :value="item.name"
                                        readonly
                                        class="w-full border border-gray-dark px-2 py-1 rounded text-sm cursor-pointer"
                                    />
                                    <div
                                        class="absolute right-0 top-1 hidden group-hover:flex gap-1"
                                    >
                                        <button @click="startEditBig(item)">
                                            <Icon icon="ei:pencil" class="w-5 h-5" />
                                        </button>
                                        <button @click="deleteItem(item,'big')">
                                            <Icon icon="iconoir:cancel" width="18" height="18" />
                                        </button>
                                    </div>
                                </template>
                            </div>
                        </div>
                        <div v-if="showBigInput" class="flex items-center gap-2 mb-2">
                            <input
                                v-model="newBigName"
                                placeholder="종류를 입력하세요."
                                class="w-full border border-gray-dark px-2 py-1 rounded text-sm"
                            />
                            <button @click="confirmAddBig">
                                <Icon icon="teenyicons:tick-small-outline" class="w-6 h-6" />
                            </button>
                            <button @click="cancelAddBig">
                                <Icon icon="iconoir:cancel" width="20" height="20" />
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 작은 틀 -->
                <div class="w-[300px] border border-gray-dark rounded bg-white flex flex-col">
                    <div class="flex items-center justify-between px-4 pt-4 pb-2">
                        <h3 class="font-bold text-sm">목록</h3>
                        <button
                            class="text-gray-dark text-sm cursor-pointer"
                            @click="showSmallModal = true"
                        >
                            <Icon icon="tdesign:plus" width="24" height="24" />
                        </button>
                    </div>
                    <div class="border-t border-gray-dark mb-2"></div>

                    <div class="overflow-y-auto flex-1 px-4">
                        <div
                            v-for="item in filteredSmallList"
                            :key="item.id"
                            class="group relative mb-2"
                        >
                            <div class="flex items-center gap-2">
                                <input type="radio" :value="item" v-model="selectedSmall" />
                                <input
                                    type="text"
                                    :value="item.name"
                                    readonly
                                    class="w-full border border-gray-dark px-2 py-1 rounded text-sm cursor-pointer"
                                />
                                <div class="absolute right-0 top-1 hidden group-hover:flex gap-1">
                                    <button @click="editItem(item)">
                                        <Icon icon="ei:pencil" class="w-6 h-6" />
                                    </button>
                                    <button @click="deleteItem(item,'small')">
                                        <Icon icon="iconoir:cancel" width="20" height="20" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- 정보 -->
                <div class="w-[650px] border border-gray-dark rounded bg-white flex flex-col">
                    <div class="flex items-center justify-between px-4 pt-4 pb-2">
                        <h3 class="font-bold text-sm">정보</h3>
                    </div>
                    <div class="border-t border-gray-dark mb-2"></div>

                    <div class="flex-1 px-4 overflow-y-auto">
                        <template v-if="selectedSmall">
                            <div class="flex items-center gap-4 mb-4">
                                <div class="flex items-center gap-2">
                                    <label class="font-semibold whitespace-nowrap">계약서명</label>
                                    <input
                                        v-model="selectedSmall.name"
                                        class="border rounded px-2 py-1 text-sm w-[150px]"
                                        readonly
                                    />
                                </div>
                                <div class="flex items-center gap-2">
                                    <label class="font-semibold whitespace-nowrap">생성일자</label>
                                    <input
                                        v-model="selectedSmall.createdAt"
                                        class="border rounded px-2 py-1 text-sm w-[120px]"
                                        readonly
                                    />
                                </div>
                                <div class="flex items-center gap-2">
                                    <label class="font-semibold whitespace-nowrap">사용여부</label>
                                    <input type="checkbox" v-model="selectedSmall.active" />
                                </div>
                            </div>
                            <div>
                                <label class="block font-semibold mb-1">내용</label>
                                <textarea
                                    v-model="selectedSmall.content"
                                    class="w-full border rounded px-2 py-1 text-sm h-24"
                                    readonly
                                ></textarea>
                            </div>
                        </template>
                        <template v-else>
                            <p class="text-gray-400">템플릿을 선택해주세요.</p>
                        </template>
                    </div>
                </div>
            </div>
        </div>
        <div class="editor-tem-box flex flex-col gap-6 my-6">
            <!-- SendEmail 컴포넌트 영역 -->
            <SendEmail
                :name="selectedSmall?.name"
                :email="' '"
                :title="selectedSmall"
                :initialContent="selectedSmall?.content"
            />
        </div>
    </div>

    <SmallTemplateModal
        :selectedBig="selectedBig"
        :show="showSmallModal"
        @submit="handleAddSmall"
        @close="showSmallModal = false"
    />

    <SmallTemplateEditModal
        :show="showEditModal"
        :item="editTarget"
        @submit="handleUpdateSmall"
        @close="showEditModal = false"
    />
</template>
