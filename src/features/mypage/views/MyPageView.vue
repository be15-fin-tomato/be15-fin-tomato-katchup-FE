<script setup>
import { Icon } from '@iconify/vue'
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import ExchangePassword from '@/features/mypage/components/ExchangePassword.vue'
import {
  fetchMyAccount,
  fetchMyInfluencers,
  updateMyAccount,
  updateMyProfileImage,
} from '@/features/mypage/api.js'
import { useToast } from 'vue-toastification'

const router = useRouter()
const toast = useToast()
const showPasswordModal = ref(false)
const editField = ref(null)

const form = reactive({
  loginId: '',
  name: '',
  phone: '',
  email: '',
  birth: '',
  gender: '',
  profileImg: ''
})

const selectedFile = ref(null)

const influencers = ref([])

const getMyAccount = async () => {
  try {
    const res = await fetchMyAccount()
    const data = res.data.data
    form.loginId = data.loginId
    form.name = data.name
    form.phone = data.phone
    form.email = data.email
    form.birth = data.date?.slice(0, 10)
    form.gender = data.gender === 'F' ? '남성' : data.gender === 'M' ? '여성' : ''
    form.profileImg = data.fileRoute || ''
  } catch (err) {
    console.error('계정 정보 조회 실패', err)
  }
}

const getMyInfluencers = async () => {
  try {
    const res = await fetchMyInfluencers()
    influencers.value = res.data.data.userInfluencerList.map(item => ({
      id: item.influencerId,
      name: item.name,
      img: item.imageUrl || '/src/assets/icons/default-profile.svg'
    }))
  } catch (err) {
    console.error('인플루언서 목록 조회 실패', err)
  }
}

const saveEdit = async (field) => {
  try {
    if (field === 'profileImg' && selectedFile.value) {
      await updateMyProfileImage(selectedFile.value)
      toast.success('프로필 이미지가 수정되었습니다.')
    } else {
      const dto = {
        phone: form.phone,
        email: form.email,
        name: form.name,
        birth: form.birth,
        gender: form.gender === '남성' ? 'F' : 'M',
      }
      await updateMyAccount(dto)
      toast.success('계정 정보가 수정되었습니다.')
    }
    editField.value = null
  } catch (err) {
    toast.error('수정에 실패했습니다.')
    console.error(err)
  }
}

const handleImageUpload = (e) => {
  const file = e.target.files[0]
  if (file) {
    selectedFile.value = file
    const reader = new FileReader()
    reader.onload = () => {
      form.profileImg = reader.result
    }
    reader.readAsDataURL(file)
  }
}

const cancelEdit = () => {
  selectedFile.value = null
  editField.value = null
}

const goToInfluencer = (id) => {
  router.push(`/influencer/dashboard/youtube?id=${id}`)
}

onMounted(() => {
  getMyAccount()
  getMyInfluencers()
})
</script>

<template>
  <div class="container">
    <!-- 제목 -->
    <div class="mb-4">
      <h2 class="text-[26px] font-medium mb-2">마이페이지</h2>
      <hr class="border-t-2 border-[#D9D9D9]" />
    </div>

    <div class="flex">
      <!-- 왼쪽 -->
      <div class="w-1/2 pr-12 space-y-6">
        <h3 class="text-md font-medium mb-4">계정 정보</h3>

        <!-- 로그인 정보 -->
        <div class="border border-[#D9D9D9] rounded-[12px] px-6 py-4">
          <h3 class="text-sm font-medium mb-4">로그인 정보</h3>

          <!-- 사원코드 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#BFBFBF]">사원코드</span>
            <span class="text-base font-medium text-black">{{ form.loginId }}</span>
          </div>
          <hr class="border-t border-[#EAEAEA] my-2" />

          <!-- 전화번호 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#BFBFBF]">전화번호</span>
            <div class="flex items-center gap-1">
              <template v-if="editField === 'phone'">
                <input
                  v-model="form.phone"
                  class="border px-2 py-1 text-sm rounded w-[150px]"
                />
                <button
                  class="text-xs text-blue-600"
                  @click="saveEdit('phone')"
                >
                  완료
                </button>
                <button class="text-xs text-gray-500" @click="cancelEdit()">
                  취소
                </button>
              </template>
              <template v-else>
                                    <span class="text-base font-medium text-black">{{
                                        form.phone
                                      }}</span>
                <button class="text-[#828282] cursor-pointer" @click="editField = 'phone'">
                  <Icon icon="ei:pencil" clase="w-4 h-4 cursor " />
                </button>
              </template>
            </div>
          </div>
          <hr class="border-t border-[#EAEAEA] my-2" />

          <!-- 메일 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#BFBFBF]">메일</span>
            <div class="flex items-center gap-1">
              <template v-if="editField === 'email'">
                <input
                  v-model="form.email"
                  class="border px-2 py-1 text-sm rounded w-[180px]"
                />
                <button
                  class="text-xs text-blue-600 "
                  @click="saveEdit('email')"
                >
                  완료
                </button>
                <button class="text-xs text-gray-500" @click="cancelEdit()">
                  취소
                </button>
              </template>
              <template v-else>
                                    <span class="text-base font-medium text-black">{{
                                        form.email
                                      }}</span>
                <button class="text-[#828282] cursor-pointer" @click="editField = 'email'">
                  <Icon icon="ei:pencil" clase="w-4 h-4" />
                </button>
              </template>
            </div>
          </div>
        </div>

        <!-- 프로필 정보 -->
        <div class="border border-[#D9D9D9] rounded-[12px] px-6 py-4">
          <h3 class="text-sm font-medium mb-4">프로필 정보</h3>

          <!-- 프로필 사진 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#BFBFBF]">프로필 사진</span>

            <div class="flex items-center gap-2">
              <!-- 이미지 -->
              <div class="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                <img
                  :src="form.profileImg || '/src/assets/icons/default-profile.svg'"
                  alt="profile"
                  class="w-full h-full object-cover"
                />
              </div>

              <!-- 연필 or 파일 업로드 -->
              <div>
                <template v-if="editField === 'profileImg'">
                  <label class="text-xs text-blue-600 cursor-pointer hover:underline">
                    사진 선택
                    <input
                      type="file"
                      accept="image/*"
                      class="hidden"
                      @change="handleImageUpload"
                    />
                  </label>
                  <div class="flex gap-2 text-xs mt-1">
                    <button class="text-blue-600" @click="saveEdit('profileImg')">완료</button>
                    <button class="text-gray-500" @click="cancelEdit()">취소</button>
                  </div>
                </template>

                <template v-else>
                  <button @click="editField = 'profileImg'" class="text-[#828282] cursor-pointer">
                    <Icon icon="ei:pencil" clase="w-4 h-4" />
                  </button>
                </template>
              </div>
            </div>
          </div>

          <hr class="border-t border-[#EAEAEA] my-2" />

          <!-- 이름 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#BFBFBF]">이름</span>
            <div class="flex items-center gap-1">
              <template v-if="editField === 'name'">
                <input
                  v-model="form.name"
                  class="border px-2 py-1 text-sm rounded w-[150px]"
                />
                <button class="text-xs text-blue-600" @click="saveEdit('name')">
                  완료
                </button>
                <button class="text-xs text-gray-500" @click="cancelEdit()">
                  취소
                </button>
              </template>
              <template v-else>
                                    <span class="text-base font-medium text-black">{{
                                        form.name
                                      }}</span>
                <button class="text-[#828282] cursor-pointer" @click="editField = 'name'">
                  <Icon icon="ei:pencil" clase="w-4 h-4" />
                </button>
              </template>
            </div>
          </div>
          <hr class="border-t border-[#EAEAEA] my-2" />

          <!-- 생년월일 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#BFBFBF]">생년월일</span>
            <div class="flex items-center gap-1">
              <template v-if="editField === 'birth'">
                <input
                  type="date"
                  v-model="form.birth"
                  class="border px-2 py-1 text-sm rounded w-[130px]"
                />
                <button
                  class="text-xs text-blue-600"
                  @click="saveEdit('birth')"
                >
                  완료
                </button>
                <button class="text-xs text-gray-500" @click="cancelEdit()">
                  취소
                </button>
              </template>
              <template v-else>
                                    <span class="text-base font-medium text-black">{{
                                        form.birth
                                      }}</span>
                <button class="text-[#828282] cursor-pointer" @click="editField = 'birth'">
                  <Icon icon="ei:pencil" clase="w-4 h-4" />
                </button>
              </template>
            </div>
          </div>
          <hr class="border-t border-[#EAEAEA] my-2" />

          <!-- 성별 -->
          <div class="flex items-center justify-between">
            <span class="text-sm text-[#BFBFBF]">성별</span>
            <div class="flex items-center gap-1">
              <template v-if="editField === 'gender'">
                <select
                  v-model="form.gender"
                  class="border px-2 py-1 text-sm rounded"
                >
                  <option value="남성">남성</option>
                  <option value="여성">여성</option>
                </select>
                <button
                  class="text-xs text-blue-600"
                  @click="saveEdit('gender')"
                >
                  완료
                </button>
                <button class="text-xs text-gray-500" @click="cancelEdit()">
                  취소
                </button>
              </template>
              <template v-else>
                                    <span class="text-base font-medium text-black">{{
                                        form.gender
                                      }}</span>
                <button class="text-[#828282] cursor-pointer" @click="editField = 'gender'">
                  <Icon icon="ei:pencil" clase="w-4 h-4" />
                </button>
              </template>
            </div>
          </div>
        </div>
        <button
          class="btn-create"
          @click="showPasswordModal = true"
        >
          비밀번호 변경
        </button>
      </div>

      <!-- 세로선 -->
      <div class="h-auto border-l-2 border-[#D9D9D9]"></div>

      <!-- 오른쪽 인플루언서 목록 -->
      <div class="w-1/2 pl-12">
        <h3 class="text-md font-medium mb-4">내 인플루언서 목록</h3>
        <div class="grid grid-cols-3 gap-6 max-h-[400px] overflow-y-auto pr-2">
          <div
            v-for="influencer in influencers"
            :key="influencer.id"
            @click="goToInfluencer(influencer.id)"
            class="rounded border border-[#EAEAEA] shadow-md p-4 text-center cursor-pointer hover:bg-gray-50 transition"
          >
            <img
              :src="influencer.img"
              alt="profile"
              class="w-16 h-16 mx-auto rounded-full object-cover mb-2"
            />
            <p class="text-sm font-medium leading-tight">{{ influencer.name }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
  <ExchangePassword v-if="showPasswordModal" @close="showPasswordModal = false" />
</template>
