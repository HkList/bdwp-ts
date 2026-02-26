import { useBreadcrumbs } from '@frontend/hooks/useBreadcrumbs.ts'
import { useMenu } from '@frontend/hooks/useMenu.ts'
import { useMobile } from '@frontend/hooks/useMobile.ts'
import { ADMIN_ROUTES } from '@frontend/router/index.ts'
import { useUserStore } from '@frontend/stores/userStore.ts'
import { defineStore, storeToRefs } from 'pinia'

export const useLayoutStore = defineStore('layout', () => {
  const { isMobile } = useMobile()

  const userStore = useUserStore()
  const { isAdmin } = storeToRefs(userStore)

  const {
    collapsed,
    toggleCollapsed,

    collapsedMobileDrawer,
    toggleCollapsedMobileDrawer,

    showMenu,
    toggleShowMenu,

    activeKey,
    menuOptions,
    handleMenuSelect,
  } = useMenu({
    isMobile,
    routes: ADMIN_ROUTES,
    isAdmin,
  })

  const { breadcrumbs } = useBreadcrumbs()

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

    isMobile,

    breadcrumbs,
  }
})
