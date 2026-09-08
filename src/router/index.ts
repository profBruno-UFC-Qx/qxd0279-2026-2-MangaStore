import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import MangaDetail from '@/pages/MangaDetail.vue'
import NotFound from '@/pages/NotFound.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/manga/:id',
    name: 'manga-detail',
    component: MangaDetail,
  },
  {
    path: '/notFound',
    component: NotFound,
  },
  { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
