import type { ProSearchFormPlusReturn } from '@frontend/components/ProSearchFormPlus/index.ts'
import type { CreateRowKey, RowKey } from 'naive-ui/es/data-table/src/interface.d.ts'
import type {
  UseNDataTableData as Data,
  UseNDataTableParams as Params,
  ProDataTableColumns,
  ProDataTableProps,
  UseNDataTableOptions,
  UseNDataTableReturn,
  UseNDataTableService,
  UseRequestPlugin,
} from 'pro-naive-ui'
import type { ComputedRef, Ref } from 'vue'

export interface ProDataTablePlusProps<RowKeyType extends number | string = RowKey> extends Omit<
  ProDataTableProps,
  'checkedRowKeys'
> {
  cardTitle?: string
  checkedRowKeys?: RowKeyType[]
  disableSelectOnRowClick?: boolean
  selectRowTagNames?: string[]
}

export interface UseProDataTablePlusOptions<T extends object> {
  columns?: () => ProDataTableColumns<T>
  options: UseNDataTableOptions<Data, Params> & {
    customProps?: ProDataTablePlusProps
    rowKey: CreateRowKey<T>
  }
  plugins?: UseRequestPlugin<Data, Params>[]
  service: UseNDataTableService<Data, Params>
}

export type UseProDataTablePlusReturn<
  ApiParams extends object,
  RowKeyType extends number | string = number,
> = {
  search: ProSearchFormPlusReturn<ApiParams>
  send: () => Promise<void>
  table: Omit<UseNDataTableReturn<Data, Params>['table'], 'tableProps'> & {
    checkedRowKeys: Ref<RowKeyType[]>
    tableProps: ComputedRef<ProDataTablePlusProps<RowKeyType>>
  }
}

export type UseProDataTablePlusService = UseNDataTableService<Data, Params>
