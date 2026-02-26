import type { RouteRecordRawPlus } from '@frontend/router/index.ts'
import type { RenderIconReturn } from '@frontend/utils/renderIcon.ts'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export interface Breadcrumb {
  icon?: RenderIconReturn
  path: string
  route: RouteRecordRawPlus
  title: string
}

export function useBreadcrumbs() {
  const route = useRoute()

  // 面包屑导航
  const breadcrumbs = computed<Breadcrumb[]>(() => {
    return route.matched.map<Breadcrumb>((item) => {
      const typedRoute = item as unknown as RouteRecordRawPlus

      return {
        icon: typedRoute.meta.icon,
        path: typedRoute.path,
        route: typedRoute,
        title: typedRoute.meta.title,
      }
    })
  })

  return {
    breadcrumbs,
  }
}
