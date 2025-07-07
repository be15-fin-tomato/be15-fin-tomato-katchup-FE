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

/* 상세 조건 조회 ( 리스트 , 상세 조회 )*/
export const fetchContractDetails = async (objectId, selectedDetailId = null) => {
  try {
    const params = selectedDetailId ? { selectedDetailId } : {};
    const response = await api.get(`/contracts/${objectId}`, { params });
    return response.data.data;
  } catch (error) {
    console.error(`계약서 상세 조건 목록 (ID: ${objectId}) 조회 API 호출 실패:`, error);
    throw error;
  }
};

/* 상세 조건 생성 */
export const createContractDetail = async (requestData, file = null) => {
  try {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

    /* Blob은 JS에서 불변(immutable)의 원시 데이터를 나타내는 객체
    *  한번 생성된 Blob 객체의 내용은 변할 수 없다. -> 안전하게 관리가 가능
    *  다양한 종류의 데이터를 표현할 수 있다. */
    if (file) {
      formData.append('file', file);
    }

    const response = await api.post('/contracts/create', formData, {
    });
    return response.data;
  } catch (error) {
    console.error('계약서 생성 API 호출 실패:', error);
    throw error;
  }
};

/* 상세 조건 수정 */
export const updateContractDetail = async (detailId, requestData, file = null) => {
  try {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

    if (file) {
      formData.append('file', file);
    }

    const response = await api.patch(`/contracts/detail/${detailId}`, formData, {
    });
    return response.data;
  } catch (error) {
    console.error(`계약서 상세 (ID: ${detailId}) 수정 API 호출 실패:`, error);
    throw error;
  }
};

/* 계약서 템플릿 세부 조건 삭제 */
export const deleteContractDetail = async (detailId) => {
  try {
    const response = await api.delete(`/contracts/delete/detail/${detailId}`);
    return response.data;
  } catch (error) {
    console.error(`계약서 상세 (ID: ${detailId}) 삭제 API 호출 실패:`, error);
    throw error;
  }
};

export const sendContractEmail = async (requestData, file = null) => {
  try {
    const formData = new FormData();
    formData.append('data', new Blob([JSON.stringify(requestData)], { type: 'application/json' }));

    if (file) {
      formData.append('file', file);
    }

    const response = await api.post('/contracts/send', formData, {
    });
    return response.data;
  } catch (error) {
    console.error('계약서 파일 전송 (이메일) API 호출 실패:', error);
    throw error;
  }
};

/* 계약 완료 목록 조회 */
export const fetchContractSuccessList = (params) => {
  return api.get('/contract/success', { params });
};

/* 계약서 조회 */
export const fetchContractFile = (contractId, password) => {
  const formData = new FormData();
  formData.append('password', password);

  return api.get(`/contract/success/view/${contractId}`, {
    data: formData,
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
};

/* 계약서 등록 */
export async function uploadContractFile(contractId, formData) {
  return api.put(`/contract/sign/${contractId}`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
}




