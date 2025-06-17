import { http, HttpResponse } from 'msw';

const searchDataMock = {
  '1': {
    "startDate": "2025-06-02",
    "endDate": "2025-06-09",
    "timeUnit": "date",
    "results": [
      {
        "title": "COMPACT 폴딩백 하이킹 경량 백팩 20L",
        "keywords": ["COMPACT 폴딩백 하이킹 경량 백팩 20L"],
        "data": [
          { "period": "2025-06-02", "ratio": 100 },
          { "period": "2025-06-03", "ratio": 91.32 },
          { "period": "2025-06-04", "ratio": 98.70 },
          { "period": "2025-06-05", "ratio": 86.19 },
          { "period": "2025-06-06", "ratio": 74.74 },
          { "period": "2025-06-07", "ratio": 77.79 },
          { "period": "2025-06-08", "ratio": 98.70 }
        ]
      }
    ]
  },

  '2': {
    "startDate": "2025-06-10",
    "endDate": "2025-06-17",
    "timeUnit": "date",
    "results": [
      {
        "title": "헬스장",
        "keywords": ["헬스장"],
        "data": [
          { "period": "2025-06-10", "ratio": 85.00 },
          { "period": "2025-06-11", "ratio": 80.50 },
          { "period": "2025-06-12", "ratio": 88.20 },
          { "period": "2025-06-13", "ratio": 90.10 },
          { "period": "2025-06-14", "ratio": 95.00 },
          { "period": "2025-06-15", "ratio": 78.00 },
          { "period": "2025-06-16", "ratio": 85.50 }
        ]
      }
    ]
  },

  '3': {
    "startDate": "2025-06-01",
    "endDate": "2025-06-07",
    "timeUnit": "date",
    "results": [
      {
        "title": "식단",
        "keywords": ["식단", "다이어트식단"],
        "data": [
          { "period": "2025-06-01", "ratio": 92.00 },
          { "period": "2025-06-02", "ratio": 88.50 },
          { "period": "2025-06-03", "ratio": 85.00 },
          { "period": "2025-06-04", "ratio": 90.00 },
          { "period": "2025-06-05", "ratio": 87.00 },
          { "period": "2025-06-06", "ratio": 93.50 },
          { "period": "2025-06-07", "ratio": 95.00 }
        ]
      }
    ]
  }
};

const googleTrendsDataMock = {
  default: {
    timelineData: [
      {
        time: 1748812800,
        formattedTime: "2025년 6월 2일",
        formattedAxisTime: "2025년 6월 2일",
        value: [80],
        hasData: [true],
        formattedValue: ["80"]
      },
      {
        time: 1748899200,
        formattedTime: "2025년 6월 3일",
        formattedAxisTime: "2025년 6월 3일",
        value: [85],
        hasData: [true],
        formattedValue: ["85"]
      },
      {
        time: 1748985600,
        formattedTime: "2025년 6월 4일",
        formattedAxisTime: "2025년 6월 4일",
        value: [90],
        hasData: [true],
        formattedValue: ["90"]
      },
      {
        time: 1749072000,
        formattedTime: "2025년 6월 5일",
        formattedAxisTime: "2025년 6월 5일",
        value: [95],
        hasData: [true],
        formattedValue: ["95"]
      },
      {
        time: 1749158400,
        formattedTime: "2025년 6월 6일",
        formattedAxisTime: "2025년 6월 6일",
        value: [93],
        hasData: [true],
        formattedValue: ["93"]
      },
      {
        time: 1749244800,
        formattedTime: "2025년 6월 7일",
        formattedAxisTime: "2025년 6월 7일",
        value: [89],
        hasData: [true],
        formattedValue: ["89"]
      },
      {
        time: 1749331200,
        formattedTime: "2025년 6월 8일",
        formattedAxisTime: "2025년 6월 8일",
        value: [91],
        hasData: [true],
        formattedValue: ["91"]
      }
    ]
  }
}

export const SearchDataHandler = [
  http.get('/api/v1/dashboard/naver', ({ request }) => {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    const data = searchDataMock[id];

    if (!data) {
      return HttpResponse.json({ message: 'Not Found' }, { status: 404 });
    }

    return HttpResponse.json(data);
  }),

  http.get('/api/v1/dashboard/google', ({ request }) => {
    return HttpResponse.json(googleSearchDataMock);
  }),

  http.get('/api/v1/dashboard/google/trends', ({ request }) => {
    return HttpResponse.json(googleTrendsDataMock);
  })
];
