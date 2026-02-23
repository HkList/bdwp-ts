<script lang="ts" setup>
import type {
  ProDataTablePlusProps,
  ProDataTablePlusSlots,
} from '@frontend/components/ProDataTablePlus/types.ts'
import { useLayoutStore } from '@frontend/stores/layoutStore.ts'

import { EllipsisVertical } from '@vicons/ionicons5'
import { NButton, NIcon, NPopover } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ProCard, ProDataTable } from 'pro-naive-ui'
import { computed } from 'vue'

const props = withDefaults(defineProps<ProDataTablePlusProps>(), {
  bordered: true,
  bottomBordered: true,
  cascade: true,
  paginateSinglePage: true,
  selectRowTagNames: () => ['td'],
  scrollX: 1200,
})
const slots = defineSlots<ProDataTablePlusSlots>()

const layoutStore = useLayoutStore()
const { isMobile } = storeToRefs(layoutStore)

if ('toolbar' in slots) {
  throw new Error('ProDataTablePlus 已废弃 toolbar 插槽，请使用 header-extra 插槽替代')
}

function onClick(event: PointerEvent, row: any) {
  const target = event.target
  if (!target || !(target instanceof HTMLElement)) {
    return
  }

  const tagName = target.tagName.toLowerCase()

  if (!props.selectRowTagNames.includes(tagName)) {
    return
  }

  // 取出当前行的ID
  const rowKey = typeof props.rowKey === 'function' ? props.rowKey(row) : row[props.rowKey ?? 'id']
  if (rowKey === undefined) {
    return
  }

  // 触发选择事件
  if (props.checkedRowKeys && props['onUpdate:checkedRowKeys']) {
    const isSelected = props.checkedRowKeys.includes(rowKey)
    const newKeys = isSelected
      ? props.checkedRowKeys.filter(key => key !== rowKey)
      : [...props.checkedRowKeys, rowKey]
    if (Array.isArray(props['onUpdate:checkedRowKeys'])) {
      props['onUpdate:checkedRowKeys'].forEach(fn =>
        fn(newKeys, props.data ?? [], {
          action: isSelected ? 'uncheck' : 'check',
          row,
        }),
      )
    }
    else if (props['onUpdate:checkedRowKeys']) {
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
            if (rawProps.onClick)
              rawProps.onClick(event)
            onClick(event, row)
          },
        }
      },
}))
</script>

<template>
  <ProCard :title="props.cardTitle">
    <ProDataTable v-bind="selectRowOnClickProps">
      <template v-for="(_, name) in slots" :key="name" #[name]="slotProps">
        <slot :name="name" v-bind="slotProps || {}" />
      </template>
    </ProDataTable>

    <template #header-extra>
      <div v-if="!isMobile" class="header-extra-warper">
        <slot name="header-extra" />
      </div>
      <NPopover v-else trigger="click" placement="bottom-end">
        <template #trigger>
          <NButton text>
            <NIcon size="20">
              <EllipsisVertical />
            </NIcon>
          </NButton>
        </template>
        <div class="header-extra-popover">
          <slot name="header-extra" />
        </div>
      </NPopover>
    </template>
  </ProCard>
</template>

<style lang="scss" scoped>
.header-extra-warper {
  margin-right: 10px;
}

.header-extra-popover {
  padding: 8px;
  min-width: 200px;
}
</style>
