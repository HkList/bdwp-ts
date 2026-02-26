import type { RouteRecordRawPlus } from '@frontend/router/index.ts'
import type { RenderIconReturn } from '@frontend/utils/renderIcon.ts'

import type { MaybePromise } from '@frontend/utils/types.ts'
import { router } from '@frontend/router/index.ts'
import { useStorage } from '@vueuse/core'
import { ref } from 'vue'
import { useRouter } from 'vue-router'

export interface RouteTab {
  icon?: RenderIconReturn
  path: string
  pinned: boolean
  title: string
}

export type RouteTabs = Record<string, RouteTab>

export const ROUTE_TABS_KEY = 'BDWP_ROUTE_TABS'
export const ROUTE_TABS_ORDER_KEY = 'BDWP_ROUTE_TABS_ORDER'

export const tabs = useStorage<RouteTabs>(ROUTE_TABS_KEY, {})
export const tabsOrder = useStorage<string[]>(ROUTE_TABS_ORDER_KEY, [])
export const activeTab = ref('')

export async function useRouteTabs(checker?: (path: string) => MaybePromise<boolean>) {
  router.afterEach(async (to, _, failure) => {
    const typedTo = to as unknown as RouteRecordRawPlus

    if (failure || (checker && !(await checker(typedTo.path)))) {
      return
    }

    tabs.value[typedTo.path] = {
      icon: typedTo.meta.icon,
      path: typedTo.path,
      pinned: false,
      title: typedTo.meta.title,
    }

    if (!tabsOrder.value.includes(typedTo.path)) {
      tabsOrder.value.push(typedTo.path)
    }

    activeTab.value = typedTo.path
  })

  const routes = router.getRoutes()
  const routesSet = Object.fromEntries(routes.map(r => [r.path, r]))

  for (const path in tabs.value) {
    const element = tabs.value[path]
    const route = routesSet[path]

    if (!element || !route) {
      delete tabs.value[path]
      continue
    }

    element.icon = route.meta.icon as RenderIconReturn
  }

  // 确保所有标签都在 order 中
  for (const path of Object.keys(tabs.value)) {
    if (!tabsOrder.value.includes(path)) {
      tabsOrder.value.push(path)
    }
  }

  // 过滤掉 order 中不存在的标签
  tabsOrder.value = tabsOrder.value.filter(
    (path): path is string => typeof path === 'string' && path in tabs.value,
  )
}

export function switchTab(path: string, preflight = false) {
  const index = tabsOrder.value.indexOf(path)
  if (index === -1) {
    return
  }

  let nextIndex: number
  if (preflight) {
    nextIndex = tabsOrder.value[index + 1] !== undefined ? index + 1 : index - 1
  }
  else {
    nextIndex = tabsOrder.value[index] !== undefined ? index : index - 1
  }

  const newTab = tabsOrder.value[nextIndex]
  if (!newTab)
    throw new Error('没有可切换的标签了')

  activeTab.value = newTab
  useRouter().push(activeTab.value)
}

export function closeTab(path: string) {
  // 判断标签是否存在
  const index = tabsOrder.value.indexOf(path)
  if (index === -1) {
    return
  }

  delete tabs.value[path]
  tabsOrder.value.splice(index, 1)

  // 如果关闭的标签是当前激活的标签，切换到下一个标签
  if (activeTab.value === path) {
    switchTab(path)
  }
}

export function updateTabsOrder(newOrder: string[]) {
  tabsOrder.value = newOrder
}
