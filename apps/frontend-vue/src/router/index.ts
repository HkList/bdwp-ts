import { useUserStore } from '@frontend/stores/userStore'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { DashboardFilled } from '@vicons/antd'
import { Desktop, Home, LogIn, Search, Share } from '@vicons/ionicons5'
import { loadingBar } from '@frontend/utils/discreteApi.ts'

type BaseRouteRecordRawPlus = Omit<RouteRecordRaw, 'meta' | 'children' | 'component'> & {
  meta: {
    title: string
    icon?: ReturnType<typeof renderIcon>
  }
}

export type RouteRecordRawPlus = BaseRouteRecordRawPlus &
  (
    | {
        component: RouteRecordRaw['component']
        children?: never
      }
    | {
        component: RouteRecordRaw['component']
        children: RouteRecordRawPlus[]
      }
    | {
        component?: never
        children?: RouteRecordRawPlus[]
      }
  )

export const ADMIN_ROUTES: RouteRecordRawPlus[] = [
  {
    path: '/admin/dashboard',
    meta: { title: '仪表盘', icon: renderIcon(DashboardFilled) },
    component: () => import('@frontend/views/Admin/Dashboard.vue'),
  },
]

export const routes: RouteRecordRawPlus[] = [
  {
    path: '/',
    component: () => import('@frontend/layouts/AppLayout.vue'),
    meta: { title: '首页', icon: renderIcon(Home) },
    children: [
      {
        path: '/parse',
        meta: { title: '解析页', icon: renderIcon(Share) },
        component: () => import('@frontend/views/User/Parse.vue'),
      },
    ],
  },
  {
    path: '/sign_in',
    meta: { title: '登录', icon: renderIcon(LogIn) },
    component: () => import('@frontend/views/SignIn.vue'),
  },
  {
    path: '/admin',
    component: () => import('@frontend/layouts/AdminLayout/index.vue'),
    meta: { title: '管理后台首页', icon: renderIcon(Desktop) },
    redirect: '/admin/dashboard',
    children: ADMIN_ROUTES,
  },
  {
    path: '/404',
    meta: { title: '404', icon: renderIcon(Search) },
    component: () => import('@frontend/layouts/NotFoundLayout.vue'),
  },
  {
    path: '/:pathMatch(.*)*',
    meta: { title: '404', icon: renderIcon(Search) },
    redirect: '/404',
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes as RouteRecordRaw[],
})

router.beforeEach((to) => {
  loadingBar.start()

  if (to.path.includes('/admin')) {
    const userStore = useUserStore()
    if (!userStore.isAuthenticated) {
      return '/sign_in'
    }
  } else if (to.path === '/sign_in') {
    const userStore = useUserStore()
    if (userStore.isAuthenticated) {
      return '/admin'
    }
  }
})

router.afterEach(() => {
  loadingBar.finish()
})

export { router }
