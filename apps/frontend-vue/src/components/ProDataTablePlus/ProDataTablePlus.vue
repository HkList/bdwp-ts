<template>
  <ProCard :title="props.cardTitle">
    <ProDataTable v-bind="selectRowOnClickProps">
      <template v-for="(_, name) in slotsWithOutToolbar" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}"></slot>
      </template>
    </ProDataTable>

    <template #header-extra>
      <div class="header-extra-warper">
        <slot name="toolbar" />
      </div>
    </template>
  </ProCard>
</template>

<script lang="ts" setup>
import { ProCard, ProDataTable, type ProDataTableSlots } from 'pro-naive-ui'
import { type ProDataTablePlusProps } from '@frontend/components/ProDataTablePlus'
import { computed } from 'vue'

const slots = defineSlots<ProDataTableSlots>()
const slotsWithOutToolbar = Object.fromEntries(
  Object.entries(slots).filter(([name]) => name !== 'toolbar'),
) as Omit<ProDataTableSlots, 'toolbar'>

const props = withDefaults(defineProps<ProDataTablePlusProps>(), {
  bottomBordered: true,
  bordered: true,
  cascade: true,
  paginateSinglePage: true,
  singleLine: true,
  selectRowTagNames: () => ['td'],
})

const selectRowOnClickProps = computed<ProDataTablePlusProps>(() => ({
  ...props,
  rowProps: props.disableSelectOnRowClick
    ? props.rowProps
    : (row, index) => {
        const rawProps = props.rowProps ? props.rowProps(row, index) : {}

        return {
          ...rawProps,
          onClick: (event) => {
            if (rawProps.onClick) rawProps.onClick(event)

            const target = event.target
            if (!target || !(target instanceof HTMLElement)) return
            const tagName = target.tagName.toLowerCase()

            if (!props.selectRowTagNames.includes(tagName)) return

            // 取出当前行的ID
            const rowKey =
              typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey ?? 'id']
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
                    row,
                    action: isSelected ? 'uncheck' : 'check',
                  }),
                )
              } else if (props['onUpdate:checkedRowKeys']) {
                props['onUpdate:checkedRowKeys'](newKeys, props.data ?? [], {
                  row,
                  action: isSelected ? 'uncheck' : 'check',
                })
              }
            }
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
