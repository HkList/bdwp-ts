import type { RowKey } from 'naive-ui/es/data-table/src/interface.d.ts'
import type { ProDataTableProps, ProDataTableSlots } from 'pro-naive-ui'

export interface ProDataTablePlusProps<RowKeyType extends number | string = RowKey> extends Omit<
  ProDataTableProps,
  'checkedRowKeys'
> {
  cardTitle?: string
  checkedRowKeys?: RowKeyType[]
  disableSelectOnRowClick?: boolean
  selectRowTagNames?: string[]
}

export interface ProDataTablePlusSlots extends Omit<ProDataTableSlots, 'toolbar'> {
  'header-extra': any
}
