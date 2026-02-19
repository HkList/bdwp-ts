<template>
  <NDropdown :options="DropdownThemeOptions">
    <NButton quaternary circle :render-icon="renderIcon(isDark ? Moon : Sunny)" />
  </NDropdown>
</template>

<script setup lang="ts">
import { DropdownThemeOptions, isDark } from '@frontend/components/ThemeSwitcher/composable.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Moon, Sunny } from '@vicons/ionicons5'
import { NButton, NDropdown } from 'naive-ui'
</script>
