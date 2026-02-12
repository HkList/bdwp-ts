import { type MaybePromise } from 'elysia'
import type { Router } from 'vue-router'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { ref } from 'vue'
import { router } from '@frontend/router/index.ts'

export interface RouteTab {
  pinned: boolean
  title: string
  path: string
  icon: ReturnType<typeof renderIcon>
}

export type RouteTabs = Record<string, RouteTab>

export const ROUTE_TABS_KEY = 'BDWP_ROUTE_TABS'
export const ROUTE_TABS_ORDER_KEY = 'BDWP_ROUTE_TABS_ORDER'
export const ACTIVE_TAB_KEY = 'BDWP_ACTIVE_TAB'

export const tabs = ref<RouteTabs>({})
export const tabsOrder = ref<string[]>([])
export const activeTab = ref<string>('')

export const setupRouteTabs = (
  router: Router,
  checker?: (path: string) => MaybePromise<boolean>,
) => {
  try {
    const routes = router.getRoutes()
    const routesSet = Object.fromEntries(routes.map((r) => [r.path, r]))

    const json_tabs = JSON.parse(localStorage.getItem(ROUTE_TABS_KEY) ?? '{}') as RouteTabs
    if (typeof json_tabs === 'object' && json_tabs !== null) {
      for (const path in json_tabs) {
        const element = json_tabs[path]
        if (!element) continue

        // 确认标签是否存在对应路由
        const route = routesSet[path]
        if (!route) {
          delete json_tabs[path]
          continue
        }

        element.icon = route.meta.icon as ReturnType<typeof renderIcon>
      }

      tabs.value = json_tabs
    }

    const json_tabs_order = JSON.parse(localStorage.getItem(ROUTE_TABS_ORDER_KEY) ?? '[]')
    if (Array.isArray(json_tabs_order)) {
      // 确保所有标签都在 order 中
      Object.keys(tabs.value).forEach((path) => {
        if (!json_tabs_order.includes(path)) {
          json_tabs_order.push(path)
        }
      })

      // 过滤掉 order 中不存在的标签
      tabsOrder.value = json_tabs_order.filter((path) => path in tabs.value)
    }

    const active_tab = localStorage.getItem(ACTIVE_TAB_KEY)
    if (typeof active_tab === 'string' && active_tab in tabs.value) {
      activeTab.value = active_tab
      router.push(activeTab.value)
    } else if (tabsOrder.value.length > 0) {
      activeTab.value = tabsOrder.value[0]!
      router.push(activeTab.value)
    }
  } catch {
    // 无论如何解析失败都不影响正常使用
  }

  router.afterEach(async (to, _, failure) => {
    if (failure) return
    if (checker && !(await checker(to.path))) return

    tabs.value[to.path] = {
      pinned: false,
      title: to.meta.title as string,
      path: to.path,
      icon: to.meta.icon as ReturnType<typeof renderIcon>,
    }
    if (!tabsOrder.value.includes(to.path)) {
      tabsOrder.value.push(to.path)
    }
    activeTab.value = to.path

    // 同步到 localStorage
    localStorage.setItem(ROUTE_TABS_KEY, JSON.stringify(tabs.value))
    localStorage.setItem(ROUTE_TABS_ORDER_KEY, JSON.stringify(tabsOrder.value))
    localStorage.setItem(ACTIVE_TAB_KEY, to.path)
  })
}

export const switchTab = (path: string, prefliht = false) => {
  const index = tabsOrder.value.indexOf(path)
  if (index === -1) return

  let nextIndex: number
  if (prefliht) {
    nextIndex = tabsOrder.value[index + 1] ? index + 1 : index - 1
  } else {
    nextIndex = tabsOrder.value[index] ? index : index - 1
  }

  const newTab = tabsOrder.value[nextIndex]
  if (!newTab) throw new Error('没有可切换的标签了')

  activeTab.value = newTab
  router.push(activeTab.value)
  localStorage.setItem(ACTIVE_TAB_KEY, activeTab.value)
}

export const closeTab = (path: string) => {
  // 判断标签是否存在
  const index = tabsOrder.value.indexOf(path)
  if (index === -1) return

  delete tabs.value[path]
  tabsOrder.value.splice(index, 1)

  // 如果关闭的标签是当前激活的标签，切换到下一个标签
  if (activeTab.value === path) {
    switchTab(path)
  }

  // 同步到 localStorage
  localStorage.setItem(ROUTE_TABS_KEY, JSON.stringify(tabs.value))
  localStorage.setItem(ROUTE_TABS_ORDER_KEY, JSON.stringify(tabsOrder.value))
}
