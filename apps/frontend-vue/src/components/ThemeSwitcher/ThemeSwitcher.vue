<script setup lang="ts">
import type { ThemeModeType } from '@frontend/hooks/useTheme.ts'
import type { DropdownOption } from 'naive-ui'

import { isDark, setModeWithTransition } from '@frontend/hooks/useTheme.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { DesktopOutline, Moon, Sunny } from '@vicons/ionicons5'
import { NButton, NDropdown } from 'naive-ui'

const dropdownOptions = [
  {
    icon: renderIcon(Sunny),
    key: 'light',
    label: '浅色',
    props: { onClick: (event: MouseEvent) => setModeWithTransition(event, 'light') },
  },
  {
    icon: renderIcon(Moon),
    key: 'dark',
    label: '深色',
    props: { onClick: (event: MouseEvent) => setModeWithTransition(event, 'dark') },
  },
  {
    icon: renderIcon(DesktopOutline),
    key: 'auto',
    label: '跟随系统',
    props: { onClick: (event: MouseEvent) => setModeWithTransition(event, 'auto') },
  },
] satisfies (DropdownOption & { key: ThemeModeType })[]
</script>

<template>
  <NDropdown :options="dropdownOptions">
    <NButton quaternary circle :render-icon="renderIcon(isDark ? Moon : Sunny)" />
  </NDropdown>
</template>
