import { NIcon } from 'naive-ui'
import type { Component } from 'vue'
import { h } from 'vue'

export const renderIcon = (icon: Component, size?: number) => () =>
  h(NIcon, { size }, { default: () => h(icon) })
