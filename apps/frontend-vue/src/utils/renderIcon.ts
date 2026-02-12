import { NIcon } from 'naive-ui'
import { h, type Component } from 'vue'

export const renderIcon = (icon: Component, size?: number) => () =>
  h(NIcon, { size }, { default: () => h(icon) })
