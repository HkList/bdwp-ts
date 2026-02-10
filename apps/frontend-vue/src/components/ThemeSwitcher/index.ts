import { computed } from 'vue'
import { useColorMode } from '@vueuse/core'
import { darkTheme, type ConfigProviderProps, type DropdownOption } from 'naive-ui'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { DesktopOutline, Moon, Sunny } from '@vicons/ionicons5'
import { zhCN, dateZhCN } from 'naive-ui'

export const ThemeMode = ['light', 'dark', 'auto'] as const
export type ThemeMode = (typeof ThemeMode)[number]

export const DropdownThemeOptions: DropdownOption[] = [
  { label: '浅色', key: 'light', icon: renderIcon(Sunny) },
  { label: '深色', key: 'dark', icon: renderIcon(Moon) },
  { label: '跟随系统', key: 'auto', icon: renderIcon(DesktopOutline) },
]

export const colorMode = useColorMode()

export const isDark = computed(() => {
  return colorMode.store.value === 'auto'
    ? colorMode.system.value === 'dark'
    : colorMode.store.value === 'dark'
})

export const configProviderProps = computed<ConfigProviderProps>(() => ({
  theme: isDark.value ? darkTheme : null,
  locale: zhCN,
  dateLocale: dateZhCN,
  abstract: true,
}))

export const setMode = (next: ThemeMode) => {
  colorMode.store.value = next
}

export { default as ThemeSwitcher } from '@frontend/components/ThemeSwitcher/ThemeSwitcher.vue'
