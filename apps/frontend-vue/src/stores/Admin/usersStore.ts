import type { TypeboxTypes } from '@backend/db'
import type { UserModelType } from '@backend/modules/admin/user/model.ts'
import type { UseProDataTablePlusService } from '@frontend/hooks/useProDataTablePlus.ts'

import { api, useRequest } from '@frontend/api/index.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { useProModalForm } from '@frontend/hooks/useProModalForm.ts'
import { Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { defineStore } from 'pinia'
import { renderProDateText } from 'pro-naive-ui'
import { h } from 'vue'

export const useUsersStore = defineStore('admin_users', () => {
  const service: UseProDataTablePlusService = async ({ current, pageSize }) => {
    const { data, error } = await api.admin.users.get({
      query: {
        ...userSearchFormValues.value,
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
    search: { formProps: userSearchFormProps, formValues: userSearchFormValues },
    send: getUsers,
    table: { checkedRowKeys: userCheckedRowKeys, tableProps: userDataTableProps },
  } = useProDataTablePlus<UserModelType['getAllUsersQuery'], TypeboxTypes['UserTypeboxSchemaType']>(
    {
      columns: () => [
        {
          title: '选择',
          type: 'selection',
        },
        {
          key: 'id',
          title: 'ID',
          width: 80,
        },
        {
          key: 'username',
          title: '用户名',
        },
        {
          key: 'created_at',
          render: (row) => renderProDateText(row.created_at),
          title: '创建时间',
        },
        {
          key: 'actions',
          render: (row) =>
            h(NFlex, null, {
              default: () => [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'primary',
                  },
                  { default: () => '编辑' },
                ),
                h(
                  NButton,
                  {
                    onClick: () => deleteUsers([row.id]),
                    renderIcon: renderIcon(Trash),
                    size: 'small',
                    type: 'error',
                  },
                  { default: () => '删除' },
                ),
              ],
            }),
          title: '操作',
        },
      ],
      options: {
        customProps: {
          cardTitle: '用户列表',
        },
        rowKey: (row) => row.id,
      },
      service,
    },
    {
      columns: () => [
        {
          key: 'username',
          title: '用户名',
        },
      ],
      initValues: {},
      rules: () => ({}),
    },
  )

  const { loading: deleteUsersLoading, send: _deleteUsers } = useRequest(api.admin.users.delete)
  const deleteUsers = async (ids: number[]) => {
    await _deleteUsers({
      ids,
    })
    await getUsers()
  }

  const { loading: addUserLoading, send: _addUser } = useRequest(api.admin.users.post)
  const addUser = async (values: UserModelType['createUserBody']) => {
    await _addUser(values)
    await getUsers()
  }
  const addUserModalForm = useProModalForm<UserModelType['createUserBody']>({
    initialValues: {
      username: '',
      password: '',
    },
    rules: () => ({
      username: { required: true },
      password: { required: true },
    }),
    loading: addUserLoading,
    onSubmit: addUser,
  })

  return {
    addUser,
    addUserLoading,
    addUserModalForm,

    deleteUsers,
    deleteUsersLoading,

    getUsers,
    userCheckedRowKeys,
    userDataTableProps,
    userSearchFormProps,
    userSearchFormValues,
  }
})
