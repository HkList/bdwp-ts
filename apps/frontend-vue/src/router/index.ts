import { useUserStore } from '@frontend/stores/userStore'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import { DashboardFilled } from '@vicons/antd'

type BaseRouteRecordRawPlus = Omit<
  RouteRecordRaw,
  'meta' | 'children' | 'component' | 'redirect'
> & {
  meta: {
    title: string
    icon?: ReturnType<typeof renderIcon>
  }
}

export type RouteRecordRawPlus = BaseRouteRecordRawPlus &
  (
    | {
        component: RouteRecordRaw['component']
        redirect?: RouteRecordRaw['redirect']
        children?: never
      }
    | {
        component: RouteRecordRaw['component']
        redirect: RouteRecordRaw['redirect']
        children: RouteRecordRawPlus[]
      }
    | {
        component?: never
        redirect: RouteRecordRaw['redirect']
        children?: RouteRecordRawPlus[]
      }
  )

export const ADMIN_ROUTES: RouteRecordRawPlus[] = [
  {
    path: '/admin/dashboard',
    meta: { title: '仪表盘', icon: renderIcon(DashboardFilled) },
    component: () => import('@frontend/views/admin/Dashboard.vue'),
  },
  {
    path: '/admin/users',
    meta: { title: '用户管理', icon: renderIcon(DashboardFilled) },
    redirect: '/admin/users2',
    children: [
      {
        path: '/admin/users2',
        meta: { title: '仪表盘2', icon: renderIcon(DashboardFilled) },
        redirect: '/admin/users22',
        children: [
          {
            path: '/admin/users22',
            meta: { title: '仪表盘2', icon: renderIcon(DashboardFilled) },
            component: () => import('@frontend/views/SignIn.vue'),
          },
        ],
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      component: () => import('@frontend/layouts/AppLayout.vue'),
      children: [
        {
          path: '/',
          component: () => import('@frontend/views/Home.vue'),
        },
      ],
    },
    {
      path: '/sign_in',
      component: () => import('@frontend/views/SignIn.vue'),
    },
    {
      path: '/admin',
      component: () => import('@frontend/layouts/AdminLayout.vue'),
      redirect: '/admin/dashboard',
      children: ADMIN_ROUTES as RouteRecordRaw[],
    },
    {
      path: '/404',
      component: () => import('@frontend/layouts/NotFoundLayout.vue'),
    },
    {
      path: '/:pathMatch(.*)*',
      redirect: '/404',
    },
  ],
})

router.beforeEach((to) => {
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

export { router }
