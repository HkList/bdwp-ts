import type { CreateRowKey, RowKey } from 'naive-ui/es/data-table/src/interface.d.ts'
import type { ComputedRef, Ref } from 'vue'

import { computed, ref } from 'vue'

export interface UseDataTableSectionReturn<T extends object, K extends RowKey = RowKey> {
  checkedRowKeys: Ref<K[]>
  dataTableProps: ComputedRef<{
    checkedRowKeys: K[]
    'onUpdate:checkedRowKeys': (keys: RowKey[]) => void
    rowKey: CreateRowKey<T>
  }>
}

export const useDataTableSection = <T extends object, K extends RowKey = RowKey>(
  rowKey: CreateRowKey<T>,
): UseDataTableSectionReturn<T, K> => {
  const checkedRowKeys = ref<K[]>([]) as Ref<K[]>

  return {
    checkedRowKeys,
    dataTableProps: computed(() => ({
      checkedRowKeys: checkedRowKeys.value,
      'onUpdate:checkedRowKeys': (keys: RowKey[]) => {
        checkedRowKeys.value = keys as K[]
      },
      rowKey: rowKey,
    })),
  }
}
