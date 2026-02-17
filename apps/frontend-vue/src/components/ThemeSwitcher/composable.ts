import { computed, nextTick } from 'vue'
import { useColorMode } from '@vueuse/core'
import { darkTheme, dateZhCN, type DropdownOption } from 'naive-ui'
import { renderIcon } from '@frontend/utils/renderIcon'
import { DesktopOutline, Moon, Sunny } from '@vicons/ionicons5'
import { zhCN, type ProConfigProviderProps } from 'pro-naive-ui'
import type { ThemeModeType } from '@frontend/components/ThemeSwitcher/types'

export const ThemeMode = ['light', 'dark', 'auto'] as const

export const DropdownThemeOptions = [
  {
    label: '浅色',
    key: 'light',
    icon: renderIcon(Sunny),
    props: { onClick: (event) => setModeWithTransition(event, 'light') },
  },
  {
    label: '深色',
    key: 'dark',
    icon: renderIcon(Moon),
    props: { onClick: (event) => setModeWithTransition(event, 'dark') },
  },
  {
    label: '跟随系统',
    key: 'auto',
    icon: renderIcon(DesktopOutline),
    props: { onClick: (event) => setModeWithTransition(event, 'auto') },
  },
] satisfies (DropdownOption & { key: ThemeModeType })[]

export const colorMode = useColorMode()

export const isDark = computed(() => {
  return colorMode.store.value === 'auto'
    ? colorMode.system.value === 'dark'
    : colorMode.store.value === 'dark'
})

export const configProviderProps = computed<ProConfigProviderProps>(() => ({
  abstract: true,
  theme: isDark.value ? darkTheme : null,
  locale: zhCN,
  dateLocale: dateZhCN,
}))

export const setMode = (next: ThemeModeType) => {
  colorMode.store.value = next
}

export const setModeWithTransition = (
  event: { clientX: number; clientY: number },
  next: ThemeModeType,
) => {
  // 判断是否是一样的mode
  if (next === colorMode.store.value) return

  if (
    !('startViewTransition' in document) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    setMode(next)
    return
  }

  // 懒加载鼠标位置，仅在需要时获取，避免持续监听
  const x = event.clientX
  const y = event.clientY

  const endRadius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
  const transition = document.startViewTransition(async () => {
    setMode(next)
    return nextTick()
  })
  transition.ready.then(() => {
    const clipPath = [`circle(0 at ${x}px ${y}px)`, `circle(${endRadius}px at ${x}px ${y}px)`]
    document.documentElement.animate(
      {
        clipPath: isDark.value ? clipPath : [...clipPath].reverse(),
      },
      {
        duration: 400,
        easing: 'ease-in',
        pseudoElement: isDark.value ? '::view-transition-new(root)' : '::view-transition-old(root)',
      },
    )
  })
}
