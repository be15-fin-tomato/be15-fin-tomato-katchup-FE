import { http, HttpResponse } from 'msw'

const youtubeMock = {
  '1': {
    meta: {
      id: "abc123",
      thumbnail: "/mock/thumbnail.jpg",
      title: "테스트 영상 제목",
      publishedAt: "2025-06-05T12:00:00Z",
      statistics: {
        viewCount: 302000,
        likeCount: 54000,
        commentCount: 1700,
        clickCount: 3700
      }
    },

    analytics: {
      daily: {
        columnHeaders: [
          { name: "day", columnType: "DIMENSION", dataType: "STRING" },
          { name: "views", columnType: "METRIC", dataType: "INTEGER" },
          { name: "comments", columnType: "METRIC", dataType: "INTEGER" },
          { name: "likes", columnType: "METRIC", dataType: "INTEGER" },
          { name: "estimatedMinutesWatched", columnType: "METRIC", dataType: "INTEGER" }
        ],
        rows: [
          ["2025-06-01", 54320, 120, 3200, 5000],
          ["2025-06-02", 50120, 110, 3100, 4500],
          ["2025-06-03", 49230, 100, 3000, 4300],
          ["2025-06-04", 48800, 90, 2800, 4200],
          ["2025-06-05", 47980, 85, 2700, 4000],
          ["2025-06-06", 49950, 95, 2900, 4100],
          ["2025-06-07", 49831, 93, 2850, 4050]
        ]
      },
      weekly: {
        columnHeaders: [
          { name: "week", columnType: "DIMENSION", dataType: "STRING" },
          { name: "views", columnType: "METRIC", dataType: "INTEGER" },
          { name: "comments", columnType: "METRIC", dataType: "INTEGER" },
          { name: "likes", columnType: "METRIC", dataType: "INTEGER" },
          { name: "estimatedMinutesWatched", columnType: "METRIC", dataType: "INTEGER" }
        ],
        rows: [
          ["2025-05-01", 350000, 700, 18000, 30000],
          ["2025-05-08", 330000, 650, 16000, 28000],
          ["2025-05-15", 310000, 600, 15000, 26000],
          ["2025-05-22", 300000, 580, 14000, 25000]
        ]
      },
      monthly: {
        columnHeaders: [
          { name: "month", columnType: "DIMENSION", dataType: "STRING" },
          { name: "views", columnType: "METRIC", dataType: "INTEGER" },
          { name: "comments", columnType: "METRIC", dataType: "INTEGER" },
          { name: "likes", columnType: "METRIC", dataType: "INTEGER" },
          { name: "estimatedMinutesWatched", columnType: "METRIC", dataType: "INTEGER" }
        ],
        rows: [
          ["2025-01-01", 1400000, 3000, 70000, 120000],
          ["2025-02-01", 1350000, 2800, 68000, 115000],
          ["2025-03-01", 1300000, 2600, 66000, 110000],
          ["2025-04-01", 1250000, 2500, 64000, 105000],
          ["2025-05-01", 1200000, 2400, 62000, 100000]
        ]
      }
    }
  }
}

export const YoutubeMockHandler = [
  http.get('/api/v1/youtube/analytics', ({ request }) => {
    const url = new URL(request.url)
    const campaignId = url.searchParams.get('campaignId')
    const groupType = url.searchParams.get('groupType') || 'daily'

    const data = youtubeMock[campaignId]

    if (!data || !data.analytics[groupType]) {
      return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
    }

    return HttpResponse.json({
      kind: "youtubeAnalytics#resultTable",
      columnHeaders: data.analytics[groupType].columnHeaders,
      rows: data.analytics[groupType].rows
    })
  }),

  http.get('/api/v1/youtube/video', ({ request }) => {
    const url = new URL(request.url)
    const campaignId = url.searchParams.get('campaignId')
    const data = youtubeMock[campaignId]

    if (!data || !data.meta) {
      return HttpResponse.json({ message: 'Not Found' }, { status: 404 })
    }

    return HttpResponse.json(data.meta)
  })
]
