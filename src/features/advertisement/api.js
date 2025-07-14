import api from '@/plugin/axios.js';
import qs from 'qs';

// 고객사 목록 조회 API (필터링, 페이징 포함)
export const getClientCompanyList = async (page, size, filters = {}) => {
  return await api.get('/client-companies', {
    params: { page, size, ...filters },
    paramsSerializer: (params) =>
      qs.stringify(params, { arrayFormat: 'repeat' }),
  });
};

// 고객사 등록 API
export const createClientCompany = async (data) => {
  return await api.post('/client-companies', data);
};

// 고객사 수정 API
export const updateClientCompany = async (clientCompanyId, data) => {
  return await api.put(`/client-companies/${clientCompanyId}`, data);
};

// 고객사 삭제 API
export const deleteClientCompany = async (clientCompanyId) => {
  return await api.delete(`/client-companies/${clientCompanyId}`);
};

// 고객사 상세 조회 API
export const getClientCompanyDetail = async (clientCompanyId) => {
  return await api.get(`/client-companies/${clientCompanyId}/detail`);
};

// 고객사를 담당하는 유저 조회 API
export const getClientCompanyUsers = async (clientCompanyId) => {
  return await api.get(`/client-companies/${clientCompanyId}/users`);
};

// 고객사의 사원 단독 삭제 API
export const deleteClientManager = async (clientManagerId) => {
  return await api.delete(`/client-managers/${clientManagerId}`);
};

// 고객사 ID 기준 캠페인 목록 조회 API
export const getCampaignsByClientCompany = async (clientCompanyId) => {
  return await api.get(`/campaign/by-client-company/${clientCompanyId}`);
};

// 완료된 계약서 목록 조회 API
export const getClientCompanyContracts = async (clientCompanyId) => {
  return await api.get(`/client-companies/success/${clientCompanyId}`);
};

// 커뮤니케이션 이력 조회 API
export const getClientCompanyCommunicationHistories = async (clientCompanyId) => {
  return await api.get(`/client-companies/${clientCompanyId}/communication-histories`)
}
