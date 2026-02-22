import type { TypeboxTypes } from '@backend/db'
import type { UserModelType } from '@backend/modules/admin/user/model.ts'
import type { Oneof } from '@frontend/utils/types.ts'

import { api } from '@frontend/api/index.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { useProModalForm } from '@frontend/hooks/useProModalForm.ts'
import { useRequest } from '@frontend/hooks/useRequest.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Pencil, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { defineStore } from 'pinia'
import { renderProDateText } from 'pro-naive-ui'
import { h } from 'vue'

export const useUsersStore = defineStore('admin_users', () => {
  const { loading: addUserLoading, send: _addUser } = useRequest(api.admin.users.post)
  const addUser = async (values: UserModelType['createUserBody']) => {
    const res = await _addUser(values)
    if (res.error) {
      return false
    }

    await getUsers()
  }
  const addUserModalForm = useProModalForm<UserModelType['createUserBody']>({
    rules: () => ({
      username: [{ required: true }, { min: 3, max: 30 }],
      password: [{ required: true }, { min: 6, max: 100 }],
    }),
    loading: addUserLoading,
    onSubmit: async (value) => {
      const res = await addUser(value)
      if (res !== false)
        addUserModalForm.value.close()
    },
  })

  const { loading: deleteUsersLoading, send: _deleteUsers } = useRequest(api.admin.users.delete)
  const deleteUsers = async (ids: number[]) => {
    await _deleteUsers({
      ids,
    })
    await getUsers()
  }

  const { loading: updateUsersLoading, send: _updateUsers } = useRequest(api.admin.users.patch)
  const updateUsers = async (users: UserModelType['updateUsersBody']) => {
    const res = await _updateUsers(users)
    if (res.error) {
      return false
    }

    await getUsers()
  }
  const updateUsersModalForm = useProModalForm<
    Oneof<UserModelType['updateUsersBody']>,
    Oneof<UserModelType['updateUsersBody']>,
    [Oneof<UserModelType['updateUsersBody']>]
  >(
    {
      rules: () => ({
        username: [{ required: true }, { min: 3, max: 30 }],
      }),
      loading: updateUsersLoading,
      onSubmit: async (user) => {
        const res = await updateUsers([user])
        if (res !== false)
          updateUsersModalForm.value.close()
      },
    },
    ({ password: _, ...rest }) => {
      updateUsersModalForm.value.form.values.value = rest
    },
  )

  const {
    search: { formProps: userSearchFormProps, formValues: userSearchFormValues },
    send: getUsers,
    table: { checkedRowKeys: userCheckedRowKeys, tableProps: userDataTableProps },
  } = useProDataTablePlus<UserModelType['getAllUsersQuery'], TypeboxTypes['UserTypeboxSchemaType']>(
    {
      service: async ({ current, pageSize }) => {
        const response = await api.admin.users.get({
          query: {
            ...userSearchFormValues.value,
            page: current,
            page_size: pageSize,
          },
        })

        if (response.error) {
          return {
            list: [],
            total: 0,
          }
        }

        return {
          list: response.data.data.data,
          total: response.data.data.total,
        }
      },
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
          render: row => renderProDateText(row.created_at),
          title: '创建时间',
        },
        {
          key: 'actions',
          render: row =>
            h(NFlex, null, {
              default: () => [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'primary',
                    renderIcon: renderIcon(Pencil),
                    onClick: () => updateUsersModalForm.value.open(row),
                  },
                  { default: () => '编辑' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error',
                    renderIcon: renderIcon(Trash),
                    onClick: () => deleteUsers([row.id]),
                  },
                  { default: () => '删除' },
                ),
              ],
            }),
          title: '操作',
        },
      ],
      options: {
        loading: () => deleteUsersLoading.value,
        customProps: {
          cardTitle: '用户列表',
        },
        rowKey: row => row.id,
      },
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

  return {
    addUser,
    addUserLoading,
    addUserModalForm,

    deleteUsers,
    deleteUsersLoading,

    updateUsers,
    updateUsersModalForm,

    getUsers,
    userCheckedRowKeys,
    userDataTableProps,
    userSearchFormProps,
    userSearchFormValues,
  }
})
