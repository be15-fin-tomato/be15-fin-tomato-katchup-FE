import api from '@/plugin/axios.js';

export const getScheduleList = async () => {
    return await api.get('/calendar/schedule/all');
};

export const getScheduleDetail = async (scheduleDate) => {
  return await api.get(`/calendar/schedule/${scheduleDate}/daily`)
};

export const postSchedule = async (data) => {
    return await api.post('/calendar/create', data)
};

export const updateSchedule = async (scheduleId, data) => {
    return await api.patch(`/calendar/${scheduleId}`, data)
};

export const deleteSchedule = async (scheduleId) => {
    return await api.delete(`/calendar/${scheduleId}`)
};

export const getPipelineSchedule = async (pipelineId) => {
    return await api.get('/calendar/schedule/pipeline', {
        params: { pipelineId },
    });
};
