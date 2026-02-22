import type { RouteRecordRawPlus } from '@frontend/router/index.ts'
import type { renderIcon } from '@frontend/utils/renderIcon.ts'
import type { MenuOption } from 'naive-ui'

import { useMobile } from '@frontend/hooks/useMobile.ts'
import { ADMIN_ROUTES } from '@frontend/router/index.ts'
import { useAuthStore } from '@frontend/stores/authStore.ts'
import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface Breadcrumb {
  icon?: ReturnType<typeof renderIcon>
  path: string
  route: RouteRecordRawPlus
  title: string
}

// 将路由转换为菜单选项（支持嵌套）
function routeToMenuOption(route: RouteRecordRawPlus): MenuOption {
  const menuOption: MenuOption = {
    icon: route.meta.icon,
    key: route.path,
    label: route.meta.title,
  }

  // 如果有子路由，递归处理
  if (route.children && route.children.length > 0) {
    menuOption.children = route.children.map(child =>
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
  const authStore = useAuthStore()
  const menuOptions = computed<MenuOption[]>(() => {
    return ADMIN_ROUTES.filter(route => !route.meta.needAdmin || authStore.isAdmin).map(route => routeToMenuOption(route))
  })

  // 菜单选择处理
  const handleMenuSelect = async (key: string) => {
    await router.push(key)
  }

  // 面包屑导航
  const breadcrumbs = computed<Breadcrumb[]>(() => {
    return route.matched.map<Breadcrumb>((item) => {
      return {
        icon: item.meta.icon as ReturnType<typeof renderIcon> | undefined,
        path: item.path,
        route: item as unknown as RouteRecordRawPlus,
        title: (item.meta.title as string) ?? '',
      }
    })
  })

  return {
    activeKey,
    breadcrumbs,

    collapsed,
    collapsedMobileDrawer,
    handleMenuSelect,

    isMobile,
    menuOptions,

    showMenu,
    toggleCollapsed,
    toggleCollapsedMobileDrawer,

    toggleShowMenu,
  }
})
