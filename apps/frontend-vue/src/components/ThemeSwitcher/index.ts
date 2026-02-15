import { computed, nextTick } from 'vue'
import { useColorMode, useMouse } from '@vueuse/core'
import type { ConfigProviderProps, DropdownOption } from 'naive-ui'
import { darkTheme, dateZhCN } from 'naive-ui'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { DesktopOutline, Moon, Sunny } from '@vicons/ionicons5'
import { zhCN } from 'pro-naive-ui'

export const ThemeMode = ['light', 'dark', 'auto'] as const
export type ThemeMode = (typeof ThemeMode)[number]

export const DropdownThemeOptions = [
  { label: '浅色', key: 'light', icon: renderIcon(Sunny) },
  { label: '深色', key: 'dark', icon: renderIcon(Moon) },
  { label: '跟随系统', key: 'auto', icon: renderIcon(DesktopOutline) },
] satisfies (DropdownOption & { key: ThemeMode })[]

export const colorMode = useColorMode()

export const isDark = computed(() => {
  return colorMode.store.value === 'auto'
    ? colorMode.system.value === 'dark'
    : colorMode.store.value === 'dark'
})

export const configProviderProps = computed<ConfigProviderProps>(() => ({
  abstract: true,
  theme: isDark.value ? darkTheme : null,
  locale: zhCN,
  dateLocale: dateZhCN,
}))

export const setMode = (next: ThemeMode) => {
  colorMode.store.value = next
}

const { x, y } = useMouse()
export const setModeWithTransition = (next: ThemeMode) => {
  // 判断是否是一样的mode
  if (next === colorMode.store.value) return

  if (
    !('startViewTransition' in document) ||
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  ) {
    setMode(next)
    return
  }

  const endRadius = Math.hypot(
    Math.max(x.value, innerWidth - x.value),
    Math.max(y.value, innerHeight - y.value),
  )
  const transition = document.startViewTransition(async () => {
    setMode(next)
    return nextTick()
  })
  transition.ready.then(() => {
    const clipPath = [
      `circle(0 at ${x.value}px ${y.value}px)`,
      `circle(${endRadius}px at ${x.value}px ${y.value}px)`,
    ]
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

export { default as ThemeSwitcher } from '@frontend/components/ThemeSwitcher/ThemeSwitcher.vue'
