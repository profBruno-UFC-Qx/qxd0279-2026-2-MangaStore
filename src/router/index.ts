import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/pages/Home.vue'
import MangaDetail from '@/pages/MangaDetail.vue'

const routes = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/detail',
    component: MangaDetail,
  },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})
