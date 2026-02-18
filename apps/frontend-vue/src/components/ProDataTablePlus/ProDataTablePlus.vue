<template>
  <ProCard :title="props.cardTitle">
    <ProDataTable v-bind="selectRowOnClickProps">
      <template v-for="(_, name) in slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProDataTable>

    <template #header-extra>
      <div class="header-extra-warper">
        <slot name="header-extra" />
      </div>
    </template>
  </ProCard>
</template>

<script lang="ts" setup>
import type {
  ProDataTablePlusProps,
  ProDataTablePlusSlots,
} from '@frontend/components/ProDataTablePlus/types.ts'

import { ProCard, ProDataTable } from 'pro-naive-ui'
import { computed } from 'vue'

const slots = defineSlots<ProDataTablePlusSlots>()
if ('toolbar' in slots) {
  throw new Error('ProDataTablePlus 已废弃 toolbar 插槽，请使用 header-extra 插槽替代')
}

const props = withDefaults(defineProps<ProDataTablePlusProps>(), {
  bordered: true,
  bottomBordered: true,
  cascade: true,
  paginateSinglePage: true,
  selectRowTagNames: () => ['td'],
  singleLine: true,
})

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onClick = (event: PointerEvent, row: any) => {
  const target = event.target
  if (!target || !(target instanceof HTMLElement)) return
  const tagName = target.tagName.toLowerCase()

  if (!props.selectRowTagNames.includes(tagName)) return

  // 取出当前行的ID
  const rowKey = typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey ?? 'id']
  if (rowKey === undefined) return

  // 触发选择事件
  if (props.checkedRowKeys && props['onUpdate:checkedRowKeys']) {
    const isSelected = props.checkedRowKeys.includes(rowKey)
    const newKeys = isSelected
      ? props.checkedRowKeys.filter((key) => key !== rowKey)
      : [...props.checkedRowKeys, rowKey]
    if (Array.isArray(props['onUpdate:checkedRowKeys'])) {
      props['onUpdate:checkedRowKeys'].forEach((fn) =>
        fn(newKeys, props.data ?? [], {
          action: isSelected ? 'uncheck' : 'check',
          row,
        }),
      )
    } else if (props['onUpdate:checkedRowKeys']) {
      props['onUpdate:checkedRowKeys'](newKeys, props.data ?? [], {
        action: isSelected ? 'uncheck' : 'check',
        row,
      })
    }
  }
}

const selectRowOnClickProps = computed<ProDataTablePlusProps>(() => ({
  ...props,
  rowProps: props.disableSelectOnRowClick
    ? props.rowProps
    : (row, index) => {
        const rawProps = props.rowProps ? props.rowProps(row, index) : {}

        return {
          ...rawProps,
          onClick: (event: PointerEvent) => {
            if (rawProps.onClick) rawProps.onClick(event)
            onClick(event, row)
          },
        }
      },
}))
</script>

<style lang="scss" scoped>
.header-extra-warper {
  margin-right: 10px;
}
</style>
