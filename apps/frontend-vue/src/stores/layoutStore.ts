import { ADMIN_ROUTES, type RouteRecordRawPlus } from '@frontend/router/index.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { useMobile } from '@frontend/utils/useMobile.ts'
import { HomeOutlined } from '@vicons/antd'
import type { MenuOption } from 'naive-ui'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface Breadcrumb {
  path: string
  title: string
  icon?: ReturnType<typeof renderIcon>
}

// 将路由转换为菜单选项（支持嵌套）
const routeToMenuOption = (route: RouteRecordRawPlus): MenuOption => {
  const menuOption: MenuOption = {
    label: route.meta.title,
    key: route.path,
    icon: route.meta.icon,
  }

  // 如果有子路由，递归处理
  if (route.children && route.children.length > 0) {
    menuOption.children = route.children.map((child) =>
      routeToMenuOption(child as RouteRecordRawPlus),
    )
  }

  return menuOption
}

export const useLayoutStore = defineStore('layout', () => {
  const { isMobile } = useMobile()
  const route = useRoute()
  const router = useRouter()

  const collapsed = ref(false)

  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  const activeKey = computed(() => route.path)

  // 菜单选项
  const menuOptions = computed<MenuOption[]>(() => {
    return ADMIN_ROUTES.map((route) => routeToMenuOption(route))
  })

  // 菜单选择处理
  const handleMenuSelect = (key: string) => {
    router.push(key)
  }

  // 面包屑导航
  const breadcrumbs = computed<Breadcrumb[]>(() => {
    const routes = route.matched
      .filter((item) => item.path !== '/admin')
      .map(
        (item) =>
          ({
            path: item.path,
            title: item.meta.title,
            icon: item.meta.icon,
          }) as Breadcrumb,
      )

    routes.unshift({
      path: '/',
      title: '首页',
      icon: renderIcon(HomeOutlined),
    })

    return routes
  })

  return {
    collapsed,
    toggleCollapsed,

    isMobile,

    activeKey,
    menuOptions,
    handleMenuSelect,

    breadcrumbs,
  }
})
