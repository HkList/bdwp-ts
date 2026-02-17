import { type ProSearchFormPlusReturn } from '@frontend/components/ProSearchFormPlus'
import type { CreateRowKey, RowKey } from 'naive-ui/es/data-table/src/interface'
import {
  type UseNDataTableData as Data,
  type UseNDataTableParams as Params,
  type ProDataTableColumns,
  type ProDataTableProps,
  type UseNDataTableOptions,
  type UseNDataTableReturn,
  type UseNDataTableService,
  type UseRequestPlugin,
} from 'pro-naive-ui'
import { type ComputedRef, type Ref } from 'vue'

export interface ProDataTablePlusProps<RowKeyType extends number | string = RowKey> extends Omit<
  ProDataTableProps,
  'checkedRowKeys'
> {
  cardTitle?: string
  disableSelectOnRowClick?: boolean
  selectRowTagNames?: string[]
  checkedRowKeys?: RowKeyType[]
}

export type UseProDataTablePlusService = UseNDataTableService<Data, Params>

export interface UseProDataTablePlusOptions<T extends object> {
  service: UseNDataTableService<Data, Params>
  options: UseNDataTableOptions<Data, Params> & {
    rowKey: CreateRowKey<T>
    customProps?: ProDataTablePlusProps
  }
  columns?: () => ProDataTableColumns<T>
  plugins?: UseRequestPlugin<Data, Params>[]
}

export type UseProDataTablePlusReturn<
  ApiParams extends object,
  RowKeyType extends number | string = number,
> = {
  table: Omit<UseNDataTableReturn<Data, Params>['table'], 'tableProps'> & {
    tableProps: ComputedRef<ProDataTablePlusProps<RowKeyType>>
    checkedRowKeys: Ref<RowKeyType[]>
  }
  search: ProSearchFormPlusReturn<ApiParams>
  send: () => Promise<void>
}
