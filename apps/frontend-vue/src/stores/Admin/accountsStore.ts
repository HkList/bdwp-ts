import type { TypeboxTypes } from '@backend/db'
// import type { Oneof } from '@frontend/utils/types.ts'
import type { AccountModelType } from '@backend/modules/admin/account/model.ts'
import type { SelectMixedOption } from 'naive-ui/es/select/src/interface.d.ts'

import { api } from '@frontend/api/index.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { useProModalForm } from '@frontend/hooks/useProModalForm.ts'
import { Pencil, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { defineStore } from 'pinia'
import { renderProDateText } from 'pro-naive-ui'
import { h, ref } from 'vue'
import { CookieBite } from '@vicons/fa'
import { copyText } from '@frontend/utils/copyText.ts'
import { useRequest } from '@frontend/hooks/useRequest.ts'
import { useAsyncJob } from '@frontend/hooks/useAsyncJob.ts'
import { notification } from '@frontend/utils/discreteApi.ts'

export const useAccountsStore = defineStore('admin_accounts', () => {
  const {
    search: { formProps: accountSearchFormProps, formValues: accountSearchFormValues },
    send: getAccounts,
    table: { checkedRowKeys: accountCheckedRowKeys, tableProps: accountDataTableProps },
  } = useProDataTablePlus<
    AccountModelType['getAllAccountsQuery'],
    TypeboxTypes['AccountTypeboxSchemaType']
  >(
    {
      service: async ({ current, pageSize }) => {
        const response = await api.admin.accounts.get({
          query: {
            ...accountSearchFormValues.value,
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
          key: '账号信息',
          title: '账号信息',
          render: (row) => `${row.baidu_name}(${row.uk})`,
        },
        {
          key: '组织信息',
          title: '组织信息',
          render: (row) => `${row.org_name}(${row.cid})`,
        },
        {
          key: 'ticket_remain_count',
          title: '剩余票数',
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
                    type: 'info',
                    renderIcon: renderIcon(CookieBite),
                    onClick: () => copyText(row.cookie, 'Cookie 已复制'),
                  },
                  { default: () => '复制CK' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'primary',
                    renderIcon: renderIcon(Pencil),
                    // onClick: () => updateUsersModalForm.value.open(row),
                  },
                  { default: () => '编辑' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error',
                    renderIcon: renderIcon(Trash),
                    onClick: () => deleteAccounts([row.id]),
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
          cardTitle: '账号列表',
        },
        rowKey: (row) => row.id,
      },
    },
    {
      columns: () => [
        {
          key: 'status',
          title: '状态',
          type: 'select',
          options: [
            { label: '正常', value: 'true' },
            { label: '禁用', value: 'false' },
          ],
        },
      ],
      initValues: {},
      rules: () => ({}),
    },
  )

  const { loading: deleteAccountsLoading, send: _deleteAccounts } = useRequest(
    api.admin.accounts.delete,
  )
  const deleteAccounts = async (ids: number[]) => {
    await _deleteAccounts({
      ids,
    })
    await getAccounts()
  }

  const {
    loading: getEnterpriseInfoLoading,
    data: getEnterpriseInfoData,
    send: _getEnterpriseInfo,
  } = useRequest(api.admin.accounts.get_enterprise_info.post)
  const enterpriseOptions = ref<SelectMixedOption[]>([
    {
      label: '测试',
      value: 123,
    },
  ])
  const getEnterpriseInfo = async (cookie: string) => {
    const res = await _getEnterpriseInfo({ cookie })
    if (res.error) {
      enterpriseOptions.value = []
      return
    }
    enterpriseOptions.value =
      res.data.data.map((item) => ({
        label: `${item.orgInfo.name}(${item.cid})`,
        value: item.cid,
      })) ?? []
  }
  const resetEnterpriseOptions = () => {
    enterpriseOptions.value = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ;(addAccountModalForm.value.form.values.value.cid as any) = undefined
  }

  const { loading: addAccountLoading, send: _addAccount } = useRequest(api.admin.accounts.post)
  const addAccount = async (values: AccountModelType['createAccountBody']) => {
    const res = await _addAccount(values)
    if (res.error) return false

    // 等待异步任务完成
    const response = await useAsyncJob<{ id: number }>({
      taskId: res.data.data.task_id,
    })
    if (response.status !== 'completed') {
      notification.error({
        title: response.message,
        duration: 3000,
      })
      return false
    }

    await getAccounts()
  }
  const addAccountModalForm = useProModalForm<AccountModelType['createAccountBody']>({
    rules: () => ({
      baidu_name: [{ required: true }, { min: 2, max: 50 }],
      cookie: [{ required: true }, { min: 10 }],
      cid: [
        { required: true, type: 'number' },
        { min: 1, type: 'number' },
      ],
    }),
    loading: addAccountLoading,
    onSubmit: async (value) => {
      const res = await addAccount(value)
      if (res !== false) addAccountModalForm.value.close()
    },
  })

  // const { loading: updateUserLoading, send: _updateUsers } = useRequest(api.admin.users.patch)
  // const updateUsers = async (values: UserModelType['updateUsersBody']) => {
  //   const res = await _updateUsers(values)
  //   if (res.error) return false
  //   await getUsers()
  // }
  // const updateUsersModalForm = useProModalForm<
  //   Oneof<UserModelType['updateUsersBody']>,
  //   Oneof<UserModelType['updateUsersBody']>,
  //   [Oneof<UserModelType['updateUsersBody']>]
  // >(
  //   {
  //     initialValues: { id: 0, username: '', password: '' },
  //     rules: () => ({
  //       username: [{ required: true }, { min: 3, max: 30 }],
  //     }),
  //     loading: updateUserLoading,
  //     onSubmit: async (value) => {
  //       const res = await updateUsers([value])
  //       if (res !== false) updateUsersModalForm.value.close()
  //     },
  //   },
  //   ({ password: _, ...rest }) => {
  //     updateUsersModalForm.value.form.values.value = rest
  //   },
  // )

  return {
    getEnterpriseInfo,
    resetEnterpriseOptions,
    getEnterpriseInfoLoading,
    getEnterpriseInfoData,
    enterpriseOptions,

    addAccount,
    addAccountLoading,
    addAccountModalForm,

    deleteAccounts,
    deleteAccountsLoading,

    // updateUsers,
    // updateUsersModalForm,

    getAccounts,
    accountCheckedRowKeys,
    accountDataTableProps,
    accountSearchFormProps,
    accountSearchFormValues,
  }
})
