import api from '@/plugin/axios.js';

export const getCampaignList = async (page, size, company) => {
    return await api.get('/campaign', {
        params: {
            page,
            size,
            ...(company && { company }),
        },
    });
};

export const createCampaign = async (campaignInfo) => {
    return await api.post('/campaign', campaignInfo);
};

export const getCampaignDetail = async (campaignId) => {
    return await api.get(`/campaign/${campaignId}`);
};

export const getCampaignHistory = async (campaignId) => {
    return await api.get(`/campaign/history/${campaignId}`);
};

export const getOpinion = async (targetId, targetType) => {
    return await api.get('/opinion', {
        params: { targetType, targetId },
    });
};

export const getProposalList = async (page, size, filters = {}) => {
    return await api.get('/sales/proposal', {
        params: { page, size, ...filters },
    });
};

export const getProposalDetail = async (proposalId) => {
    return await api.get(`/sales/proposal/${proposalId}`);
};

export const getListUpList = async (page, size, filters = {}) => {
    return await api.get('/sales/listup', {
        params: { page, size, ...filters },
    });
};

export const getQuotationList = async (page, size, filters = {}) => {
    return await api.get('/sales/quotation', {
        params: { page, size, ...filters },
    });
};

export const getQuotationDetail = async (quotationId) => {
    return await api.get(`/sales/quotation/${quotationId}`);
};

export const getRevenueList = async (page, size, filters = {}) => {
    return await api.get('/sales/revenue', {
        params: { page, size, ...filters },
    });
};

export const getRevenueDetail = async (revenueId) => {
    return await api.get(`/sales/revenue/${revenueId}`);
};

export const getContractList = async (page, size, filters = {}) => {
    return await api.get('/sales/contract', {
        params: { page, size, ...filters },
    });
};

export const getContractDetail = async (contractId) => {
    return await api.get(`/sales/contract/${contractId}`);
};

/* === 팝업 ===*/

export const getUser = async () => {
    return await api.get('/popup/user');
};

export const getUserNameAndEmail = async () => {
  return await api.get('/popup/user/email');
};

export const getClientCompany = async () => {
    return await api.get('/popup/client-company');
};

export const getClientManager = async () => {
    return await api.get('/popup/client-manager');
};

export const getInfluencer = async () => {
    return await api.get('/popup/influencer');
};

export const getPipeline = async () => {
    return await api.get('/popup/pipeline');
};

export const getListupReference = async () => {
    return await api.get('/listup/reference');
};

export const getProposalReference = async () => {
    return await api.get('/proposal/reference');
};

export const getQuotationReference = async () => {
    return await api.get('/quotation/reference');
};

export const getContractReference = async () => {
    return await api.get('/contract/reference');
};

export const getInfluencerDetail = async (ids) => {
    return await api.post('influencer/detail', ids);
};
