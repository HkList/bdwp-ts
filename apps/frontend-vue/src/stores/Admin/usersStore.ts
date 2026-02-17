import { api, useRequest } from '@frontend/api'
import { defineStore } from 'pinia'
import type { UserModelType } from '@backend/modules/admin/user/model'
import {
  useProDataTablePlus,
  type UseProDataTablePlusService,
} from '@frontend/components/ProDataTablePlus'
import type { TypeboxTypes } from '@backend/db'
import { renderProDateText } from 'pro-naive-ui'
import { NButton, NFlex } from 'naive-ui'
import { h } from 'vue'

export const useUsersStore = defineStore('admin_users', () => {
  const service: UseProDataTablePlusService = async ({ current, pageSize }) => {
    const { data, error } = await api.admin.users.get({
      query: {
        ...formValues.value,
        page: current,
        page_size: pageSize,
      },
    })

    if (error) {
      return {
        list: [],
        total: 0,
      }
    }

    return {
      list: data.data.data,
      total: data.data.total,
    }
  }

  const {
    send: getUsers,
    table: { tableProps, checkedRowKeys },
    search: { formProps, formValues },
  } = useProDataTablePlus<UserModelType['getAllUsersQuery'], TypeboxTypes['UserTypeboxSchemaType']>(
    {
      service,
      options: {
        rowKey: (row) => row.id,
        customProps: {
          cardTitle: '用户列表',
        },
      },
      columns: () => [
        {
          title: '选择',
          type: 'selection',
        },
        {
          title: 'ID',
          key: 'id',
          width: 80,
        },
        {
          title: '用户名',
          key: 'username',
        },
        {
          title: '创建时间',
          key: 'created_at',
          render: (row) => renderProDateText(row.created_at),
        },
        {
          title: '操作',
          key: 'actions',
          render: (_row) =>
            h(NFlex, null, {
              default: () => [
                h(
                  NButton,
                  {
                    type: 'primary',
                    size: 'small',
                  },
                  { default: () => '编辑' },
                ),
                h(
                  NButton,
                  {
                    type: 'error',
                    size: 'small',
                  },
                  { default: () => '删除' },
                ),
              ],
            }),
        },
      ],
    },
    {
      initValues: {},
      columns: () => [
        {
          title: '用户名',
          key: 'username',
        },
      ],
      rules: () => ({}),
    },
  )

  const { send: _deleteUsers, loading: deleteUsersLoading } = useRequest(api.admin.users.delete)
  const deleteUsers = async (ids: number[]) => {
    await _deleteUsers({
      ids,
    })
    await getUsers()
  }

  return {
    getUsers,
    tableProps,
    formProps,
    formValues,
    checkedRowKeys,

    deleteUsers,
    deleteUsersLoading,
  }
})
