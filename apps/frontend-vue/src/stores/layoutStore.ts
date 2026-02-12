import { ADMIN_ROUTES, type RouteRecordRawPlus } from '@frontend/router/index.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { useMobile } from '@frontend/utils/useMobile.ts'
import type { MenuOption } from 'naive-ui'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface Breadcrumb {
  path: string
  title: string
  icon?: ReturnType<typeof renderIcon>
  route: RouteRecordRawPlus
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
  const route = useRoute()
  const router = useRouter()

  const collapsed = ref(false)
  const toggleCollapsed = () => {
    collapsed.value = !collapsed.value
  }

  const { isMobile } = useMobile()
  const collapsedMobileDrawer = ref(false)
  const toggleCollapsedMobileDrawer = () => {
    collapsedMobileDrawer.value = !collapsedMobileDrawer.value
  }

  const showMenu = ref(true)
  const toggleShowMenu = () => {
    showMenu.value = !showMenu.value
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
    return route.matched.map(
      (item) =>
        ({
          path: item.path,
          title: item.meta.title,
          icon: item.meta.icon,
          route: item as unknown as RouteRecordRawPlus,
        }) as Breadcrumb,
    )
  })

  return {
    collapsed,
    toggleCollapsed,

    isMobile,
    collapsedMobileDrawer,
    toggleCollapsedMobileDrawer,

    showMenu,
    toggleShowMenu,

    activeKey,
    menuOptions,
    handleMenuSelect,

    breadcrumbs,
  }
})
