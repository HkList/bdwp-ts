import type { RenderIconReturn } from '@frontend/utils/renderIcon.ts'
import type { RouteRecordRaw } from 'vue-router'

import { useUserStore } from '@frontend/stores/userStore.ts'
import { loadingBar } from '@frontend/utils/discreteApi.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Desktop, Home, Key, LogIn, People, Person, Search, Share, ShareSocial } from '@vicons/ionicons5'
import { createRouter, createWebHistory } from 'vue-router'

type BaseRouteRecordRawPlus = Omit<RouteRecordRaw, 'children' | 'component' | 'meta'> & {
  meta: {
    icon?: RenderIconReturn
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
  {
    component: () => import('@frontend/views/Admin/Keys/Index.vue'),
    meta: { icon: renderIcon(Key), title: '卡密管理' },
    path: '/admin/keys',
  },
]

export const routes: RouteRecordRawPlus[] = [
  {
    children: [
      {
        component: () => import('@frontend/views/NotFound.vue'),
        meta: { icon: renderIcon(Search), title: '404' },
        path: '/404',
      },
      {
        component: () => import('@frontend/views/User/Home.vue'),
        meta: { icon: renderIcon(Home), title: '首页' },
        path: '/',
      },
      {
        component: () => import('@frontend/views/User/Key/Index.vue'),
        meta: { icon: renderIcon(Share), title: '解析页' },
        path: '/key/:key',
      },
    ],
    component: () => import('@frontend/layouts/CardLayout.vue'),
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
    redirect: '/admin/users',
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
  const userStore = useUserStore()
  loadingBar.start()

  if (to.path.includes('/admin')) {
    if (!userStore.isAuthenticated) {
      return '/sign_in'
    }
  }
  else if (to.path === '/sign_in') {
    if (userStore.isAuthenticated) {
      return '/admin'
    }
  }
})

router.afterEach(() => {
  loadingBar.finish()
})

export { router }
