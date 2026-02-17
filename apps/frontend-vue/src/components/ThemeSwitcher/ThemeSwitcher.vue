<template>
  <NDropdown :options="DropdownThemeOptions">
    <NButton quaternary circle :render-icon="renderIcon(isDark ? Moon : Sunny)" />
  </NDropdown>
</template>

<script setup lang="ts">
import { NButton, NDropdown } from 'naive-ui'
import { Moon, Sunny } from '@vicons/ionicons5'
import { renderIcon } from '@frontend/utils/renderIcon'
import { DropdownThemeOptions, isDark } from '@frontend/components/ThemeSwitcher/composable'
</script>
