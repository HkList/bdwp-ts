import type { CreateRowKey, RowKey } from 'naive-ui/es/data-table/src/interface'
import { computed, ref, type ComputedRef, type Ref } from 'vue'

export interface UseDataTableSectionReturn<T extends object, K extends RowKey = RowKey> {
  checkedRowKeys: Ref<K[]>
  dataTableProps: ComputedRef<{
    rowKey: CreateRowKey<T>
    checkedRowKeys: K[]
    'onUpdate:checkedRowKeys': (keys: RowKey[]) => void
  }>
}

export const useDataTableSection = <T extends object, K extends RowKey = RowKey>(
  rowKey: CreateRowKey<T>,
): UseDataTableSectionReturn<T, K> => {
  const checkedRowKeys = ref<K[]>([]) as Ref<K[]>

  return {
    checkedRowKeys,
    dataTableProps: computed(() => ({
      rowKey: rowKey,
      checkedRowKeys: checkedRowKeys.value,
      'onUpdate:checkedRowKeys': (keys: RowKey[]) => {
        checkedRowKeys.value = keys as K[]
      },
    })),
  }
}
