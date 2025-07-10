import api from '@/plugin/axios.js';
import qs from 'qs';

export const getCampaignList = async (page, size, filtering) => {
    return await api.get('/campaign', {
        params: {
            page,
            size,
            ...filtering,
        },
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    });
};

export const createCampaign = async (campaignInfo) => {
    return await api.post('/campaign', campaignInfo);
};

/* 캠페인 상세 조회 */
export const getCampaignDetail = async (campaignId) => {
    return await api.get(`/campaign/${campaignId}`);
};

/* 캠페인 수정 */
export const updateCampaign = (data) => {
    return api.put('/campaign/chance/update', data);
};
/* 캠페인 삭제 */
export const deleteCampaign = (campaignId) => {
    return api.delete(`/campaign/${campaignId}`);
};

export const getProposalList = async (page, size, filters = {}) => {
    return await api.get('/campaign/proposal', {
        params: { page, size, ...filters },
        paramsSerializer: (params) => qs.stringify(params, { arrayFormat: 'repeat' }),
    });
};

export const getProposalDetail = async (proposalId) => {
    return await api.get(`/campaign/proposal/${proposalId}`);
};

export const getListUpList = async (page, size, filters = {}) => {
    return await api.get('/campaign/listup', {
        params: { page, size, ...filters },
    });
};

export const createListup = async (payload) => {
    return await api.post(`/campaign/listup`, payload);
};

export const getListupDetail = async (pipelineId) => {
    return await api.get(`/campaign/listup/${pipelineId}`);
};

export const deleteListup = async (listupId) => {
    return await api.delete(`/campaign/listup/${listupId}`);
};

/* 견적 목록*/
export const getQuotationList = async (page, size, filters = {}) => {
    return await api.get('/campaign/quotation', {
        params: { page, size, ...filters },
    });
};

export const updateQuotationDetail = async (form) => {
    return await api.put('/campaign/quotation', form);
};

export const deleteQuotationDetail = async (pipelineId) => {
    return await api.delete(`campaign/quotation/${pipelineId}`);
};

export const createQuotation = async (form) => {
    return await api.post('/campaign/quotation', form);
};

export const getQuotationDetail = async (quotationId) => {
    return await api.get(`/campaign/quotation/${quotationId}`);
};

/**/

export const getRevenueList = async (page, size, filters = {}) => {
    return await api.get('/campaign/revenue', {
        params: { page, size, ...filters },
    });
};

export const getRevenueDetail = async (revenueId) => {
    return await api.get(`/campaign/revenue/${revenueId}`);
};

export const updateRevenueDetail = async (formData) => {
    return await api.put('/campaign/revenue', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteRevenue = async (revenueId) => {
    return await api.delete(`/campaign/revenue/${revenueId}`);
};

export const createRevenue = async (formData) => {
    return await api.post('/campaign/revenue', formData, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const getContractList = async (page, size, filters = {}) => {
    return await api.get('/campaign/contract', {
        params: { page, size, ...filters },
    });
};

export const getContractDetail = async (contractId) => {
    return await api.get(`/campaign/contract/${contractId}`);
};

export const updateContractDetail = async (form) => {
    return await api.put(`/campaign/contract`, form, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const createContract = async (form) => {
    return await api.post(`/campaign/contract`, form, {
        headers: {
            'Content-Type': 'multipart/form-data',
        },
    });
};

export const deleteContract = async (contractId) => {
    return await api.delete(`/campaign/contract/${contractId}`);
};

/* === 팝업 ===*/

export const getUser = async (keyword) => {
    return await api.get('/user/search', {
        params: { keyword },
    });
};

export const getUserNameAndEmail = async () => {
    return await api.get('/popup/user/email');
};

export const getClientCompany = async (keyword) => {
    return await api.get('/client-companies/search', {
        params: { keyword },
    });
};

export const getClientManager = async (clientCompanyId, keyword) => {
    return await api.get('/client-companies/manager/search', {
        params: { clientCompanyId, keyword },
    });
};

export const getInfluencer = async (keyword) => {
    return await api.get('/influencer/search', {
        params: { keyword },
    });
};

export const getPipeline = async (clientCompanyId, keyword) => {
    return await api.get('/campaign/search', {
        params: { keyword, clientCompanyId },
    });
};

export const getListupReference = async () => {
    return await api.get('/listup/reference');
};

export const getProposalReference = async () => {
    return await api.get('/proposal/reference');
};

export const getQuotationReference = async (campaignId = null) => {
    const params = {};
    if (campaignId !== null) {
        params.campaignId = campaignId;
    }

    return await api.get('/campaign/quotation/reference', { params });
};

export const getContractReference = async (campaignId = null) => {
    const params = {};
    if (campaignId !== null) {
        params.campaignId = campaignId;
    }

    return await api.get('/campaign/contract/reference', { params });
};

export const getInfluencerDetail = async (ids) => {
    return await api.post('influencer/detail', ids);
};

export const postIdea = async (data) => {
    return await api.post('/campaign/idea/create', data);
};

export const getIdea = async (pipelineId) => {
    return await api.get('/campaign/idea/all', {
        params: { pipelineId },
    });
};

export const deleteIdea = async (ideaId) => {
    return await api.delete(`/campaign/idea/${ideaId}`);
};

export const downloadFile = async (key) => {
    return await api.get(`/file/download`, {
        params: {
            key: key,
        },
        responseType: 'blob',
    });
};
