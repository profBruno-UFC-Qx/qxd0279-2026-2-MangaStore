import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import Home from '@/pages/Home.vue'
import MangaDetail from '@/pages/MangaDetail.vue'
import Login from '@/pages/Login.vue'
import Register from '@/pages/Register.vue'
import NotFound from '@/pages/NotFound.vue'
import HomeAdmin from '@/pages/admin/HomeAdmin.vue'
import MangaForm from '@/pages/admin/MangaForm.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home,
  },
  {
    path: '/manga/new',
    name: 'manga-new',
    component: MangaForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/manga/edit/:id',
    name: 'manga-edit',
    component: MangaForm,
    meta: { requiresAuth: true },
  },
  {
    path: '/manga/:id',
    name: 'manga-detail',
    component: MangaDetail,
  },
  {
    path: '/admin',
    name: 'admin',
    component: HomeAdmin,
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
  },
  {
    path: '/notFound',
    name: 'not-found',
    component: NotFound,
  },
  { path: '/:pathMatch(.*)*', name: 'catch-all', component: NotFound },
]

export const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach(async (to) => {
  if (to.meta.requiresAuth) {
    const authStore = useAuthStore()
    await authStore.fetchMe()

    if (!authStore.isAdmin) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }
  }
})
