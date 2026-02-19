import type {
  UseProDataTablePlusOptions,
  UseProDataTablePlusReturn,
} from '@frontend/components/ProDataTablePlus/types.ts'
import type { PaginationInfo } from 'naive-ui'

import { useDataTableSection } from '@frontend/components/ProDataTablePlus/composable/useDataTableSection.ts'
import {
  useProSearchFormPlus,
  type UseProSearchFormPlusOptions,
} from '@frontend/components/ProSearchFormPlus/index.ts'
import { useNDataTable } from 'pro-naive-ui'
import { computed, toRaw } from 'vue'

export const useProDataTablePlus = <
  ApiParams extends object,
  ApiResponse extends object,
  RowKeyType extends number | string = number,
>(
  options: UseProDataTablePlusOptions<ApiResponse>,
  searchFormPlusOptions?: UseProSearchFormPlusOptions<ApiParams>,
): UseProDataTablePlusReturn<ApiParams, RowKeyType> => {
  const NData = useNDataTable(
    options.service,
    {
      ...options.options,
      onSuccess: (res, params) => {
        if (options.options.onSuccess) options.options.onSuccess(res, params)

        // 计算最大页数
        const maxPage = Math.ceil(res.total / params[0].pageSize)
        // 如果当前页码超过最大页码，则重新请求数据，页码设置为最大页码
        if (params[0].current > maxPage) NData.pagination.current.value = maxPage
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
      pagination: {
        pageSizes: [10, 20, 50, 100],
        prefix: ({ itemCount }: PaginationInfo) => `共 ${itemCount} 条`,
        showQuickJumper: true,
        showSizePicker: true,
        ...NData.table.tableProps.value?.pagination,
      },
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
