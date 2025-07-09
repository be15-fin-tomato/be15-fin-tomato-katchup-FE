import ClientListView from './views/ClientListView.vue'
// import ClientDetailView from '@/features/advertisement/views/ClientDetailView.vue';
import ClientCreateView from '@/features/advertisement/views/ClientCreateView.vue';
import ClientDetailView from '@/features/advertisement/views/ClientDetailView.vue';

export const advertisementRoutes = [
  // 고객사 목록 조회
  {
    path: '/management/client',
    name: 'ClientList',
    component: ClientListView,
  },
  // 고객사 등록
  {
    path: '/management/client/new',
    name: 'ClientCreate',
    component: ClientCreateView,
  },
  // 고객사 상세 조회/수정/삭제
  {
    path: '/management/client/:id/detail',
    name: 'ClientDetail',
    component: ClientDetailView,
  }
]
