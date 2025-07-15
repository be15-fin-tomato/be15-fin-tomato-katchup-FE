<script setup>
import { ref, onMounted, watch, computed } from 'vue'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import interactionPlugin from '@fullcalendar/interaction'
import koLocale from '@fullcalendar/core/locales/ko'
import { Icon } from '@iconify/vue'
import ScheduleModal from '../components/ScheduleModal.vue'
import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';

import {
    getScheduleList,
    getScheduleDetail,
    postSchedule,
    updateSchedule,
    deleteSchedule,
    getPipelineSchedule
} from '@/features/calendar/api.js';

function formatDateToLocalYYYYMMDD(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

const toast = useToast();
const router = useRouter();
const todayDate = new Date()
const calendarRef = ref(null)
const selectedDate = ref(formatDateToLocalYYYYMMDD(todayDate))
const selectedEvent = ref(null)
const isModalOpen = ref(false)
const events = ref([])
const dailySchedule = ref([])
const pipelineEvents = ref([])
const pipelineDailySchedule = computed(() =>
  pipelineEvents.value.filter(event =>
    event.start === selectedDate.value
  )
)

const fetchPipelineEvents = async () => {
    try {
        const res = await getPipelineSchedule();
        const rawList = res.data.data.pipelineScheduleList || [];

        const uniquePipelines = rawList
            .filter(p => p.isDeleted === "N")
            .reduce((acc, cur) => {
                if (!acc.some(item => item.pipelineId === cur.pipelineId)) {
                    acc.push(cur);
                }
                return acc;
            }, []);

        pipelineEvents.value = uniquePipelines.flatMap(item => {
            const events = [];

            // 제안 일정 (제안일)
            if (item.presentedAt) {
                events.push({
                    id: `present-${item.pipelineId}`,
                    title: `${item.name} 발표일`,
                    start: item.presentedAt,
                    allDay: true,
                    extendedProps: {
                        campaignId: item.campaignId,
                        pipelineId: item.pipelineId,
                        pipelineStepId: item.pipelineStepId,
                    }
                });
            }
            return events;
        });
    } catch (err) {
        toast.error("파이프라인 일정을 불러오는 데 실패했습니다.");
        console.error("fetchPipelineEvents error:", err);
    }
}

const fetchEvents = async () => {
  try {
    const res = await getScheduleList();
    const scheduleList = res.data.data.scheduleListsAll || [];

    events.value = scheduleList.map(item => {
      const start = `${item.scheduleDate}T${item.startTime}`;
      const end = `${item.scheduleDate}T${item.endTime}`;

      return {
        id: item.scheduleId,
        title: item.content,
        start,
        end,
        backgroundColor: item.hexCode,
        extendedProps: {
          content: item.content,
          startTime: item.startTime,
          endTime: item.endTime,
          hexCode: item.hexCode,
          scheduleDate: item.scheduleDate
        }
      };
    });

      await fetchPipelineEvents();
      events.value = [...events.value, ...pipelineEvents.value];
  } catch (err) {
    toast.error('일정 데이터를 불러오지 못했습니다.');
    console.error('fetchEvents error:', err);
  }
};

async function fetchScheduleDetail(date) {
  try {
    const res = await getScheduleDetail(date)
    dailySchedule.value = res.data.data.scheduleList || []
  } catch (error) {
    toast.error('해당 날짜의 일정을 불러오는데 실패했습니다.')
    console.error(error)
  }
}

watch(selectedDate, async (newDate) => {
  if (newDate) {
    await fetchEvents();
    await fetchScheduleDetail(newDate);
  }
}, { immediate: true });

onMounted(async () => {
  await fetchEvents();
  await fetchScheduleDetail(selectedDate.value);
})

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, interactionPlugin],
  locale: koLocale,
  initialView: 'dayGridMonth',
  selectable: true,
  events: events.value,
  eventTimeFormat: {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  },
  dateClick(info) {
    selectedDate.value = formatDateToLocalYYYYMMDD(info.date)
  },

  eventClick(info) {
    selectedDate.value = formatDateToLocalYYYYMMDD(info.event.start)
    selectedEvent.value = {
      id: info.event.id,
      content: info.event.extendedProps.content,
      start: info.event.extendedProps.startTime,
      end: info.event.extendedProps.endTime,
      hexCode: info.event.extendedProps.hexCode,
      scheduleDate: formatDateToLocalYYYYMMDD(info.event.start),
    }
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
  }
}))

function openAddModal() {
  selectedEvent.value = null
  isModalOpen.value = true
}

function openEditModal(event) {
    selectedEvent.value = { ...event, id: event.scheduleId }
  isModalOpen.value = true
}

function closeModal() {
  isModalOpen.value = false
}

async function handleSave(newEvent) {
  try {
    if (newEvent.scheduleId) {
      await updateSchedule(newEvent.scheduleId, newEvent);
      toast.success('수정되었습니다.');
    } else {
      await postSchedule(newEvent);
      toast.success('등록되었습니다.');
    }
    isModalOpen.value = false;
    await fetchEvents();
    await fetchScheduleDetail(selectedDate.value);
  } catch (err) {
    toast.error('저장에 실패했습니다.');
    console.error(err);
  }
}

async function deleteEvent(eventToDelete) {
  const confirmed = window.confirm('정말 삭제하시겠습니까?');
  if (!confirmed) return;

  try {
    await deleteSchedule(eventToDelete.scheduleId);
    toast.success("삭제되었습니다.");
    await fetchEvents();
      await fetchScheduleDetail(selectedDate.value);
  } catch (err) {
    toast.error('삭제에 실패했습니다.');
    console.error(err);
  }
}

function goToPipelineDetail(event) {
  const pipelineId = event.extendedProps?.pipelineId;
  const stepId = event.extendedProps?.pipelineStepId;

  if (!pipelineId || !stepId) {
    toast.error('파이프라인 정보가 누락되었습니다.');
    return;
  }

  const stepRouteMap = {
    2: 'listup',
    3: 'proposal',
    4: 'quotation',
    6: 'contract',
    7: 'revenue',
  };

  const step = stepRouteMap[stepId];
  if (!step) {
    toast.error('유효하지 않은 단계입니다.');
    return;
  }

  router.push({ name: 'SalesDetail', params: { step, pipelineId } });
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
        />
      </div>

      <!-- 상세 패널 -->
      <div class="w-1/3 bg-white rounded-xl shadow-md p-5 min-h-[400px]">
        <div class="font-bold text-lg mb-4">{{ selectedDate }}</div>

        <div v-if="dailySchedule.length > 0">
          <div
            v-for="(event, index) in dailySchedule"
            :key="index"
            class="flex bg-gray-light rounded-md p-3 mb-3 min-h-[72px]"
          >
            <!-- 색상바 -->
            <div class="flex items-stretch">
              <div
                class="w-1.5 rounded-sm"
                :style="{ backgroundColor: event.hexCode, width: '4px', height: '100%' }"
              ></div>
            </div>

            <!-- 시간 + 제목 -->
            <div class="flex-1 pl-3 flex flex-col justify-center">
              <span class="text-sm text-black-500">{{ event.startTime.slice(0,5) }}</span>
              <br />
              <span class="text-sm text-black-500">{{ event.endTime.slice(0,5) }}</span>
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
        <div v-else class="text-sm text-gray-400 mt-5 mb-5">
          등록된 개인 일정이 없습니다.
        </div>

        <div v-if="pipelineDailySchedule.length > 0">
          <div
            v-for="(event, index) in pipelineDailySchedule"
            :key="'pipeline-' + index"
            class="flex bg-gray-100 rounded-md p-3 mb-3 min-h-[72px] border border-blue-300"
            @click="goToPipelineDetail(event)"
            style="cursor: pointer;"
          >
            <div class="flex items-stretch">
              <div
                class="w-1.5 rounded-sm bg-blue-500"
                style="width: 4px; height: 100%;"
              ></div>
            </div>

            <div class="flex-1 pl-3 flex flex-col justify-center">
      <span class="text-md text-black-700 whitespace-normal break-words">
        {{ event.title }}
      </span>
            </div>
          </div>
        </div>

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
