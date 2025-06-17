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

const googleSearchDataMock = {
  kind: "customsearch#search",
  url: {
    type: "application/json",
    template: "https://www.googleapis.com/customsearch/v1?q={searchTerms}&start={startIndex?}&num={count?}&key={yourAPIKey}&cx={cx}"
  },
  queries: {
    request: [
      {
        title: "Google Custom Search - 다이어트",
        totalResults: "19091506",
        searchTerms: "다이어트",
        count: 10,
        startIndex: 1
      }
    ]
  },
  searchInformation: {
    searchTime: 0.456,
    formattedSearchTime: "0.46",
    totalResults: "19091506",
    formattedTotalResults: "19,091,506"
  },
  items: [
    {
      title: "스위치온 다이어트 후기 식단 영양제 꿀팁",
      link: "https://blog.naver.com/hynam88/223882421206",
      snippet: "다이어트가 살이 잘 빠진다고 엄청 핫하더라고요. 저도 정독하고 도전해봤는데 2주만에 5kg 감량에 성공했어요!",
      displayLink: "blog.naver.com",
      pagemap: {
        metatags: [
          {
            bloggername: "보리여니맘의 기억저장소",
            postdate: "20250529"
          }
        ]
      }
    },
    {
      title: "스위치온 다이어트 후기 3일 4주차 -6kg",
      link: "https://blog.naver.com/eunbyeol11/223881792394",
      snippet: "이번만큼은 독하게 살을 한번 빼야겠다 싶어서 시작해보았어요. 3일만에 바로 감량 시작...",
      displayLink: "blog.naver.com",
      pagemap: {
        metatags: [
          {
            bloggername: "반짝벼리별",
            postdate: "20250529"
          }
        ]
      }
    }
  ]
}

const googleTrendsDataMock = {
  default: {
    timelineData: [
      {
        time: 1715817600,
        formattedTime: "2024년 5월 16일",
        formattedAxisTime: "2024년 5월 16일",
        value: [78],
        hasData: [true],
        formattedValue: ["78"]
      },
      {
        time: 1716422400,
        formattedTime: "2024년 5월 23일",
        formattedAxisTime: "2024년 5월 23일",
        value: [82],
        hasData: [true],
        formattedValue: ["82"]
      },
      {
        time: 1717027200,
        formattedTime: "2024년 5월 30일",
        formattedAxisTime: "2024년 5월 30일",
        value: [90],
        hasData: [true],
        formattedValue: ["90"]
      },
      {
        time: 1717632000,
        formattedTime: "2024년 6월 6일",
        formattedAxisTime: "2024년 6월 6일",
        value: [95],
        hasData: [true],
        formattedValue: ["95"]
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
