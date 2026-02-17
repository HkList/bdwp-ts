import type {
  ProSearchFormPlusColumns,
  FormRules,
  ProSearchFormPlusReturn,
} from '@frontend/components/ProSearchFormPlus'
import type { PaginationInfo } from 'naive-ui'
import {
  useNDataTable,
  type UseNDataTableData as Data,
  type UseNDataTableParams as Params,
  type ProDataTableProps,
  type UseNDataTableReturn,
  type UseNDataTableService,
} from 'pro-naive-ui'
import { computed } from 'vue'

export interface ProDataTablePlusProps extends ProDataTableProps {
  cardTitle?: string
  disableSelectOnRowClick?: boolean
  selectRowTagNames?: string[]
}

export type UseProDataTablePlusService = UseNDataTableService<Data, Params>

export type UseProDataTablePlusReturn<T extends object> = UseNDataTableReturn<Data, Params> & {
  search: ProSearchFormPlusReturn<T>
}

export const useProDataTablePlus = <T extends object>(
  service: UseNDataTableService<Data, Params>,
  columns?: ProSearchFormPlusColumns<T>,
  rules?: FormRules<T>,
): UseProDataTablePlusReturn<T> => {
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

export { default as ProDataTablePlus } from '@frontend/components/ProDataTablePlus/ProDataTablePlus.vue'
