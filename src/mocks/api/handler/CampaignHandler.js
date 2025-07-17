import { http, HttpResponse } from 'msw';

const formatDate = (date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
};

const baseDate = new Date();

const pipelinePopupList = [
    {
        id: 1,
        name: 'UVW 뷰티 디바이스 캠페인',
    },
    {
        id: 2,
        name: ' XYZ 썸머룩 캠페인',
    },
    {
        id: 3,
        name: 'ABC 스마트워치 캠페인',
    },
    {
        id: 4,
        name: ' 카카오 웹툰 프로모션',
    },
    {
        id: 5,
        name: 'CJ ENM 드라마 캠페인',
    },
];

const quotationDetail = {
    title: '[2차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 견적',
    requestDate: '2025-06-05',
    clientCompany: { id: 1, name: 'UVW 뷰티' },
    clientManager: { id: 10, name: '송강' },
    period: '2주간',
    announcementDate: '2025-06-15',
    pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
    username: { id: 100, name: '차은우' },
    influencer: { id: 201, name: '나연' },
    status: '승인요청',
    price: 100000000,
    supplyAmount: 20000,
    extraProfit: 800000000,
    content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함',
    notes: '특이사항 없음',
    startDate: '2025-06-06',
    endDate: '2025-06-20',
};

const contractDetail = {
    title: '[2차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 계약',
    requestDate: '2025-06-05',
    clientCompany: { id: 1, name: 'UVW 뷰티' },
    clientManager: { id: 10, name: '송강' },
    period: '2주간',
    announcementDate: '2025-06-15',
    pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
    username: { id: 100, name: '차은우' },
    influencer: { id: 201, name: '나연' },
    status: '승인요청',
    price: 100000000,
    supplyAmount: 20000,
    extraProfit: 800000000,
    content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함',
    notes: '특이사항 없음',
    startDate: '2025-06-06',
    endDate: '2025-06-20',
};

const opinionList = [
    {
        id: 1,
        author: '차은우',
        content: '첫 번째 의견입니다.',
        createdAt: '2025-06-15 10:30:00',
    },
    {
        id: 2,
        author: '아이유',
        content: '두 번째 의견입니다.',
        createdAt: '2025-06-15 11:00:00',
    },
];

const pipelineList = [
    {
        id: 1,
        pipelineStep: 'chance',
        title: 'XYZ 패션 브랜드 시즌 프로모션 계약',
        createdAt: '2025-06-05',
    },
    {
        id: 1,
        pipelineStep: 'listup',
        title: 'XYZ 패션 브랜드 시즌 프로모션 캐스팅 리스트업',
        createdAt: '2025-06-06',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
    },
    {
        id: 1,
        pipelineStep: 'proposal',
        title: 'XYZ 패션 브랜드 시즌 프로모션 캐스팅 제안',
        createdAt: '2025-06-06',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
        startAt: '2025-06-12',
        endAt: '2025-06-17',
        username: '차은우',
    },
    {
        id: 1,
        pipelineStep: 'quotation',
        title: ' XYZ 패션 브랜드 시즌 프로모션 캐스팅 견적 (1차)',
        createdAt: '2025-06-07',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
        adPrice: 9600000,
    },
    {
        id: 2,
        pipelineStep: 'quotation',
        title: 'XYZ 패션 브랜드 시즌 프로모션 캐스팅 견적 (2차) 패션 브랜드 시즌 프로모션 캐스팅 견적 (2차)패션 브랜드 시즌 프로모션 캐스팅 견적 (2차)',
        createdAt: '2025-06-08',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
        adPrice: 9300000,
    },
    {
        id: 3,
        pipelineStep: 'quotation',
        title: 'XYZ 패션 브랜드 시즌 프로모션 캐스팅 견적 (2차) 패션 브랜드 시즌 프로모션 캐스팅 견적 (2차)패션 브랜드 시즌 프로모션 캐스팅 견적 (2차)',
        createdAt: '2025-06-08',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
        adPrice: 9300000,
    },
    {
        id: 4,
        pipelineStep: 'quotation',
        title: 'XYZ 패션 브랜드 시즌 프로모션 캐스팅 견적 (2차) 패션 브랜드 시즌 프로모션 캐스팅 견적 (2차)패션 브랜드 시즌 프로모션 캐스팅 견적 (2차)',
        createdAt: '2025-06-08',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
        adPrice: 9300000,
    },
    {
        id: 1,
        pipelineStep: 'sales',
        title: ' 상품 이름 정보',
        createdAt: '2025-06-09',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
        adPrice: 9300000,
    },
    {
        id: 1,
        pipelineStep: 'contract',
        title: 'XYZ 패션 브랜드 시즌 프로모션 계약',
        createdAt: '2025-06-11',
        clientCompany: 'XYZ 패션',
        ClientManagerName: '송강',
        startAt: '2025-06-12',
        endAt: '2025-06-17',
        username: '차은우',
        adPrice: 9300000,
    },
];
const campaignDetail = {
    id: 1,
    status: '진행중',
    title: 'Campaign 1',
    clientCompany: { id: 1, name: 'Company 1' },
    clientManager: { id: 1, name: '김동영' },
    productName: 'COMPACT 폴딩백 하이킹 경량 백팩 20L',
    adPrice: 9300000,
    productPrice: 16300,
    expectedRevenue: 1000000, // 예상 매출
    expectedProfitMargin: 20, // 예상 이익률
    startDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
    endDate: formatDate(new Date(baseDate.getFullYear() + 2, 3, 20)),
    address: '서울특별시 동작구 보라매로 87길 (신대방동)',
    addressDetail: '3층 강의실 15기',
    username: [
        { id: 100, name: '차은우' },
        { id: 101, name: '김민재' },
    ],
    awarenessPath: '지인 소개',
    notes: '1231231212123123',
    pipeLine: {
        chance: { id: 1, date: formatDate(new Date(baseDate.getFullYear(), 2, 20)) },
        listUp: { id: 2, date: formatDate(new Date(baseDate.getFullYear(), 2, 23)) },
        proposal: { id: 1, date: formatDate(new Date(baseDate.getFullYear(), 2, 25)) },
        negotiation: { id: 1, date: formatDate(new Date(baseDate.getFullYear(), 2, 27)) },
    },
    influencerId: 1,
};
const userList = [
    { id: 1, name: '차은우' },
    { id: 2, name: '아이유' },
    { id: 3, name: '김수현' },
    { id: 4, name: '장원영' },
    { id: 5, name: '전정국' },
    { id: 6, name: '박지민' },
    { id: 7, name: '박보검' },
    { id: 8, name: '손흥민' },
    { id: 9, name: '김정우' },
];

const userListNameAndEmail = [
    { id: 1, name: '차은우', email: 'lsj9057@daum.net' },
    { id: 2, name: '아이유', email: 'lsj9057@namver.com,' },
    { id: 3, name: '김수현', email: 'lsj9057@google.com' },
    { id: 4, name: '장원영', email: 'lsj9057@nate.com' },
    { id: 5, name: '전정국', email: 'dfdfd@naver.com' },
    { id: 6, name: '박지민', email: 'fdsfasdfads@daum.net' },
    { id: 7, name: '박보검', email: 'lsjdafdd9057@daum.net' },
    { id: 8, name: '손흥민', email: 'lsjssfdsd9057@daum.net' },
    { id: 9, name: '김정우', email: 'lsdfasdfj9057@daum.net' },
];

const clientCompanyList = [
    { id: 1, name: 'UVW 뷰티', telephone: '02-123-4567', createdAt: '2025-06-08' },
    { id: 2, name: 'XYZ 패션', telephone: '02-123-4567', createdAt: '2025-06-08' },
    { id: 3, name: 'ABC 전자', telephone: '02-123-4567', createdAt: '2025-06-08' },
    { id: 4, name: '카카오 엔터', telephone: '02-123-4567', createdAt: '2025-06-08' },
    { id: 5, name: 'CJ ENM', telephone: '02-123-4567', createdAt: '2025-06-08' },
    { id: 6, name: '네이버 쇼핑', telephone: '02-123-4567', createdAt: '2025-06-08' },
    { id: 7, name: '하이마트', telephone: '02-123-4567', createdAt: '2025-06-08' },
    { id: 8, name: '삼성전자', telephone: '02-123-4567', createdAt: '2025-06-08' },
];

const clientManagerList = [
    { id: 101, name: '송강' },
    { id: 102, name: '김민지' },
    { id: 103, name: '이도현' },
    { id: 104, name: '박서준' },
    { id: 105, name: '정해인' },
    { id: 106, name: '서강준' },
    { id: 107, name: '문가영' },
    { id: 108, name: '한소희' },
    { id: 109, name: '신민아' },
];

const influencerList = [
    {
        id: 201,
        name: '나연',
    },
    {
        id: 202,
        name: '제니',
    },
    {
        id: 203,
        name: '장원영',
    },
    {
        id: 204,
        name: '윈터',
    },
    {
        id: 205,
        name: '아이유',
    },
    {
        id: 206,
        name: '수지',
    },
    {
        id: 207,
        name: '조이',
    },
    {
        id: 208,
        name: '유나',
    },
    {
        id: 209,
        name: '솔라',
    },
];

const influencerDetail = [
    {
        id: 201,
        name: '나연',
        nickname: 'Nayeon_Official',
        description: '상큼한 매력의 K-POP 아이콘',
        imageUrl: '/images/influencer/nayeon.jpg',
        strength: '팬들과의 소통이 활발하고 밝은 이미지',
        note: '콘서트 중심 활동',
        platform: {
            instagram: {
                averageView: 120000,
                averageLike: 8000,
                averageComment: 320,
                followers: 3100000,
                category: '패션',
                ageTop1: { label: '20대', rate: '45%' },
                ageTop2: { label: '10대', rate: '30%' },
                ageTop3: { label: '30대', rate: '15%' },
                genderTop1: { label: '여성', rate: '70%' },
                genderTop2: { label: '남성', rate: '30%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 202,
        name: '제니',
        nickname: 'jennierubyjane',
        description: '글로벌 럭셔리 브랜드 앰버서더',
        imageUrl: '/images/influencer/jennie.jpg',
        strength: '브랜드 파급력 뛰어남',
        note: '해외 광고 다수',
        platform: {
            instagram: {
                averageView: 250000,
                averageLike: 15000,
                averageComment: 500,
                followers: 8000000,
                category: '럭셔리',
                ageTop1: { label: '20대', rate: '50%' },
                ageTop2: { label: '10대', rate: '25%' },
                ageTop3: { label: '30대', rate: '20%' },
                genderTop1: { label: '여성', rate: '60%' },
                genderTop2: { label: '남성', rate: '40%' },
            },
            youtube: {
                averageView: 600000,
                averageLike: 42000,
                averageComment: 1700,
                subscribers: 2300000,
                category: '뷰티',
                ageTop1: { label: '20대', rate: '55%' },
                ageTop2: { label: '30대', rate: '25%' },
                ageTop3: { label: '10대', rate: '15%' },
                genderTop1: { label: '여성', rate: '68%' },
                genderTop2: { label: '남성', rate: '32%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 203,
        name: '장원영',
        nickname: 'wo0young',
        description: '비주얼과 춤선이 아름다운 모델형 아이돌',
        imageUrl: '/images/influencer/wonyoung.jpg',
        strength: '광고 적합성 매우 높음',
        note: '잡지 화보 다수 진행',
        platform: {
            instagram: {
                averageView: 180000,
                averageLike: 14000,
                averageComment: 400,
                followers: 4000000,
                category: '뷰티',
                ageTop1: { label: '20대', rate: '60%' },
                ageTop2: { label: '10대', rate: '25%' },
                ageTop3: { label: '30대', rate: '10%' },
                genderTop1: { label: '여성', rate: '75%' },
                genderTop2: { label: '남성', rate: '25%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 204,
        name: '윈터',
        nickname: 'winter_ae',
        description: '시크한 매력과 감성 보컬',
        imageUrl: '/images/influencer/winter.jpg',
        strength: '음악 콘텐츠에 강점',
        note: '',
        platform: {
            youtube: {
                averageView: 320000,
                averageLike: 26000,
                averageComment: 800,
                subscribers: 1500000,
                category: '음악',
                ageTop1: { label: '20대', rate: '52%' },
                ageTop2: { label: '30대', rate: '28%' },
                ageTop3: { label: '10대', rate: '12%' },
                genderTop1: { label: '여성', rate: '66%' },
                genderTop2: { label: '남성', rate: '34%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 205,
        name: '아이유',
        nickname: 'dlwlrma',
        description: '싱어송라이터이자 배우로 활동',
        imageUrl: '/images/influencer/iu.jpg',
        strength: '전 세대를 아우르는 인지도',
        note: '콘서트, 드라마 활동 병행',
        platform: {
            youtube: {
                averageView: 800000,
                averageLike: 60000,
                averageComment: 2500,
                subscribers: 5500000,
                category: '음악',
                ageTop1: { label: '20대', rate: '40%' },
                ageTop2: { label: '30대', rate: '35%' },
                ageTop3: { label: '40대', rate: '15%' },
                genderTop1: { label: '여성', rate: '55%' },
                genderTop2: { label: '남성', rate: '45%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 206,
        name: '수지',
        nickname: 'skuukzky',
        description: '배우 겸 가수로 폭넓은 팬층 보유',
        imageUrl: '/images/influencer/suzy.jpg',
        strength: 'CF 퀸으로 브랜드 친화도 높음',
        note: '광고 모델 중심 활동',
        platform: {
            instagram: {
                averageView: 210000,
                averageLike: 17000,
                averageComment: 600,
                followers: 7200000,
                category: '라이프스타일',
                ageTop1: { label: '30대', rate: '40%' },
                ageTop2: { label: '20대', rate: '35%' },
                ageTop3: { label: '40대', rate: '15%' },
                genderTop1: { label: '여성', rate: '58%' },
                genderTop2: { label: '남성', rate: '42%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 207,
        name: '조이',
        nickname: 'joyful_joy',
        description: '밝고 발랄한 이미지로 다양한 예능 출연',
        imageUrl: '/images/influencer/joy.jpg',
        strength: '예능·광고 모두 소화 가능',
        note: '라이프 브랜드에 적합',
        platform: {
            instagram: {
                averageView: 110000,
                averageLike: 9500,
                averageComment: 310,
                followers: 2800000,
                category: '엔터테인먼트',
                ageTop1: { label: '20대', rate: '48%' },
                ageTop2: { label: '10대', rate: '30%' },
                ageTop3: { label: '30대', rate: '12%' },
                genderTop1: { label: '여성', rate: '65%' },
                genderTop2: { label: '남성', rate: '35%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 208,
        name: '유나',
        nickname: 'im_yuna',
        description: '에너제틱한 무대 퍼포먼스의 아이콘',
        imageUrl: '/images/influencer/yuna.jpg',
        strength: 'Z세대 타겟 적합',
        note: '소셜미디어 반응 우수',
        platform: {
            instagram: {
                averageView: 100000,
                averageLike: 7800,
                averageComment: 260,
                followers: 1900000,
                category: '댄스',
                ageTop1: { label: '10대', rate: '55%' },
                ageTop2: { label: '20대', rate: '30%' },
                ageTop3: { label: '30대', rate: '10%' },
                genderTop1: { label: '여성', rate: '72%' },
                genderTop2: { label: '남성', rate: '28%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 209,
        name: '솔라',
        nickname: 'solarsido',
        description: '보컬과 유쾌한 성격으로 예능까지 섭렵',
        imageUrl: '/images/influencer/solar.jpg',
        strength: '다채로운 콘텐츠 제작 가능',
        note: '개인 유튜브도 운영 중',
        platform: {
            youtube: {
                averageView: 270000,
                averageLike: 23000,
                averageComment: 900,
                subscribers: 2000000,
                category: '일상 Vlog',
                ageTop1: { label: '20대', rate: '42%' },
                ageTop2: { label: '30대', rate: '30%' },
                ageTop3: { label: '10대', rate: '15%' },
                genderTop1: { label: '여성', rate: '60%' },
                genderTop2: { label: '남성', rate: '40%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
    {
        id: 210,
        name: '채원',
        nickname: 'chaewon_k',
        description: '차분하면서도 강단 있는 퍼포먼스',
        imageUrl: '/images/influencer/chaewon.jpg',
        strength: '음악·패션 콘텐츠 모두 어울림',
        note: '',
        platform: {
            instagram: {
                averageView: 95000,
                averageLike: 6700,
                averageComment: 240,
                followers: 1600000,
                category: 'K-POP',
                ageTop1: { label: '10대', rate: '50%' },
                ageTop2: { label: '20대', rate: '35%' },
                ageTop3: { label: '30대', rate: '10%' },
                genderTop1: { label: '여성', rate: '68%' },
                genderTop2: { label: '남성', rate: '32%' },
            },
        },
        campaignHistory: [
            {
                id: 1,
                name: 'UVW 뷰티 디바이스 언박싱 캠페인',
                url: '/sales/proposal/1',
            },
            {
                id: 2,
                name: 'ABC 샴푸 브랜드 체험 캠페인',
                url: '/sales/proposal/2',
            },
            {
                id: 3,
                name: 'XYZ 립스틱 스타일링 영상 캠페인',
                url: '/sales/proposal/3',
            },
            {
                id: 4,
                name: 'QRT 패션 브랜드 협업 캠페인',
                url: '/sales/proposal/4',
            },
            {
                id: 5,
                name: 'Glow 스킨케어 제품 사용 후기 캠페인',
                url: '/sales/proposal/5',
            },
            {
                id: 6,
                name: 'LUNA 쿠션 데일리 메이크업 캠페인',
                url: '/sales/proposal/6',
            },
            {
                id: 7,
                name: 'VEIL 향수와 함께한 하루 캠페인',
                url: '/sales/proposal/7',
            },
            {
                id: 8,
                name: 'FLO 브랜드 썸머 스타일링 캠페인',
                url: '/sales/proposal/8',
            },
        ],
    },
];
const listupReferenceList = [
    {
        id: 1,
        title: '[1차] UVW 뷰티 리스트업',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        influencer: [
            { id: 201, name: '나연', strength: '잘함' },
            { id: 208, name: '유나', strength: '훌륭함' },
            { id: 209, name: '솔라', strength: '팬들과의 소통이 활발하고 밝은 이미지' },
        ],
    },
    {
        id: 2,
        title: '[2차] XYZ 패션 캠페인',
        clientCompany: { id: 2, name: 'XYZ 패션' },
        influencer: [
            { id: 202, name: '제니', strength: '카리스마 있고 트렌디함' },
            { id: 203, name: '장원영', strength: '모델 같은 비주얼' },
        ],
    },
    {
        id: 3,
        title: '[3차] ABC 푸드 프로젝트',
        clientCompany: { id: 3, name: 'ABC 푸드' },
        influencer: [
            { id: 204, name: '윈터', strength: '밝고 에너지 넘침' },
            { id: 205, name: '아이유', strength: '모든 세대에게 인기 있는 호감형' },
        ],
    },
    {
        id: 4,
        title: '[4차] LMN 디바이스 론칭',
        clientCompany: { id: 4, name: 'LMN 디지털' },
        influencer: [{ id: 206, name: '수지', strength: '고급스럽고 차분한 이미지' }],
    },
    {
        id: 5,
        title: '[5차] QRS 라이프스타일 제안',
        clientCompany: { id: 5, name: 'QRS 라이프' },
        influencer: [
            { id: 207, name: '조이', strength: '밝고 친근한 이미지' },
            { id: 208, name: '유나', strength: '자연스럽고 건강한 느낌' },
        ],
    },
    {
        id: 6,
        title: '[6차] OPQ 뷰티 브랜드 협업',
        clientCompany: { id: 6, name: 'OPQ 코스메틱' },
        influencer: [
            { id: 209, name: '솔라', strength: '강한 개성과 자신감 있는 표현력' },
            { id: 202, name: '제니', strength: '하이엔드 브랜드 이미지와 어울림' },
        ],
    },
];

const proposalReferenceList = [
    {
        id: 1,
        title: '[1차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 제안',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-15',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 2,
        title: '[2차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 제안',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-15',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!!!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 3,
        title: '[3차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 제안',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-17',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인99',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 4,
        title: '[4차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 제안 - 최종',
        requestDate: '2025-06-03',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-21',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-05',
        endDate: '2025-06-19',
    },
    {
        id: 5,
        title: '[5차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 제안 - 최최종',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '3주간',
        announcementDate: '2025-06-12',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 350000000,
        supplyAmount: 70000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
];

const proposalDetail = {
    id: 6,
    title: '맛있는 감자탕 광고 제안',
    requestDate: '2025-06-20',
    startDate: '2025-06-09',
    endDate: '2025-06-13',
    announcementDate: '2025-06-07',
    clientCompany: { id: 1, name: 'UVW 뷰티' },
    clientManager: { id: 101, name: '송강' },
    pipeline: { id: 2, name: '[2차] XYZ 썸머룩 캠페인' },
    influencer: [
        {
            id: 201,
            name: '나연',
            nickname: 'Nayeon_Official',
            description: '상큼한 매력의 K-POP 아이콘',
            imageUrl: '/images/influencer/nayeon.jpg',
            strength: '팬들과의 소통이 활발하고 밝은 이미지',
            note: '콘서트 중심 활동',
            platform: {
                instagram: {
                    averageView: 120000,
                    averageLike: 8000,
                    averageComment: 320,
                    followers: 3100000,
                    category: '패션',
                    ageTop1: { label: '20대', rate: '45%' },
                    ageTop2: { label: '10대', rate: '30%' },
                    ageTop3: { label: '30대', rate: '15%' },
                    genderTop1: { label: '여성', rate: '70%' },
                    genderTop2: { label: '남성', rate: '30%' },
                },
            },
            campaignHistory: [
                { id: 1, name: 'UVW 뷰티 디바이스 언박싱 캠페인', url: '/sales/proposal/1' },
                { id: 2, name: 'ABC 샴푸 브랜드 체험 캠페인', url: '/sales/proposal/2' },
                { id: 3, name: 'XYZ 립스틱 스타일링 영상 캠페인', url: '/sales/proposal/3' },
                { id: 4, name: 'QRT 패션 브랜드 협업 캠페인', url: '/sales/proposal/4' },
                { id: 5, name: 'Glow 스킨케어 제품 사용 후기 캠페인', url: '/sales/proposal/5' },
                { id: 6, name: 'LUNA 쿠션 데일리 메이크업 캠페인', url: '/sales/proposal/6' },
                { id: 7, name: 'VEIL 향수와 함께한 하루 캠페인', url: '/sales/proposal/7' },
                { id: 8, name: 'FLO 브랜드 썸머 스타일링 캠페인', url: '/sales/proposal/8' },
            ],
        },
        {
            id: 202,
            name: '제니',
            nickname: 'jennierubyjane',
            description: '글로벌 럭셔리 브랜드 앰버서더',
            imageUrl: '/images/influencer/jennie.jpg',
            strength: '브랜드 파급력 뛰어남',
            note: '해외 광고 다수',
            platform: {
                instagram: {
                    averageView: 250000,
                    averageLike: 15000,
                    averageComment: 500,
                    followers: 8000000,
                    category: '럭셔리',
                    ageTop1: { label: '20대', rate: '50%' },
                    ageTop2: { label: '10대', rate: '25%' },
                    ageTop3: { label: '30대', rate: '20%' },
                    genderTop1: { label: '여성', rate: '60%' },
                    genderTop2: { label: '남성', rate: '40%' },
                },
                youtube: {
                    averageView: 600000,
                    averageLike: 42000,
                    averageComment: 1700,
                    subscribers: 2300000,
                    category: '뷰티',
                    ageTop1: { label: '20대', rate: '55%' },
                    ageTop2: { label: '30대', rate: '25%' },
                    ageTop3: { label: '10대', rate: '15%' },
                    genderTop1: { label: '여성', rate: '68%' },
                    genderTop2: { label: '남성', rate: '32%' },
                },
            },
            campaignHistory: [
                { id: 1, name: 'UVW 뷰티 디바이스 언박싱 캠페인', url: '/sales/proposal/1' },
                { id: 2, name: 'ABC 샴푸 브랜드 체험 캠페인', url: '/sales/proposal/2' },
                { id: 3, name: 'XYZ 립스틱 스타일링 영상 캠페인', url: '/sales/proposal/3' },
                { id: 4, name: 'QRT 패션 브랜드 협업 캠페인', url: '/sales/proposal/4' },
                { id: 5, name: 'Glow 스킨케어 제품 사용 후기 캠페인', url: '/sales/proposal/5' },
                { id: 6, name: 'LUNA 쿠션 데일리 메이크업 캠페인', url: '/sales/proposal/6' },
                { id: 7, name: 'VEIL 향수와 함께한 하루 캠페인', url: '/sales/proposal/7' },
                { id: 8, name: 'FLO 브랜드 썸머 스타일링 캠페인', url: '/sales/proposal/8' },
            ],
        },
    ],
    username: [
        { id: 2, name: '아이유' },
        { id: 3, name: '김수현' },
        { id: 4, name: '장원영' },
    ],
    status: '보류',
    content: '내용~',
    notes: '피드백고',
    opinions: [],
};

const quotationReferenceList = [
    {
        id: 1,
        title: '[1차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 견적',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-15',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 2,
        title: '[2차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 견적',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-15',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!!!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 3,
        title: '[3차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 견적',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-17',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인99',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 4,
        title: '[4차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 견적 - 최종',
        requestDate: '2025-06-03',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '2주간',
        announcementDate: '2025-06-21',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 300000000,
        supplyAmount: 50000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-05',
        endDate: '2025-06-19',
    },
    {
        id: 5,
        title: '[5차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 견적 - 최최종',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티2' },
        clientManager: { id: 10, name: '김민지' },
        period: '3주간',
        announcementDate: '2025-06-12',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: { id: 201, name: '나연' },
        status: '승인요청',
        price: 350000000,
        supplyAmount: 70000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함!!!',
        notes: '특이사항 없음',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
];

const contractReferenceList = [
    {
        id: 1,
        title: '[1차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 계약',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티' },
        clientManager: { id: 10, name: '송강' },
        period: '2주간',
        announcementDate: '2025-06-15',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: [{ id: 201, name: '나연' }],
        status: '승인요청',
        price: 100000000,
        supplyAmount: 20000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함',
        notes: '특이사항 없음!',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 2,
        title: '[2차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 계약',
        requestDate: '2025-06-05',
        clientCompany: { id: 1, name: 'UVW 뷰티' },
        clientManager: { id: 10, name: '송강' },
        period: '2주간',
        announcementDate: '2025-06-15',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: [{ id: 201, name: '나연' }],
        status: '승인요청',
        price: 100000000,
        supplyAmount: 20000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함',
        notes: '특이사항 없음!!',
        startDate: '2025-06-06',
        endDate: '2025-06-20',
    },
    {
        id: 3,
        title: '[3차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 계약',
        requestDate: '2025-06-06',
        clientCompany: { id: 1, name: 'UVW 뷰티' },
        clientManager: { id: 10, name: '송강' },
        period: '2주간',
        announcementDate: '2025-06-16',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인99',
        username: { id: 100, name: '차은우' },
        influencer: [{ id: 205, name: '아이유' }],
        status: '승인요청',
        price: 100000000,
        supplyAmount: 20000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함',
        notes: '특이사항 없음!',
        startDate: '2025-06-08',
        endDate: '2025-06-08',
    },
    {
        id: 4,
        title: '[4차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 계약',
        requestDate: '2025-06-06',
        clientCompany: { id: 1, name: 'UVW 뷰티' },
        clientManager: { id: 10, name: '송강' },
        period: '2주간',
        announcementDate: '2025-06-16',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인99',
        username: { id: 100, name: '차은우' },
        influencer: [{ id: 205, name: '아이유' }],
        status: '승인요청',
        price: 100000000,
        supplyAmount: 20000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함',
        notes: '특이사항 없음!',
        startDate: '2025-06-08',
        endDate: '2025-06-08',
    },
    {
        id: 5,
        title: '[5차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 계약',
        requestDate: '2025-06-12',
        clientCompany: { id: 1, name: 'UVW 뷰티' },
        clientManager: { id: 10, name: '송강' },
        period: '3주간',
        announcementDate: '2025-06-26',
        pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
        username: { id: 100, name: '차은우' },
        influencer: [{ id: 205, name: '아이유' }],
        status: '승인요청',
        price: 100000,
        supplyAmount: 20000,
        extraProfit: 800000000,
        content: '진행 내용: 인플루언서 선정 및 콘텐츠 제작 일정 포함',
        notes: '특이사항 없음!',
        startDate: '2025-06-11',
        endDate: '2025-06-13',
    },
];

const campaignList = Array.from({ length: 50 }, (_, index) => {
    baseDate.setFullYear(baseDate.getFullYear() + index); // 기준 연도 설정

    return {
        id: index + 1,
        status: '진행중',
        title: `Campaign ${index + 1}`,
        clientCompany: `Company ${index + 1}`,
        clientManagerName: `김동영${index + 1}`,
        clientManagerPosition: '팀장',
        price: index * 1000,
        startDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        endDate: formatDate(new Date(baseDate.getFullYear() + 2, 3, 20)),
        username: '정재현',
        userPosition: '과장',
        productName: `Product ${index + 1}`,
        pipeLine: {
            chance: { date: formatDate(new Date(baseDate.getFullYear(), 2, 20)) },
            listUp: { date: formatDate(new Date(baseDate.getFullYear(), 2, 23)) },
            proposal: { date: formatDate(new Date(baseDate.getFullYear(), 2, 25)) },
            negotiation: { date: formatDate(new Date(baseDate.getFullYear(), 2, 27)) },
        },
    };
});

const proposalList = Array.from({ length: 50 }, (_, index) => {
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + index);

    const statusArr = ['승인완료', '승인요청', '보류/대기', '승인거절'];

    return {
        id: index + 1,
        status: statusArr[Math.floor(Math.random() * 4)],
        title: `Proposal ${index + 1}`,
        createdDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        campaignTitle: `XYZ 패션 브랜드 시즌 프로모션 계약`,
        clientCompany: `Company ${index + 1}`,
        clientManagerName: '김동영',
        clientManagerPosition: '팀장',
        userName: '정재현',
        userPosition: '과장',
        requestDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        presentDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
    };
});

const quotationList = Array.from({ length: 50 }, (_, index) => {
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + index);

    const statusArr = ['승인완료', '승인요청', '보류/대기', '승인거절'];

    return {
        id: index + 1,
        status: statusArr[Math.floor(Math.random() * 4)],
        title: `Quotation ${index + 1}`,
        createdDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        campaignTitle: `XYZ 패션 브랜드 시즌 프로모션 계약`,
        clientCompany: `Company ${index + 1}`,
        clientManagerName: '김동영',
        clientManagerPosition: '팀장',
        userName: '정재현',
        userPosition: '과장',
        productName: '조던 브루클린 플리스 풀오버 후디',
        adPrice: 30000000,
        requestDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        presentDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
    };
});

const contractList = Array.from({ length: 50 }, (_, index) => {
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + index);

    const statusArr = ['승인완료', '승인요청', '보류/대기', '승인거절'];

    return {
        id: index + 1,
        status: statusArr[Math.floor(Math.random() * 4)],
        title: `Contract ${index + 1}`,
        createdDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        campaignTitle: `XYZ 패션 브랜드 시즌 프로모션 계약`,
        clientCompany: `Company ${index + 1}`,
        clientManagerName: '김동영',
        clientManagerPosition: '팀장',
        userName: '정재현',
        userPosition: '과장',
        productName: '조던 브루클린 플리스 풀오버 후디',
        adPrice: 30000000,
        requestDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        presentDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
    };
});

const revenueList = Array.from({ length: 50 }, (_, index) => {
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + index);

    const statusArr = ['승인완료', '승인요청', '보류/대기', '승인거절'];

    return {
        id: index + 1,
        status: statusArr[Math.floor(Math.random() * 4)],
        title: `Revenue ${index + 1}`,
        createdDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        campaignTitle: `XYZ 패션 브랜드 시즌 프로모션 계약`,
        clientCompany: `Company ${index + 1}`,
        clientManagerName: '김동영',
        clientManagerPosition: '팀장',
        userName: '정재현',
        userPosition: '과장',
        productName: '조던 브루클린 플리스 풀오버 후디',
        adPrice: 30000000,
        requestDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        presentDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
    };
});

const ListUpList = Array.from({ length: 50 }, (_, index) => {
    const baseDate = new Date();
    baseDate.setFullYear(baseDate.getFullYear() + index);

    return {
        id: index + 1,
        // status: statusArr[Math.floor(Math.random() * 4)],
        title: `ListUp ${index + 1}`,
        createdDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        campaignTitle: `XYZ 패션 브랜드 시즌 프로모션 계약`,
        clientCompany: `Company ${index + 1}`,
        clientManagerName: '김동영',
        clientManagerPosition: '팀장',
        userName: '정재현',
        userPosition: '과장',
        productName: '조던 브루클린 플리스 풀오버 후디',
        influencers: [
            { id: 1, name: '지무비' },
            { id: 2, name: '감자탕' },
            { id: 3, name: '맛피자' },
            { id: 4, name: '감스트' },
        ],
        requestDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        presentDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
    };
});
const campaignResultList = Array.from({ length: 50 }, (_, index) => {
    baseDate.setFullYear(baseDate.getFullYear() + index); // 기준 연도 설정

    return {
        id: index + 1,
        title: `김치 탕후루 캠페인 ${index + 1}`,
        clientCompany: `Company ${index + 1}`,
        clientManagerName: `김동영${index + 1}`,
        clientManagerPosition: '팀장',
        influencers: [
            { id: 201, name: '나연' },
            { id: 202, name: '정국' },
        ],
        price: index * 1000,
        startDate: formatDate(new Date(baseDate.getFullYear() + 2, 2, 20)),
        endDate: formatDate(new Date(baseDate.getFullYear() + 2, 3, 20)),
        userName: '정재현',
        userPosition: '과장',
        productName: `Product ${index + 1}`,
    };
});
const revenueDetail = {
    title: '[2차] UVW 뷰티 디바이스 안멸성 캠페인 인플루언서 매출',
    requestDate: '2025-06-05',
    clientCompany: { id: 1, name: 'UVW 뷰티' },
    clientManager: { id: 10, name: '송강' },
    period: '2주간',
    announcementDate: '2025-06-15',
    pipeline: 'UVW 뷰티 디바이스 언박싱 캠페인',
    username: { id: 100, name: '차은우' },
    influencer: [
        { id: 201, name: '나연' },
        { id: 202, name: '정국' },
    ],
    influencerContents: [
        {
            influencerId: 201,
            name: '나연',
            platform: 'youtube',
            url: 'https://youtube.com/watch?v=xxxxxx',
        },
        {
            influencerId: 202,
            name: '정국',
            platform: 'instagram',
            url: 'https://instagram.com/p/yyyyyy',
        },
    ],
    status: '승인요청',
    adPrice: 100000000,
    productPrice: 20000,
    salesQuantity: 1000,
    content: '판매 내용: 제품 판매 수익 기록',
    notes: '특이사항 없음',
    startDate: '2025-06-06',
    endDate: '2025-06-20',
    showInfluencerContentInput: true,
};

const eventList = [
    {
        title: '워크샵',
        scheduleDate: '2025-06-19',
        startTime: '09:00:00',
        endTime: '18:00:00',
        hexCode: '#f87171',
    },
    {
        title: '휴가',
        scheduleDate: '2025-06-19',
        startTime: '09:00:00',
        endTime: '18:00:00',
        hexCode: '#f97316',
    },
    {
        title: '출장',
        scheduleDate: '2025-06-19',
        startTime: '09:00:00',
        endTime: '18:00:00',
        hexCode: '#FFD863',
    },
    {
        title: '외출',
        scheduleDate: '2025-06-19',
        startTime: '09:00:00',
        endTime: '18:00:00',
        hexCode: '#83D4FF',
    },
];

const CampaignHandler = [
    http.get('/api/v1/campaign', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const size = parseInt(url.searchParams.get('size')) || 10;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = campaignList.slice(startIndex, endIndex);

        return HttpResponse.json(
            {
                data: pagedData,
                page,
                size,
                total: campaignList.length,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/campaign/dashboard', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const size = parseInt(url.searchParams.get('size')) || 10;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = campaignResultList.slice(startIndex, endIndex);

        return HttpResponse.json(
            {
                data: pagedData,
                page,
                size,
                total: campaignResultList.length,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/campaign/:id', async () => {
        return HttpResponse.json(
            {
                data: campaignDetail,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/campaign/history/:id', async () => {
        return HttpResponse.json(
            { data: pipelineList },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/opinion', async () => {
        return HttpResponse.json(
            {
                data: opinionList,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/sales/quotation/:id', async () => {
        return HttpResponse.json(
            {
                data: quotationDetail,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/popup/user', async () => {
        return HttpResponse.json(
            { data: userList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/popup/user/email', async () => {
        return HttpResponse.json(
            { data: userListNameAndEmail },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),

    http.get('/api/v1/popup/client-company', async () => {
        return HttpResponse.json(
            { data: clientCompanyList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),

    http.get('/api/v1/popup/client-manager', async () => {
        return HttpResponse.json(
            { data: clientManagerList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/popup/influencer', async () => {
        return HttpResponse.json(
            { data: influencerList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/popup/pipeline', async () => {
        return HttpResponse.json(
            { data: pipelinePopupList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/proposal/reference', async () => {
        return HttpResponse.json(
            { data: proposalReferenceList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/contract/reference', async () => {
        return HttpResponse.json(
            { data: contractReferenceList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/sales/listup', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const size = parseInt(url.searchParams.get('size')) || 10;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = ListUpList.slice(startIndex, endIndex);

        return HttpResponse.json(
            {
                data: pagedData,
                page,
                size,
                total: quotationList.length,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/sales/proposal', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const size = parseInt(url.searchParams.get('size')) || 10;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = proposalList.slice(startIndex, endIndex);

        return HttpResponse.json(
            {
                data: pagedData,
                page,
                size,
                total: proposalList.length,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/sales/proposal/:id', async () => {
        return HttpResponse.json(
            {
                data: proposalDetail,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/sales/quotation', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const size = parseInt(url.searchParams.get('size')) || 10;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = quotationList.slice(startIndex, endIndex);

        return HttpResponse.json(
            {
                data: pagedData,
                page,
                size,
                total: quotationList.length,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/sales/contract', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const size = parseInt(url.searchParams.get('size')) || 10;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = contractList.slice(startIndex, endIndex);

        return HttpResponse.json(
            {
                data: pagedData,
                page,
                size,
                total: quotationList.length,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/sales/contract/:id', async () => {
        return HttpResponse.json(
            {
                data: contractDetail,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/quotation/reference', async () => {
        return HttpResponse.json(
            { data: quotationReferenceList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/listup/reference', async () => {
        return HttpResponse.json(
            { data: listupReferenceList },
            { status: 200, headers: { 'Cache-Control': 'no-store' } },
        );
    }),
    http.get('/api/v1/sales/revenue', async ({ request }) => {
        const url = new URL(request.url);
        const page = parseInt(url.searchParams.get('page')) || 1;
        const size = parseInt(url.searchParams.get('size')) || 10;

        const startIndex = (page - 1) * size;
        const endIndex = startIndex + size;
        const pagedData = revenueList.slice(startIndex, endIndex);

        return HttpResponse.json(
            {
                data: pagedData,
                page,
                size,
                total: quotationList.length,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/sales/revenue/:id', async () => {
        return HttpResponse.json(
            {
                data: revenueDetail,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.post('/api/v1/influencer/detail', async (req) => {
        const ids = await req.request.json();

        console.log('받은 ids:', ids);

        const result = influencerDetail.filter((item) => ids.includes(item.id));

        return HttpResponse.json(
            {
                data: result,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
    http.get('/api/v1/calendar/:date', async () => {
        return HttpResponse.json(
            {
                data: eventList,
            },
            {
                status: 200,
                headers: { 'Cache-Control': 'no-store' },
            },
        );
    }),
];

export default CampaignHandler;
