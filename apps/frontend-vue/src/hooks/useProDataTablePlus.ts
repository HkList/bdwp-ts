import type { ProDataTablePlusProps } from '@frontend/components/ProDataTablePlus/types.ts'
import type { ProSearchFormPlusReturn, UseProSearchFormPlusOptions } from '@frontend/hooks/useProSearchFormPlus.ts'
import type { PaginationInfo } from 'naive-ui'
import type { CreateRowKey } from 'naive-ui/es/data-table/src/interface.d.ts'
import type {
  UseNDataTableData as Data,
  UseNDataTableParams as Params,
  ProDataTableColumns,
  UseNDataTableOptions,
  UseNDataTableReturn,
  UseNDataTableService,
  UseRequestPlugin,
} from 'pro-naive-ui'
import type { ComputedRef, Ref } from 'vue'

import { useDataTableSection } from '@frontend/hooks/useDataTableSection.ts'
import { useProSearchFormPlus } from '@frontend/hooks/useProSearchFormPlus.ts'
import { useNDataTable } from 'pro-naive-ui'
import { computed, toRaw } from 'vue'

export interface UseProDataTablePlusOptions<T extends object> {
  service: UseNDataTableService<Data, Params>
  columns?: () => ProDataTableColumns<T>
  options: UseNDataTableOptions<Data, Params> & {
    customProps?: ProDataTablePlusProps
    rowKey: CreateRowKey<T>
    loading?: () => boolean
    disablePagination?: boolean
  }
  plugins?: UseRequestPlugin<Data, Params>[]
}

export interface UseProDataTablePlusReturn<
  ApiParams extends object,
  RowKeyType extends number | string = number,
> {
  search: ProSearchFormPlusReturn<ApiParams>
  send: () => Promise<void>
  table: Omit<UseNDataTableReturn<Data, Params>['table'], 'tableProps'> & {
    checkedRowKeys: Ref<RowKeyType[]>
    tableProps: ComputedRef<ProDataTablePlusProps<RowKeyType>>
  }
}

export type UseProDataTablePlusService = UseNDataTableService<Data, Params>

export function useProDataTablePlus<
  ApiParams extends object,
  ApiResponse extends object,
  RowKeyType extends number | string = number,
>(options: UseProDataTablePlusOptions<ApiResponse>, searchFormPlusOptions?: UseProSearchFormPlusOptions<ApiParams>): UseProDataTablePlusReturn<ApiParams, RowKeyType> {
  const NData = useNDataTable(
    options.service,
    {
      ...options.options,
      onSuccess: (res, params) => {
        if (options.options.onSuccess) {
          options.options.onSuccess(res, params)
        }

        // 清空 checkedRowKeys
        checkedRowKeys.value = []

        if (res.total === 0) {
          return
        }

        // 计算最大页数
        const maxPage = Math.ceil(res.total / params[0].pageSize)
        // 如果当前页码超过最大页码，则重新请求数据，页码设置为最大页码
        if (params[0].current > maxPage)
          NData.pagination.current.value = maxPage
      },
    },
    options.plugins,
  )

  const send = async () => {
    const [prevParams, prevFormValues, ...restParams] = NData.params.value ?? []
    const pagination = NData.pagination

    await NData.runAsync(
      {
        ...prevParams,
        current: pagination.current.value,
        filters: prevParams?.filters ?? {},
        pageSize: pagination.pageSize.value,
        sorter: prevParams?.sorter ?? null,
      },
      toRaw(prevFormValues ?? {}),
      ...restParams,
    )
  }

  const { checkedRowKeys, dataTableProps } = useDataTableSection<ApiResponse, RowKeyType>(
    options.options.rowKey,
  )

  const tableProps = computed(() => {
    return {
      ...NData.table.tableProps.value,
      ...options.options.customProps,
      ...dataTableProps.value,
      columns: options.columns ? options.columns() : [],
      pagination: options.options.customProps?.pagination !== false && !options.options.disablePagination
        ? {
            pageSizes: [10, 20, 50, 100],
            prefix: ({ itemCount }: PaginationInfo) => `共 ${itemCount} 条`,
            showQuickJumper: true,
            showSizePicker: true,
            ...NData.table.tableProps.value?.pagination,
          }
        : false as const,
      // 如果外部传入了 loading，则和 NData 内置的 loading 进行合并，满足任一 loading 为 true 时，表格显示 loading
      loading: options.options.loading
        ? options.options.loading() || NData.table.tableProps.value?.loading
        : NData.table.tableProps.value?.loading,
    }
  })

  const searchProps = useProSearchFormPlus<ApiParams>(
    searchFormPlusOptions ?? {
      columns: () => [],
      initValues: {} as ApiParams,
    },
  )
  searchProps.formProps.value.onSearch = send

  return {
    ...NData,
    search: searchProps,
    send,
    table: {
      ...NData.table,
      checkedRowKeys,
      tableProps,
    },
  }
}
