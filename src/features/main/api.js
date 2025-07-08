import api from '@/plugin/axios.js';

/* 신규 영업활동 조회 */
export const fetchSalesActivity = () =>
  api.get('/dashboard/sales-activity');

/* 나의 오늘 일정 조회 */
export const fetchMySchedule = () =>
  api.get('/dashboard/schedule');

/* 내 담당 견적 조회 */
export const fetchMyQuotation = () =>
  api.get('/dashboard/quotation');

/* 내 담당 제안 조회 */
export const fetchMyProposal = () =>
  api.get('/dashboard/proposal');

/* 내 담당 리스트업 조회 */
export const fetchMyListUp = () =>
  api.get('/dashboard/list-up');

/* 내 담당 계약 조회 */
export const fetchMyContract = () =>
  api.get('/dashboard/contract');

/* 내 담당 고객사 조회 */
export const fetchMyClientCompany = () =>
  api.get('/dashboard/client-company');
