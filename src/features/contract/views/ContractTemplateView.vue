<template>
  <div class="container" v-bind="$attrs">
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
              <template v-if="editingBigId === item.id">
                <div class="flex items-center gap-2">
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
                </div>
              </template>
              <template v-else>
                <label
                  class="flex items-center gap-2 w-full cursor-pointer py-1 relative z-10 transition-colors duration-200 rounded overflow-hidden"
                >
                  <input
                    type="radio"
                    :value="item"
                    v-model="selectedBig"
                    :disabled="showBigInput"
                    class="appearance-none hidden"
                  />
                  <div class="flex items-center w-full relative">
                    <input
                      type="text"
                      :value="item.name"
                      readonly
                      class="w-full border border-gray-dark px-2 py-1 rounded text-sm cursor-pointer bg-transparent pointer-events-none"
                    />
                    <Icon
                      v-if="selectedBig?.id === item.id"
                      icon="mdi:check-outline"
                      width="20"
                      height="20"
                      style="color: #2e2193"
                      class="absolute right-1 top-1/2 -translate-y-1/2"
                    />
                  </div>
                </label>
                <div
                  class="absolute right-0 top-1 hidden group-hover:flex gap-1"
                  :style="selectedBig?.id === item.id ? 'right: 28px;' : ''"
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
            <h3 class="font-bold text-sm">템플릿</h3>
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
              <label
                class="flex items-center gap-2 w-full cursor-pointer py-1 relative z-10 transition-colors duration-200 rounded overflow-hidden"
              >
                <input
                  type="radio"
                  :value="item"
                  :checked="selectedSmall?.id === item.id"
                  @change="selectSmallItem(item)"
                  class="appearance-none hidden"
                />
                <div class="flex items-center w-full relative">
                  <input
                    type="text"
                    :value="item.name"
                    readonly
                    class="w-full border border-gray-dark px-2 py-1 rounded text-sm cursor-pointer bg-transparent pointer-events-none"
                  />
                  <Icon
                    v-if="selectedSmall?.id === item.id"
                    icon="mdi:check-outline"
                    width="20"
                    height="20"
                    style="color: #2e2193"
                    class="absolute right-1 top-1/2 -translate-y-1/2"
                  />
                </div>
              </label>
              <div
                class="absolute right-0 top-1 hidden group-hover:flex gap-1"
                :style="selectedSmall?.id === item.id ? 'right: 28px;' : ''"
              >
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
              </div>
              <div>
                <label class="block font-semibold mb-1">내용</label>
                <textarea
                  v-model="selectedSmall.content"
                  class="w-full border rounded px-2 py-1 text-sm h-24"
                  readonly
                ></textarea>
              </div>
              <div v-if="selectedSmall.file" class="mt-4">
                <label class="block font-semibold mb-1">첨부 파일</label>
                <div class="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded px-3 py-2 text-sm">
                  <Icon icon="codex:file" class="text-blue-500 w-4 h-4" />
                  <span class="text-gray-700">
                    {{ selectedSmall.file.originalName }}
                  </span>
                  <span class="text-gray-500 text-xs">({{ selectedSmall.file.program }})</span>
                </div>
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
        :title="selectedSmall"
        :initialContent="selectedSmall?.content"
        :initialFile="selectedSmall?.file"
        :name="initialRecipientName"
        :email="initialRecipientEmail"
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

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { Icon } from '@iconify/vue';
import SmallTemplateModal from '@/features/contract/components/SmallTemplateModal.vue';
import SmallTemplateEditModal from '@/features/contract/components/SmallTemplateEditModal.vue';
import SendEmail from '@/features/contract/components/SendEmail.vue';
import { useRoute } from 'vue-router';
import { fetchContractObjects, createContractObject,
  updateContractObject, deleteContractObject, fetchContractDetails,
  createContractDetail, updateContractDetail, deleteContractDetail
} from '@/features/contract/api.js';
import { useToast } from 'vue-toastification';

const route = useRoute();
const toast = useToast();

const bigList = ref([]);
const smallList = ref([]);
const selectedBig = ref(null);
const selectedSmall = ref(null);
const showBigInput = ref(false);
const newBigName = ref('');
const showSmallModal = ref(false);
const showEditModal = ref(false);
const editTarget = ref(null);

const editingBigId = ref(null);
const editBigName = ref('');

const initialRecipientEmail = ref('');
const initialRecipientName = ref('');

async function fetchBigList() {
  try {
    const data = await fetchContractObjects();
    bigList.value = data.map(item => ({
      id: item.objectId,
      name: item.title
    }));

    if (bigList.value.length > 0) {
      const initialObjectId = route.query.objectId;
      if (initialObjectId) {
        const found = bigList.value.find(item => item.id == initialObjectId);
        if (found) {
          selectedBig.value = found;
        } else {
          selectedBig.value = bigList.value [0];
        }
      } else {
        selectedBig.value = bigList.value [0];
      }
    }
  } catch (error) {
    console.error("큰 목록을 가져오는 데 실패했습니다:", error);
    toast.error('템플릿 종류 목록을 가져오는 데 실패했습니다.');
    bigList.value = [
      { id: 1, name: '계약서' },
      { id: 2, name: '이메일' },
    ];
    if (bigList.value.length > 0) {
      selectedBig.value = bigList.value [0];
    }
  }
}

async function fetchSmallListAndDetails(objectId, detailId = null) {
  if (!objectId) {
    smallList.value = [];
    selectedSmall.value = null;
    return;
  }
  try {
    const data = await fetchContractDetails(objectId, detailId);
    smallList.value = (data.details || []).map(item => ({
      id: item.detailId,
      name: item.subTitle,
      parentId: objectId,
      content: '',
      createdAt: item.createdAt,
      parentName: data.object?.title || selectedBig.value?.name
    }));

    if (data.selectedDetail) {
      selectedSmall.value = {
        id: data.selectedDetail.detailId,
        name: data.selectedDetail.subTitle,
        parentId: objectId,
        content: data.selectedDetail.content,
        createdAt: data.selectedDetail.createdAt,
        updatedAt: data.selectedDetail.updatedAt,
        parentName: data.object?.title || selectedBig.value?.name,
        file: data.selectedDetail.file
      };
    } else {
      selectedSmall.value = null;
    }
  } catch (error) {
    console.error(`작은 목록 및 상세 정보 (ObjectID: ${objectId}) 가져오기 실패:`, error);
    toast.error('템플릿 목록 및 상세 정보를 가져오는 데 실패했습니다.');
    smallList.value = [];
    selectedSmall.value = null;
  }
}

onMounted(() => {
  fetchBigList();
  if (route.query.recipientEmail) {
    initialRecipientEmail.value = route.query.recipientEmail;
  }
  if (route.query.recipientName) {
    initialRecipientName.value = route.query.recipientName;
  }
});

watch(selectedBig, (newVal) => {
  if (newVal) {
    const initialDetailId = route.query.detailId;
    if (newVal.id == route.query.objectId && initialDetailId) {
      fetchSmallListAndDetails(newVal.id, initialDetailId);
    } else {
      fetchSmallListAndDetails(newVal.id);
    }
  } else {
    smallList.value = [];
    selectedSmall.value = null;
  }
}, { immediate: true });

const selectSmallItem = (item) => {
  selectedSmall.value = item;
  fetchSmallListAndDetails(selectedBig.value.id, item.id);
};

function startEditBig(item) {
  editingBigId.value = item.id;
  editBigName.value = item.name;
}

async function confirmEditBig(item) {
  const newName = editBigName.value.trim();
  if (!newName) {
    toast.warning('이름을 입력해주세요.');
    return;
  }
  if (bigList.value.some((b) => b.name === newName && b.id !== item.id)) {
    toast.warning('이미 존재하는 이름입니다.');
    return;
  }

  try {
    const response = await updateContractObject(item.id, newName);
    if (response.success) {
      toast.success('템플릿 종류가 성공적으로 수정되었습니다.');
      await fetchBigList();
      editingBigId.value = null;
      editBigName.value = '';
    } else {
      toast.error(`템플릿 종류 수정 실패: ${response.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    toast.error('템플릿 종류 수정 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    console.error('목적 수정 API 호출 중 에러:', error);
  }
}

function cancelEditBig() {
  editingBigId.value = null;
  editBigName.value = '';
}

async function handleAddSmall(newItem) {
  if (!selectedBig.value) {
    toast.warning('먼저 큰 종류를 선택해주세요.');
    return;
  }

  const requestData = {
    objectId: selectedBig.value.id,
    subTitle: newItem.name,
    content: newItem.content,
  };
  const fileToUpload = newItem.file || null;

  try {
    const response = await createContractDetail(requestData, fileToUpload);
    if (response.success) {
      toast.success('템플릿이 성공적으로 생성되었습니다.');
      await fetchSmallListAndDetails(selectedBig.value.id);
      showSmallModal.value = false;
    }
  } catch (error) {
    if (error.response && error.response.data) {
      if (error.response.data.code === '30010' ||
        (error.response.data.message && error.response.data.message.includes('파일 용량'))) {
        toast.error('용량 초과입니다.');
      } else if (error.response.status === 401) { // error.response.status 사용
        toast.error('인증 실패: 로그인 정보가 유효하지 않습니다.');
      } else {
        toast.error(`템플릿 생성 중 오류가 발생했습니다: ${error.response.data.message || '알 수 없는 오류'}`);
      }
    } else {
      toast.error('템플릿 생성 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    }
    console.error('계약서 상세 템플릿 생성 API 호출 중 에러:', error);
  }
}

async function handleUpdateSmall(updatedData) {
  const { detailId, requestData, file } = updatedData;

  try {
    const response = await updateContractDetail(detailId, requestData, file);
    if (response.success) {
      toast.success('템플릿이 성공적으로 수정되었습니다.');
      await fetchSmallListAndDetails(selectedBig.value.id, detailId);
      showEditModal.value = false;
    }
    // 이전의 'else' 블록을 제거했습니다. 이제 모든 에러는 catch 블록에서 처리됩니다.
  } catch (error) {
    if (error.response && error.response.data) {
      // 백엔드에서 ContractErrorCode.FILE_TOO_BIG의 code "30010"을 반환한다고 가정
      // 또는 message에 '파일 용량'이 포함된 경우
      if (error.response.data.code === '30010' ||
        (error.response.data.message && error.response.data.message.includes('파일 용량'))) {
        toast.error('용량 초과입니다.');
      } else if (error.response.status === 401) { // error.response.status 사용
        toast.error('인증 실패: 로그인 정보가 유효하지 않습니다.');
      }
      else {
        toast.error(`템플릿 수정 중 오류가 발생했습니다: ${error.response.data.message || '알 수 없는 오류'}`);
      }
    } else {
      toast.error('템플릿 수정 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    }
    console.error('계약서 상세 템플릿 수정 API 호출 중 에러:', error);
  }
}

const filteredSmallList = computed(() => smallList.value);

function editItem(item) {
  editTarget.value = { ...item };
  showEditModal.value = true;
}

async function deleteItem(item, type) {
  if (type === 'big') {

    if (!confirm(`정말로 "${item.name}" 종류를 삭제하시겠습니까? 이 종류에 속한 모든 하위 템플릿도 삭제됩니다.`)) {
      return;
    }

    try {
      const response = await deleteContractObject(item.id);
      if (response.success) {
        toast.success('템플릿 종류가 성공적으로 삭제되었습니다.');
        await fetchBigList();
        if (selectedBig.value?.id === item.id) {
          selectedBig.value = bigList.value [0] || null;
        }
        smallList.value = smallList.value.filter(s => s.parentId !== item.id);
        if (selectedSmall.value && selectedSmall.value.parentId === item.id) {
          selectedSmall.value = null;
        }
      } else {
        toast.error(`템플릿 종류 삭제 실패: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      toast.error('템플릿 종류 삭제 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
      console.error('목적 삭제 API 호출 중 에러:', error);
    }

  } else if (type === 'small') {
    if (!confirm(`정말로 "${item.name}" 템플릿을 삭제하시겠습니까?`)) {
      return;
    }
    try {
      const response = await deleteContractDetail(item.id);
      if (response.success) {
        toast.success('템플릿이 성공적으로 삭제되었습니다.');
        await fetchSmallListAndDetails(selectedBig.value.id);
      } else {
        toast.error(`템플릿 삭제 실패: ${response.message || '알 수 없는 오류'}`);
      }
    } catch (error) {
      toast.error('템플릿 삭제 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
      console.error('계약서 상세 템플릿 삭제 API 호출 중 에러:', error);
    }
  }
}

async function confirmAddBig() {
  const name = newBigName.value.trim();
  if (!name) {
    toast.warning('이름을 입력해주세요.');
    return;
  }
  if (bigList.value.some((item) => item.name === name)) {
    toast.warning('이미 존재하는 이름입니다.');
    return;
  }

  try {
    const response = await createContractObject(name);
    if (response.success) {
      toast.success('템플릿 종류가 성공적으로 생성되었습니다.');
      await fetchBigList();
      newBigName.value = '';
      showBigInput.value = false;
    } else {
      toast.error(`템플릿 종류 생성 실패: ${response.message || '알 수 없는 오류'}`);
    }
  } catch (error) {
    toast.error('템플릿 종류 생성 중 오류가 발생했습니다. 네트워크 상태를 확인해주세요.');
    console.error('종류 생성 API 호출 중 에러:', error);
  }
}

function cancelAddBig() {
  newBigName.value = '';
  showBigInput.value = false;
}
</script>

<style scoped>

</style>
