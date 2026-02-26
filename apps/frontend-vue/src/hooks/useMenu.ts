import type { RouteRecordRawPlus } from '@frontend/router/index.ts'
import type { MenuOption } from 'naive-ui'
import type { Ref } from 'vue'
import { useToggle } from '@vueuse/core'
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

export interface UseMenuOptions {
  routes: RouteRecordRawPlus[]
  isAdmin?: Ref<boolean>
  isMobile?: Ref<boolean>
}

// 将路由转换为菜单选项（支持嵌套）
export function routeToMenuOption(route: RouteRecordRawPlus): MenuOption {
  const menuOption: MenuOption = {
    icon: route.meta.icon,
    key: route.path,
    label: route.meta.title,
  }

  // 如果有子路由，递归处理
  if (route.children && route.children.length > 0) {
    menuOption.children = route.children.map(routeToMenuOption)
  }

  return menuOption
}

export function useMenu(options: UseMenuOptions) {
  const route = useRoute()
  const router = useRouter()

  const [collapsed, toggleCollapsed] = useToggle(false)
  const [collapsedMobileDrawer, toggleCollapsedMobileDrawer] = useToggle(false)
  const [showMenu, toggleShowMenu] = useToggle(!options.isMobile?.value)

  const activeKey = computed(() => route.path)

  const menuOptions = computed<MenuOption[]>(() =>
    options.routes
      .filter(route => !route.meta.needAdmin || (options.isAdmin?.value ?? false))
      .map(route => routeToMenuOption(route)),
  )

  // 菜单选择处理
  const handleMenuSelect = async (key: string) => {
    await router.push(key)
  }

  return {
    collapsed,
    toggleCollapsed,

    collapsedMobileDrawer,
    toggleCollapsedMobileDrawer,

    showMenu,
    toggleShowMenu,

    activeKey,
    menuOptions,
    handleMenuSelect,
  }
}
