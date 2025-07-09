<script setup>
import { reactive, ref, watch, nextTick, toRaw } from 'vue';
import { Icon } from '@iconify/vue';

const props = defineProps({
  isEditing: { type: Boolean, default: false },
  initialData: { type: Object, default: () => ({}) },
  users: { type: Array, default: () => [] }
});

// const emit = defineEmits(['save', 'cancel']);

// 고객사 form
const form = reactive({
  name: '',
  revenue: '',
  employeeCount: '',
  businessNumber: '',
  note: '',
  status: 'null',
  phone: '',
  fax: '',
  user: [],
  address1: '',
  address2: '',
});

// 사원 등록용 상태
const employeeList = ref([]);
const isAddingEmployee = ref(false);
const editIndex = ref(-1);
const newEmployee = reactive({
  name: '',
  position: '재직',
  client: '',
  department: '',
  title: '',
  phone: '',
  mobile: '',
  email: '',
  note: ''
});

const companyStatusMap = {
  '잠재': 1,
  '기존': 2,
  '신규': 3,
};

const employeeStatusMap = {
  '재직': 1,
  '휴직': 2,
  '퇴직': 3,
};

// 초기 데이터 반영
watch(() => props.initialData, (data) => {
  if (data) {
    console.log('📦 초기 데이터:', data);
    console.log('📦 data.userIds:', data.userIds);
    console.log('📦 props.users:', props.users);

    form.name = data.clientCompanyName || '';
    form.status = Object.entries(companyStatusMap).find(([, v]) => v === data.clientCompanyStatusId)?.[0] || '';    form.revenue = data.sales?.toString() || '';
    form.employeeCount = data.numberOfEmployees?.toString() || '';
    form.businessNumber = data.businessId || '';
    form.note = data.notes || '';
    form.phone = data.telephone || '';
    form.fax = data.fax || '';
    form.user = (data.userIds || []).map((id) => {
      const matched = props.users.find((u) => u.userId === id);
      return {
        id,
        name: matched?.userName || `ID ${id}`,
      };
    });
    form.address1 = data.address || '';
    form.address2 = data.detailAddress || '';
    employeeList.value = (data.clientManagers || []).map((e) => ({
      ...e,
      status: Object.entries(employeeStatusMap).find(([, id]) => id === e.clientManagerStatusId)?.[0] || '재직',
      title: e.position || '',
    }));
  }
}, { immediate: true });



const getFormData = () => ({
  clientCompanyName: form.name,
  clientCompanyStatusId: companyStatusMap[form.status],
  businessId: form.businessNumber ? Number(form.businessNumber) : null,
  sales: form.revenue ? Number(form.revenue) : null,
  numberOfEmployees: form.employeeCount ? Number(form.employeeCount) : null,
  telephone: form.phone || null,
  fax: form.fax || null,
  address: form.address1 || null,
  detailAddress: form.address2 || null,
  notes: form.note || null,
  userIds: Array.isArray(form.user) ? form.user.map(u => u.id) : [],
  clientManagers: Array.isArray(employeeList.value)
    ? toRaw(employeeList.value).map(e => ({
      name: e.name,
      clientManagerStatusId: employeeStatusMap[e.status],
      department: e.department || null,
      position: e.title || null,
      phone: e.mobile || null,
      telephone: e.phone || null,
      email: e.email?.trim() || '',
      notes: e.note || null,
    }))
    : [],
});
defineExpose({ getFormData });

watch(() => form.name, (newVal) => {
  newEmployee.client = newVal;
});

// 유저 검색
const openUserSearch = () => {
  const selectedIds = form.user.map((u) => u.id).join(',');
  window.handleUserSelect = (selectedItems) => {
    form.user.splice(0, form.user.length, ...selectedItems);
  };

  window.open(
    `/search-popup?type=user&selected=${selectedIds}`,
    'SearchPopup',
    'width=500,height=600'
  );
};

// 주소 검색
const openPostcodeSearch = () => {
  new daum.Postcode({
    oncomplete: function (data) {
      const selectedAddress = data.roadAddress || data.jibunAddress;
      form.address1 = selectedAddress;
      nextTick(() => document.getElementById('detailAddress')?.focus());
    },
  }).open({
    left: window.screen.width / 2 - 250,
    top: window.screen.height / 2 - 300,
  });
};

// 사원 추가/수정
const addEmployee = () => {
  if (!newEmployee.name.trim()) {
    alert('이름은 필수입니다.');
    return;
  }
  if (!newEmployee.mobile.trim()) {
    alert('휴대폰번호는 필수입니다.');
    return;
  }
  if (!newEmployee.email.trim()) {
    alert('이메일은 필수입니다.');
    return;
  }

  newEmployee.client = form.name;

  const employeeData = { ...newEmployee };

  if (editIndex.value === -1) {
    employeeList.value.push(employeeData);
  } else {
    employeeList.value[editIndex.value] = employeeData;
  }

  // 초기화
  Object.keys(newEmployee).forEach((key) => {
    if (key !== 'client') newEmployee[key] = '';
  });
  newEmployee.status = '재직';
  editIndex.value = -1;
  isAddingEmployee.value = false;
};

const deleteEmployee = (index) => {
  employeeList.value.splice(index, 1);
};

const editEmployee = (index) => {
  Object.assign(newEmployee, employeeList.value[index]);
  editIndex.value = index;
  isAddingEmployee.value = true;
};

watch(isAddingEmployee, (val) => {
  if (val && editIndex.value === -1) {
    newEmployee.client = form.name; // 새 사원 추가시 강제로 넣어줌
  }
});
</script>
<template>
  <!-- 상단 고객사 등록 영역 -->
  <div class="w-full flex justify-center px-4">
    <div class="container bg-white w-full">
      <!-- 제목 및 버튼 -->


      <div class="grid grid-cols-2 gap-10">
        <div class="flex flex-col gap-2.5">
          <!-- 왼쪽 필드 -->
          <label class="input-form-label">
            고객사명 <span class="text-red-500 ml-1">*</span>
          </label>
          <input class="input-form-box" v-model="form.name" :disabled="!isEditing" />
          <label class="input-form-label">매출</label>
          <input class="input-form-box" v-model="form.revenue" :disabled="!isEditing" />
          <label class="input-form-label">사원 수</label>
          <input class="input-form-box" v-model="form.employeeCount" :disabled="!isEditing" />
          <label class="input-form-label">사업자 번호</label>
          <input class="input-form-box" v-model="form.businessNumber" :disabled="!isEditing" />
          <label class="input-form-label">비고</label>
          <textarea
            class="input-form-box resize-y min-h-[80px]"
            v-model="form.note"
            :disabled="!isEditing"
            rows="3"
          />
        </div>

        <div class="flex flex-col gap-2.5">
          <!-- 오른쪽 필드 -->
          <label class="input-form-label">
            고객사 상태 <span class="text-red-500 ml-1">*</span>
          </label>
          <select class="input-form-box" v-model="form.status" :disabled="!isEditing">
            <option disabled value="">-- 상태를 선택하세요 --</option>
            <option value="잠재">잠재</option>
            <option value="기존">기존</option>
            <option value="신규">신규</option>
          </select>
          <label class="input-form-label">유선번호</label>
          <input class="input-form-box" v-model="form.phone" :disabled="!isEditing" />
          <label class="input-form-label">팩스번호</label>
          <input class="input-form-box" v-model="form.fax" :disabled="!isEditing" />
          <label class="input-form-label">
            담당자 <span class="text-red-500 ml-1">*</span>
          </label>
          <div class="flex gap-2">
            <input type="text" :value="form.user.map((u) => u.name).join(', ')" readonly class="input-form-box flex-1" />
            <button class="border bg-gray-300 rounded px-3 py-1 text-sm shadow" @click="openUserSearch" v-if="isEditing">검색</button>
          </div>
          <label class="input-form-label">주소</label>
          <div class="flex gap-2">
            <input type="text" v-model="form.address1" readonly class="input-form-box flex-1 bg-gray-100" />
            <button class="border bg-gray-300 rounded px-3 py-1 text-sm shadow" @click="openPostcodeSearch" v-if="isEditing">검색</button>
          </div>
          <input class="input-form-box" v-model="form.address2" :disabled="!isEditing" id="detailAddress" />
        </div>
      </div>
    </div>
  </div>

  <!-- 사원 정보 리스트 영역 -->
  <div class="w-full flex justify-center px-4">
    <div class="container bg-white mt-12 w-full">
      <div class="flex justify-between items-center mb-4">
        <p class="font-bold">사원 정보 ({{ employeeList.length }})</p>
        <button class="btn-create !py-1 !px-4 text-sm" @click="isAddingEmployee = true">추가</button>
      </div>

      <div class="grid grid-cols-2 gap-4" v-if="employeeList.length > 0">
        <div v-for="(employee, index) in employeeList" :key="index" class="border rounded-lg p-4 flex items-center justify-between shadow-sm">
          <div>
            <!-- 사원 목록에서 이름 옆 -->
            <p class="font-semibold">
              {{ employee.name }}
              <span
                class="text-xs font-semibold ml-2 px-2 py-0.5 rounded"
                :class="{
        'bg-[#A2D9FF] text-white': employee.status === '재직',
        'bg-[#FFD000] text-white': employee.status === '휴직',
        'bg-[#FF6D6D] text-white': employee.status === '퇴직',
      }"
              >
      {{ employee.status }}
    </span>
            </p>
            <p class="text-sm text-gray-500">
              {{ employee.position }} <!-- 차장, 대리 같은 직책 -->
              <template v-if="employee.mobile || employee.email"> | </template>
              {{ employee.mobile }}
              <template v-if="employee.mobile && employee.email"> / </template>
              {{ employee.email }}
            </p>
          </div>
          <div class="flex gap-2">
            <button class="btn-icon">
              <Icon icon="material-symbols:mail-outline" width="20" height="20" />
              MAIL
            </button>
            <button class="btn-icon" @click="editEmployee(index)">
              <Icon icon="lucide:edit" width="20" height="20" />
              수정
            </button>
            <button class="btn-icon" @click="deleteEmployee(index)">
              <Icon icon="gg:trash" width="20" height="20" />
              삭제
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- 사원 추가 폼 -->
  <div class="w-full flex justify-center px-4">
    <div class="container bg-white mt-8" v-if="isAddingEmployee">
      <p class="font-bold mb-2">
        {{ editIndex === -1 ? '사원 추가' : '사원 수정' }}
      </p>
      <div class="blue-line mb-4" />
      <div class="grid grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <label class="input-form-label">
            이름<span class="text-red-500 ml-1">*</span>
          </label>
          <input v-model="newEmployee.name" class="input-form-box" />
          <label class="input-form-label">상태</label>
          <select v-model="newEmployee.status" class="input-form-box">
            <option value="재직">재직</option>
            <option value="휴직">휴직</option>
            <option value="퇴직">퇴직</option>
          </select>
          <label class="input-form-label">부서</label>
          <input v-model="newEmployee.department" class="input-form-box" />
          <label class="input-form-label">유선번호</label>
          <input v-model="newEmployee.phone" class="input-form-box" />
          <label class="input-form-label">비고</label>
          <textarea v-model="newEmployee.note" class="input-form-box" rows="3" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="input-form-label">고객사</label>
          <input v-model="newEmployee.client" class="input-form-box bg-gray-100" readonly />

          <label class="input-form-label">직책</label>
          <input v-model="newEmployee.title" class="input-form-box" />

          <label class="input-form-label">
            휴대폰번호<span class="text-red-500 ml-1">*</span>
          </label>
          <input v-model="newEmployee.mobile" class="input-form-box" />

          <label class="input-form-label">
            이메일<span class="text-red-500 ml-1">*</span>
          </label>
          <input v-model="newEmployee.email" class="input-form-box" />
        </div>
      </div>
      <div class="flex justify-end gap-2 mt-4">
        <button class="btn-delete !px-5" @click="isAddingEmployee = false">취소</button>
        <button class="btn-create !px-5" @click="addEmployee">
          {{ editIndex === -1 ? '등록' : '수정 완료' }}
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>
