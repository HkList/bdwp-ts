import { NIcon } from 'naive-ui'
import { h, type Component } from 'vue'

export const renderIcon = (icon: Component) => () => h(NIcon, null, { default: () => h(icon) })
