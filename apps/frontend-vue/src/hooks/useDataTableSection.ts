import type { CreateRowKey, RowKey } from 'naive-ui/es/data-table/src/interface.d.ts'
import type { ComputedRef, ShallowRef } from 'vue'

import { computed, shallowRef } from 'vue'

export interface UseDataTableSectionReturn<T extends object, K extends RowKey = RowKey> {
  checkedRowKeys: ShallowRef<K[]>
  dataTableProps: ComputedRef<{
    'checkedRowKeys': K[]
    'onUpdate:checkedRowKeys': (keys: RowKey[]) => void
    'rowKey': CreateRowKey<T>
  }>
}

export function useDataTableSection<T extends object, K extends RowKey = RowKey>(rowKey: CreateRowKey<T>): UseDataTableSectionReturn<T, K> {
  const checkedRowKeys = shallowRef<K[]>([])

  return {
    checkedRowKeys,
    dataTableProps: computed(() => ({
      'checkedRowKeys': checkedRowKeys.value,
      'onUpdate:checkedRowKeys': (keys: RowKey[]) => {
        checkedRowKeys.value = keys as K[]
      },
      'rowKey': rowKey,
    })),
  }
}
