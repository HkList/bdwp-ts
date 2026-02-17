import type { Component } from 'vue'

import { NIcon } from 'naive-ui'
import { h } from 'vue'

/**
 * 渲染图标的辅助函数
 * @param icon - Vue 组件或函数式组件
 * @param size - 图标大小（像素）
 * @returns 返回一个函数，该函数返回包装好的图标 VNode
 */
export const renderIcon = (icon: Component, size?: number) => () =>
  h(NIcon, { size }, { default: () => h(icon) })
