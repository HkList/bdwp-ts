import type { ProDataTablePlusProps } from '@frontend/components/ProDataTablePlus'
import type { DataTableRowKey } from 'naive-ui'
import type { CreateRowKey } from 'naive-ui/es/data-table/src/interface'
import { ref, type Ref } from 'vue'

export const useDataTableSection = <T extends object>(
  rowKey: CreateRowKey<T>,
): Ref<Pick<ProDataTablePlusProps, 'rowKey' | 'checkedRowKeys' | 'onUpdate:checkedRowKeys'>> => {
  const checkedRowKeys = ref<DataTableRowKey[]>([])

  return ref({
    rowKey,
    checkedRowKeys,
    'onUpdate:checkedRowKeys': (keys: DataTableRowKey[]) => {
      checkedRowKeys.value = keys
    },
  })
}
