<script setup>
import { ref, computed, onMounted } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'
import { Icon } from '@iconify/vue'
import ScheduleModal from '../components/ScheduleModal.vue'
import { useToast } from 'vue-toastification';

import {
  getScheduleList,
  getScheduleDetail,
  postSchedule,
  updateSchedule,
  deleteSchedule,
  getPipelineSchedule
} from '@/features/calendar/api.js'

function formatDateToLocalYYYYMMDD(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toast = useToast();
const todayDate = new Date()
const selectedDate = ref(formatDateToLocalYYYYMMDD(todayDate))
const selectedEvent = ref(null)
const isModalOpen = ref(false)

const events = ref([])

const fetchEvents = async () => {
  try {
    const res = await getScheduleList()
    events.value = res.data.data.scheduleListsAll || []
  } catch (err) {
    toast.error('일정 불러오기에 실패했습니다.')
    console.error(err)
  }
}

onMounted(() => {
  fetchEvents()
})


const calendarRef = ref(null)

const calendarOptions = {
  plugins: [dayGridPlugin, interactionPlugin],
  locale: koLocale,
  initialView: 'dayGridMonth',
  selectable: true,

  dateClick(info) {
    selectedDate.value = formatDateToLocalYYYYMMDD(info.date)
  },

  eventClick(info) {
    selectedDate.value = formatDateToLocalYYYYMMDD(info.event.start)
  },

  viewDidMount(arg) {
    const todayStr = formatDateToLocalYYYYMMDD(new Date())
    const viewStr = formatDateToLocalYYYYMMDD(arg.view.currentStart)
    if (todayStr === viewStr) {
      selectedDate.value = todayStr
    }
  },

  dayCellDidMount(arg) {
    const day = arg.date.getDay()
    const dateStr = formatDateToLocalYYYYMMDD(arg.date)
    const isSelected = selectedDate.value === dateStr
    arg.el.style.color = '#9ca3af'
    if (day === 0) arg.el.style.color = '#ef4444'
    if (day === 6) arg.el.style.color = '#5F38E9'
    if (isSelected) {
        arg.el.style.backgroundColor = '#FFE0E0'
        arg.el.style.color = '#111827'
        arg.el.style.fontWeight = '700'
    }
  },

  events: events.value
}

const filteredEvents = computed(() =>
  events.value.filter(event => event.start.startsWith(selectedDate.value))
)

function openAddModal() {
  selectedEvent.value = null
  isModalOpen.value = true
}

function openEditModal(event) {
  selectedEvent.value = event
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleSave(newEvent) {
  try {
    if (selectedEvent.value && selectedEvent.value.id) {
      // 수정
      await updateSchedule(selectedEvent.value.id, newEvent)
      toast.success('수정되었습니다.')
    } else {
      // 생성
      await postSchedule(newEvent)
      toast.success('등록되었습니다.')
    }
    isModalOpen.value = false
    await fetchEvents()
  } catch (err) {
    toast.error('저장에 실패했습니다.')
    console.error(err)
  }
}

async function deleteEvent(eventToDelete) {
  const confirmed = window.confirm('정말 삭제하시겠습니까?')
  if (!confirmed) return

  try {
    await deleteSchedule(eventToDelete.id)
    toast.success("삭제되었습니다.")
    await fetchEvents()
  } catch (err) {
    toast.error('삭제에 실패했습니다.')
    console.error(err)
  }
}

</script>

<template>
  <div class="container">
    <div class="flex p-6 gap-6">
      <!-- 캘린더 -->
      <div class="w-2/3 bg-white rounded-xl shadow-md p-4">
        <FullCalendar
          ref="calendarRef"
          :options="calendarOptions"
          :key="selectedDate"
        />
      </div>

      <!-- 상세 패널 -->
      <div class="w-1/3 bg-white rounded-xl shadow-md p-5 min-h-[400px]">
        <div class="font-bold text-lg mb-4">{{ selectedDate }}</div>

        <div v-if="filteredEvents.length > 0">
          <div
            v-for="(event, index) in filteredEvents"
            :key="index"
            class="flex bg-gray-light rounded-md p-3 mb-3 min-h-[72px]"
          >
            <!-- 색상바 -->
            <div class="flex items-stretch">
              <div
                class="w-1.5 rounded-sm"
                :style="{ backgroundColor: event.backgroundColor, width: '4px', height: '100%' }"
              ></div>
            </div>

            <!-- 시간 + 제목 -->
            <div class="flex-1 pl-3 flex flex-col justify-center">
              <span class="text-sm text-black-500">{{ event.start.slice(11, 16) }}</span>
              <br />
              <span class="text-sm text-black-500">{{ event.end.slice(11, 16) }}</span>
            </div>
            <div class="flex-20 pl-5 flex flex-col justify-center">
              <span
                  class = "text-md text-black-500 truncate max-w-[120px]"
                  :title = "event.content"
              >
              {{ event.content }}
              </span>
            </div>

            <!-- 수정, 삭제 아이콘 -->
            <div class="flex gap-2 ml-2">
              <button class="text-lg cursor-pointer" @click="openEditModal(event)">
                <Icon icon="ei:pencil" class="w-6 h-6" />
              </button>
              <button class="text-lg cursor-pointer" @click="deleteEvent(event)">
                <Icon icon="iconoir:cancel" width="25" height="25" />
              </button>
            </div>
          </div>
        </div>
        <div v-else class="text-sm text-gray-400">일정이 없습니다.</div>

        <!-- 추가 버튼 -->
        <div class="flex justify-center mt-6">
          <button
              class="cursor-pointer"
              @click="openAddModal"
          >
              <Icon icon="ei:plus" width="50" height="50" />
          </button>
        </div>
      </div>
    </div>

    <!-- 등록/수정 모달 -->
    <ScheduleModal
      v-if="isModalOpen"
      :date="selectedDate"
      :eventData="selectedEvent"
      @close="closeModal"
      @save="handleSave"
    />

  </div>
</template>
