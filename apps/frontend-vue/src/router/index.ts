import type { RouteRecordRaw } from 'vue-router'

import { useAuthStore } from '@frontend/stores/authStore.ts'
import { loadingBar } from '@frontend/utils/discreteApi.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Desktop, Earth, Home, LogIn, People, Person, Search, Share, ShareSocial } from '@vicons/ionicons5'
import { createRouter, createWebHistory } from 'vue-router'

type BaseRouteRecordRawPlus = Omit<RouteRecordRaw, 'children' | 'component' | 'meta'> & {
  meta: {
    icon?: ReturnType<typeof renderIcon>
    title: string
    needAdmin?: boolean
  }
}

export type RouteRecordRawPlus = BaseRouteRecordRawPlus
  & (
    | {
      children: RouteRecordRawPlus[]
      component: RouteRecordRaw['component']
    }
    | {
      children?: never
      component: RouteRecordRaw['component']
    }
    | {
      children?: RouteRecordRawPlus[]
      component?: never
    }
  )

export const ADMIN_ROUTES: RouteRecordRawPlus[] = [
  {
    component: () => import('@frontend/views/Admin/Dashboard.vue'),
    meta: { icon: renderIcon(Earth), title: '仪表盘' },
    path: '/admin/dashboard',
  },
  {
    component: () => import('@frontend/views/Admin/Users/Index.vue'),
    meta: { icon: renderIcon(People), title: '用户管理', needAdmin: true },
    path: '/admin/users',
  },
  {
    component: () => import('@frontend/views/Admin/Accounts/Index.vue'),
    meta: { icon: renderIcon(Person), title: '账号管理' },
    path: '/admin/accounts',
  },
  {
    component: () => import('@frontend/views/Admin/ShareLinks/Index.vue'),
    meta: { icon: renderIcon(ShareSocial), title: '分享链接管理' },
    path: '/admin/share_links',
  },
]

export const routes: RouteRecordRawPlus[] = [
  {
    children: [
      {
        component: () => import('@frontend/views/User/Parse.vue'),
        meta: { icon: renderIcon(Share), title: '解析页' },
        path: '/parse',
      },
    ],
    component: () => import('@frontend/layouts/AppLayout.vue'),
    meta: { icon: renderIcon(Home), title: '首页' },
    path: '/',
  },
  {
    component: () => import('@frontend/views/SignIn.vue'),
    meta: { icon: renderIcon(LogIn), title: '登录' },
    path: '/sign_in',
  },
  {
    children: ADMIN_ROUTES,
    component: () => import('@frontend/layouts/AdminLayout/index.vue'),
    meta: { icon: renderIcon(Desktop), title: '管理后台首页' },
    path: '/admin',
    redirect: '/admin/dashboard',
  },
  {
    component: () => import('@frontend/views/NotFound.vue'),
    meta: { icon: renderIcon(Search), title: '404' },
    path: '/404',
  },
  {
    meta: { icon: renderIcon(Search), title: '404' },
    path: '/:pathMatch(.*)*',
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
    const authStore = useAuthStore()
    if (!authStore.isAuthenticated) {
      return '/sign_in'
    }
  }
  else if (to.path === '/sign_in') {
    const authStore = useAuthStore()
    if (authStore.isAuthenticated) {
      return '/admin'
    }
  }
})

router.afterEach(() => {
  loadingBar.finish()
})

export { router }
