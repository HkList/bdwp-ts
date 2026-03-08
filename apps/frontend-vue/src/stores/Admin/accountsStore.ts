import type { TypeboxTypes } from '@backend/db'
import type { CreateOrUpdateAccountJobRawResponse } from '@backend/jobs/createOrUpdateAccount.ts'
import type { AccountModelType } from '@backend/modules/admin/account/model.ts'
import type { Oneof } from '@frontend/utils/types.ts'
import type { SelectOption } from 'naive-ui'

import { api } from '@frontend/api/index.ts'
import { useAsyncJob } from '@frontend/hooks/useAsyncJob.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { useProModalForm } from '@frontend/hooks/useProModalForm.ts'
import { useRouteQueryWatcher } from '@frontend/hooks/useRouteQueryWatcher.ts'
import { copyText } from '@frontend/utils/copyText.ts'
import { dialog, notification } from '@frontend/utils/discreteApi.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { CookieBite } from '@vicons/fa'
import { Pencil, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { defineStore } from 'pinia'
import { renderProDateText, useRequest } from 'pro-naive-ui'
import { h, ref } from 'vue'

export const useAccountsStore = defineStore('admin_accounts', () => {
  const {
    loading: getEnterpriseInfoLoading,
    data: getEnterpriseInfoData,
    runAsync: _getEnterpriseInfo,
  } = useRequest(api.admin.accounts.get_enterprise_info.post, { manual: true })
  const enterpriseOptions = ref<SelectOption[]>([])
  const getEnterpriseInfo = async (params: AccountModelType['getEnterpriseInfoBody']) => {
    const res = await _getEnterpriseInfo(params)
    if (res.error) {
      enterpriseOptions.value = []
      return
    }

    enterpriseOptions.value = res.data.data.map(item => ({
      label: `${item.orgInfo.name}(${item.cid})`,
      value: item.cid,
    }))
  }
  const resetEnterpriseOptions = () => {
    enterpriseOptions.value = []

    addAccountModalForm.value.form.resetFieldValue('cid')
  }

  const { loading: addAccountLoading, runAsync: _addAccount } = useRequest(api.admin.accounts.post, { manual: true })
  const addAccount = async (values: AccountModelType['createAccountBody']) => {
    const res = await _addAccount(values)
    if (res.error) {
      return false
    }

    // 等待异步任务完成
    const response = await useAsyncJob<CreateOrUpdateAccountJobRawResponse>({
      task_id: res.data.data.task_id,
    })
    if (response.status !== 'completed') {
      notification.error({
        title: response.message,
        duration: 3000,
      })
      return false
    }

    notification.success({
      title: '账号创建成功',
      duration: 3000,
    })

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
      if (res !== false) {
        addAccountModalForm.value.close()
      }
    },
  })

  const { loading: deleteAccountsLoading, runAsync: _deleteAccounts } = useRequest(
    api.admin.accounts.delete,
    { manual: true },
  )
  const deleteAccounts = async (ids: number[]) => {
    dialog.create({
      title: '确认删除账号',
      content: `此操作会删除关联的分享链接, 但不会删除关联的卡密, 确定要删除选中的 ${ids.length} 个账号吗？`,
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: async () => {
        await _deleteAccounts({
          ids,
        })
        await getAccounts()
      },
    })
  }

  const { loading: updateAccountsLoading, runAsync: _updateAccounts } = useRequest(
    api.admin.accounts.patch,
    { manual: true },
  )
  const updateAccounts = async (values: AccountModelType['updateAccountsBody']) => {
    const res = await _updateAccounts(values)
    if (res.error) {
      return false
    }

    if (!res.data.data.task_id[0]) {
      notification.error({
        title: '没有需要更新的账号',
        duration: 3000,
      })
      return false
    }

    // 等待异步任务完成
    const response = await useAsyncJob<CreateOrUpdateAccountJobRawResponse>({
      task_id: res.data.data.task_id[0],
    })
    if (response.status !== 'completed') {
      notification.error({
        title: response.message,
        duration: 3000,
      })
      return false
    }

    notification.success({
      title: '账号更新成功',
      duration: 3000,
    })

    await getAccounts()
  }
  const updateAccountsModalForm = useProModalForm<
    Oneof<AccountModelType['updateAccountsBody']>,
    Oneof<AccountModelType['updateAccountsBody']>,
    [Oneof<AccountModelType['updateAccountsBody']>]
  >(
    {
      initialValues: { id: 0, baidu_name: '', cookie: '' },
      rules: () => ({
        baidu_name: [{ required: true }, { min: 2, max: 50 }],
        cookie: [{ required: true }, { min: 10 }],
      }),
      loading: updateAccountsLoading,
      onSubmit: async (account) => {
        const res = await updateAccounts([account])
        if (res !== false) {
          updateAccountsModalForm.value.close()
        }
      },
    },
    (account) => {
      updateAccountsModalForm.value.form.values.value = account
    },
  )

  const {
    search: { formProps: accountSearchFormProps, formValues: accountSearchFormValues },
    send: getAccounts,
    table: { checkedRowKeys: accountCheckedRowKeys, tableProps: accountDataTableProps },
  } = useProDataTablePlus<
    AccountModelType['getAllAccountsQuery'],
    TypeboxTypes['Account']
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
          type: 'selection',
        },
        {
          path: 'id',
          title: 'ID',
          width: 80,
        },
        {
          title: '账号信息',
          render: row => `${row.baidu_name}(${row.uk})`,
        },
        {
          title: '组织信息',
          render: row => `${row.org_name}(${row.cid})`,
        },
        {
          path: 'ticket_remain_count',
          title: '剩余票数',
        },
        {
          title: '账号状态',
          render: row => `${row.status ? '正常' : `禁用(${row.reason})`}`,
        },
        {
          render: row => renderProDateText(row.created_at),
          title: '创建时间',
        },
        {
          title: '操作',
          render: (row) => {
            return h(NFlex, null, {
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
                    onClick: () => updateAccountsModalForm.value.open(row),
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
            })
          },
        },
      ],
      options: {
        loading: () => deleteAccountsLoading.value,
        customProps: {
          cardTitle: '账号列表',
        },
        rowKey: row => row.id,
      },
    },
    {
      columns: () => [
        {
          path: 'id',
          title: 'ID',
          type: 'number',
        },
        {
          path: 'status',
          title: '状态',
          type: 'select',
          options: [
            { label: '正常', value: 'true' },
            { label: '禁用', value: 'false' },
          ],
        },
        {
          path: 'baidu_name',
          title: '百度账号名称',
        },
        {
          path: 'uk',
          title: '百度账号UK',
        },
        {
          path: 'org_name',
          title: '组织名称',
        },
        {
          path: 'cid',
          title: '组织CID',
        },
      ],
      initValues: {},
    },
  )

  useRouteQueryWatcher(
    path => path.includes('/admin/accounts'),
    (query) => {
      if (query.id) {
        accountSearchFormValues.value.id = Number(query.id)
      }

      if (Object.keys(query).length > 0) {
        getAccounts()
      }
    },
  )

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

    updateAccounts,
    updateAccountsModalForm,

    getAccounts,
    accountCheckedRowKeys,
    accountDataTableProps,
    accountSearchFormProps,
    accountSearchFormValues,
  }
})
