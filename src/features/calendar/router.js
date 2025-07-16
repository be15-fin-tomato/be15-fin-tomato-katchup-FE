export const calendarRoutes = [
  {
    path: '/calendar',
    name: 'calendar',
    component: () => import('@/features/calendar/views/CalendarView.vue'),
  },
    {
        path: '/sales/:step/:pipelineId',
        name: 'SalesDetail',
        component: () => import('@/features/campaign/views/SalesDetailRouter.vue'),
    }
]
