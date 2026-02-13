<template>
  <NDropdown :options="DropdownThemeOptions" @select="setModeWithTransition">
    <NButton quaternary circle>
      <component :is="renderIcon(isDark ? Moon : Sunny)" />
    </NButton>
  </NDropdown>
</template>

<script setup lang="ts">
import { NButton, NDropdown } from 'naive-ui'
import { Moon, Sunny } from '@vicons/ionicons5'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import {
  DropdownThemeOptions,
  isDark,
  setModeWithTransition,
} from '@frontend/components/ThemeSwitcher/index.ts'
</script>
