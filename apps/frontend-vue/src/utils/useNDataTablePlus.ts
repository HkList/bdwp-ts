import type {
  SearchFormColumns,
  NSearchFormConfig,
  SearchFormRules,
} from '@frontend/components/NSearchForm/index.ts'
import type { PaginationInfo } from 'naive-ui'
import {
  useNDataTable,
  type UseNDataTableData as Data,
  type UseNDataTableParams as Params,
  type UseNDataTableReturn,
  type UseNDataTableService,
} from 'pro-naive-ui'
import { computed } from 'vue'

export type UseNDataTablePlusService = UseNDataTableService<Data, Params>

export type UseNDataTablePlusReturn<T extends object> = UseNDataTableReturn<Data, Params> & {
  search: NSearchFormConfig<T>
}

export const useNDataTablePlus = <T extends object>(
  service: UseNDataTableService<Data, Params>,
  columns?: SearchFormColumns<T>,
  rules?: SearchFormRules<T>,
): UseNDataTablePlusReturn<T> => {
  const NData = useNDataTable(service)

  const tableProps = computed(() => {
    return {
      ...NData.table.tableProps.value,
      pagination: {
        ...NData.table.tableProps.value?.pagination,
        showSizePicker: true,
        showQuickJumper: true,
        pageSizes: [10, 20, 50, 100],
        prefix: ({ itemCount }: PaginationInfo) => `共 ${itemCount} 条`,
      },
    }
  })

  return {
    ...NData,
    table: {
      ...NData.table,
      tableProps,
    },
    search: {
      ...NData.search,
      columns: computed(() => columns ?? []),
      rules: computed(() => rules),
    },
  }
}
