import api from '@/plugin/axios.js';

/* Object 목록 조회 */
export const fetchContractObjects = async () => {
  try {
    const response = await api.get('/contracts');
    return response.data.data;
  } catch (error) {
    console.error('계약서 조건 목록 조회 API 호출 실패:', error);
    throw error;
  }
};

/* Object 추가 */
export const createContractObject = async (title) => {
  try {
    const response = await api.post('/contracts/object/create', { title });
    return response.data;
  } catch (error) {
    console.error('계약서 목적 생성 API 호출 실패:', error);
    throw error;
  }
};

/* 계약서 템플릿 조건 수정 */
export const updateContractObject = async (objectId, title) => {
  try {
    const response = await api.patch(`/contracts/object/${objectId}`, { title });
    return response.data;
  } catch (error) {
    console.error(`계약서 목적 (ID: ${objectId}) 수정 API 호출 실패:`, error);
    throw error;
  }
};

/* 계약서 템플릿 조건 삭제 */
export const deleteContractObject = async (objectId) => {
  try {
    const response = await api.delete(`/contracts/delete/object/${objectId}`);
    return response.data;
  } catch (error) {
    console.error(`계약서 목적 (ID: ${objectId}) 삭제 API 호출 실패:`, error);
    throw error;
  }
};

/*계약서 상세 조건 목록 조회 */
export const fetchContractDetails = async
