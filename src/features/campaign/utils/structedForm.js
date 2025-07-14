export const structuredForm = (rawForm, fileList = []) => {
    console.log(rawForm);
    return {
        name: rawForm.name,
        requestAt: rawForm.requestAt,
        presentAt: rawForm.presentAt,
        startedAt: rawForm.startedAt,
        endedAt: rawForm.endedAt,
        content: rawForm.content,
        notes: rawForm.notes,

        // 회사/담당자
        clientCompany: {
            id: rawForm.clientCompanyId,
            name: rawForm.clientCompanyName,
        },
        clientManager: {
            id: rawForm.clientManagerId,
            name: rawForm.clientManagerName,
        },

        // 캠페인
        campaign: {
            id: rawForm.campaignId,
            name: rawForm.campaignName,
        },

        // 유저들 (search-user 타입이 다중 유저를 받는 경우)
        username: rawForm.userList.map((u) => ({
            id: u.userId,
            name: u.userName,
        })),

        // 인플루언서 (다중 검색 시 사용)
        influencer: rawForm.influencerList.map((i) => ({
            id: i.influencerId,
            name: i.influencerName ? i.influencerName : i.name,
            strength: i.strength ?? '',
            note: i.notes ?? '',
        })),

        influencerContents: rawForm.influencerList.map((i) => {
            const youtube = i.youtubeLink?.trim();
            const instagram = i.instagramLink?.trim();

            return {
                influencerId: i.influencerId,
                name: i.influencerName,
                platform: youtube ? 'youtube' : instagram ? 'instagram' : null,
                url: youtube || instagram || '',
                adPrice: i.adPrice ?? 0,
            };
        }),

        // 기타 수치 필드
        price: rawForm.expectedRevenue,
        supplyAmount: rawForm.availableQuantity,
        extraProfit: rawForm.expectedProfit,
        productPrice: rawForm.productPrice,
        salesQuantity: rawForm.salesQuantity,

        // 상태 (select 박스)
        status: rawForm.pipelineStatusId,

        // 파일
        attachment: (fileList || []).map((f) => ({
            id: f.fileId,
            name: f.fileName,
            key: f.fileKey,
        })),
    };
};
