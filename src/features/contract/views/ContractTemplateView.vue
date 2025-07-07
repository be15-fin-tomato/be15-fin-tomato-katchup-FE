<script setup>
import { ref, computed, onMounted } from 'vue';
import { Icon } from '@iconify/vue';
import SmallTemplateModal from '@/features/contract/components/SmallTemplateModal.vue';
import SmallTemplateEditModal from '@/features/contract/components/SmallTemplateEditModal.vue';
import SendEmail from '@/features/contract/components/SendEmail.vue';
import { fetchContractObjects, createContractObject,
  updateContractObject, deleteContractObject
} from '@/features/contract/api';


const bigList = ref([]);

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

const selectedBig = ref(null);
const selectedSmall = ref(null);
const showBigInput = ref(false);
const newBigName = ref('');
const showSmallModal = ref(false);
const showEditModal = ref(false);
const editTarget = ref(null);

const editingBigId = ref(null);
const editBigName = ref('');

async function fetchBigList() {
  try {
    const data = await fetchContractObjects();
    bigList.value = data.map(item => ({
      id: item.objectId,
      name: item.title
    }));

    if (bigList.value.length > 0) {
      selectedBig.value = bigList.value[0];
    }
  } catch (error) {
    console.error("큰 목록을 가져오는 데 실패했습니다:", error);
    bigList.value = [
      { id: 1, name: '계약서 (API 로드 실패)' },
      { id: 2, name: '이메일 (API 로드 실패)' },
    ];
    if (bigList.value.length > 0) {
      selectedBig.value = bigList.value[0];
    }
  }
}

onMounted(() => {
  fetchBigList();
});

function startEditBig(item) {
  editingBigId.value = item.id;
  editBigName.value = item.name;
}

// 목적 수정 API 호출 로직을 포함하도록 수정
async function confirmEditBig(item) {
  const newName = editBigName.value.trim();
  if (!newName) {
    alert('이름을 입력해주세요.');
    return;
  }
  if (bigList.value.some((b) => b.name === newName && b.id !== item.id)) {
    alert('이미 존재하는 이름입니다.');
    return;
  }

  try {
    const response = await updateContractObject(item.id, newName);
    if (response.success) {
      await fetchBigList(); // API 호출 성공 시 bigList를 새로고침하여 최신 데이터를 가져옵니다.
      editingBigId.value = null;
      editBigName.value = '';
    } else {
      alert(`목적 수정 실패: ${response.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    alert('목적 수정 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    console.error('목적 수정 API 호출 중 에러:', error);
  }
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
  selectedBig.value ? smallList.value.filter((s) => s.parentId === selectedBig.value.id) : []
);

function editItem(item) {
  editTarget.value = { ...item };
  showEditModal.value = true;
}

// 목적 삭제 API 호출 로직을 포함하도록 수정
async function deleteItem(item, type) {
  if (type === 'big') {
    if (!confirm(`정말로 "${item.name}" 종류를 삭제하시겠습니까? 이 종류에 속한 모든 하위 템플릿도 삭제됩니다.`)) {
      return;
    }

    try {
      const response = await deleteContractObject(item.id);
      if (response.success) {
        await fetchBigList(); // API 호출 성공 시 bigList를 새로고침하여 최신 데이터를 가져옵니다.
        // 삭제된 big 항목이 현재 선택된 항목이었다면, 선택을 해제하거나 다른 항목을 선택
        if (selectedBig.value?.id === item.id) {
          selectedBig.value = bigList.value[0] || null;
        }
        // 해당 종류에 속한 small 항목들도 모두 삭제합니다. (프론트엔드에서만)
        smallList.value = smallList.value.filter(s => s.parentId !== item.id);
        // 선택된 small 항목이 삭제된 big 항목에 속했다면 선택 해제
        if (selectedSmall.value && selectedSmall.value.parentId === item.id) {
          selectedSmall.value = null;
        }
      } else {
        alert(`목적 삭제 실패: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      alert('목적 삭제 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
      console.error('목적 삭제 API 호출 중 에러:', error);
    }

  } else if (type === 'small') {
    if (!confirm(`정말로 "${item.name}" 템플릿을 삭제하시겠습니까?`)) {
      return;
    }
    // Small 템플릿 삭제는 현재 백엔드 API가 없으므로 프론트엔드에서만 처리합니다.
    const smallIndex = smallList.value.findIndex((s) => s.id === item.id);
    if (smallIndex !== -1) {
      smallList.value.splice(smallIndex, 1);
      if (selectedSmall.value?.id === item.id) {
        selectedSmall.value = null;
      }
    }
  }
}

async function confirmAddBig() {
  const name = newBigName.value.trim();
  if (!name) {
    alert('이름을 입력해주세요.');
    return;
  }
  if (bigList.value.some((item) => item.name === name)) {
    alert('이미 존재하는 이름입니다.');
    return;
  }

  try {
    const response = await createContractObject(name);
    if (response.success) {
      await fetchBigList();
      newBigName.value = '';
      showBigInput.value = false;
    } else {
      alert(`목적 생성 실패: ${response.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    alert('목적 생성 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    console.error('목적 생성 API 호출 중 에러:', error);
  }
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

    <div class="tem-box w-full max-w-full">
      <div class="flex gap-6 min-w-0">
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
