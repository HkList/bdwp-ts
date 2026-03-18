import type { TypeboxTypes } from '@backend/db'
import type { CreateKeyJobRawResponse } from '@backend/jobs/createKeys.ts'
import type { KeyModelType } from '@backend/modules/admin/key/model.ts'
import type { Oneof } from '@frontend/utils/types.ts'

import type { SelectOption, SelectProps } from 'naive-ui'
import { api } from '@frontend/api/index.ts'
import { useAsyncJob } from '@frontend/hooks/useAsyncJob.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { useProModalForm } from '@frontend/hooks/useProModalForm.ts'
import { router } from '@frontend/router/index.ts'
import { notification } from '@frontend/utils/discreteApi.ts'
import { randomString } from '@frontend/utils/randomString.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Pencil, Person, ShareSocial, Trash } from '@vicons/ionicons5'
import { NButton, NFlex } from 'naive-ui'
import { defineStore } from 'pinia'
import { renderProDateText, useRequest } from 'pro-naive-ui'
import { computed, h, ref } from 'vue'

export const useKeysStore = defineStore('admin_keys', () => {
  const { loading: addKeyLoading, runAsync: _addKey } = useRequest(api.admin.keys.post, { manual: true })
  const addKey = async (value: KeyModelType['createKeyBody']) => {
    const res = await _addKey(value)
    if (res.error) {
      return false
    }

    // 等待异步任务完成
    const response = await useAsyncJob<CreateKeyJobRawResponse>({
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
      title: '卡密创建成功',
      duration: 3000,
    })

    await getKeys()
  }
  const addKeyModalForm = useProModalForm<Omit<KeyModelType['createKeyBody'], 'keys'> & { keys: string }>({
    initialValues: {
      // 默认未选择账号, 所以设置为 undefined
      account_id: undefined as unknown as number,
      keys: '',
      total_count: 100,
      total_hours: 100,
      disable_create_share_link: false,
    },
    rules: () => ({
      account_id: [{ required: true, type: 'number' }],
      keys: [{ required: true }],
      total_count: [{ required: true, type: 'number' }, { min: 0, type: 'number' }],
      total_hours: [{ required: true, type: 'number' }, { min: 0, type: 'number' }],
    }),
    loading: addKeyLoading,
    onSubmit: async (value) => {
      const res = await addKey({
        ...value,
        keys: value.keys.split('\n').map(key => key.trim()).filter(key => key.length > 0),
      })
      if (res !== false) {
        addKeyModalForm.value.close()
      }
    },
    onOpen: () => {
      const onSearch = selectAccountIdProps.value.onSearch
      if (typeof onSearch === 'function') {
        onSearch('')
      }
    },
  })

  const addRandomModalForm = useProModalForm<{ count: number }>({
    initialValues: {
      count: 10,
    },
    rules: () => ({
      count: [{ required: true, type: 'number' }, { min: 1, type: 'number' }],
    }),
    loading: addKeyLoading,
    onSubmit: async (value) => {
      addKeyModalForm.value.form.values.value.keys = Array.from({ length: value.count }).fill(randomString(8)).join('\n')
      addRandomModalForm.value.close()
    },
  })

  const { loading: getAccountsLoading, runAsync: getAccounts } = useRequest(api.admin.accounts.get, { manual: true })
  const selectAccountIdOptions = ref<SelectOption[]>([])
  const selectAccountIdProps = computed<SelectProps>(() => ({
    remote: true,
    filterable: true,
    clearable: true,
    options: selectAccountIdOptions.value,
    loading: getAccountsLoading.value,
    onSearch: async (value) => {
      const res = await getAccounts({
        query: {
          baidu_name: value,
          page: 1,
          page_size: 100,
        },
      })
      if (res.error) {
        selectAccountIdOptions.value = []
        return
      }
      selectAccountIdOptions.value = res.data.data.data.map(item => ({
        label: `${item.baidu_name} 企业名: ${item.org_name} 剩余下载卷: ${item.ticket_remain_count}`,
        value: item.id,
      }))
    },
  }))

  const { loading: deleteKeysLoading, runAsync: _deleteKeys } = useRequest(api.admin.keys.delete, { manual: true })
  const deleteKeys = async (ids: number[]) => {
    await _deleteKeys({
      ids,
    })
    await getKeys()
  }

  const { loading: updateKeysLoading, runAsync: _updateKeys } = useRequest(api.admin.keys.patch, { manual: true })
  const updateKeys = async (keys: KeyModelType['updateKeysBody']) => {
    const res = await _updateKeys(keys)
    if (res.error) {
      return false
    }

    await getKeys()
  }
  const updateKeysModalForm = useProModalForm<
    Oneof<KeyModelType['updateKeysBody']>,
    Oneof<KeyModelType['updateKeysBody']>,
    [Oneof<KeyModelType['updateKeysBody']>]
  >(
    {
      rules: () => ({
        key: [{ required: true }],
        used_count: [{ required: true, type: 'number' }, { min: 0, type: 'number' }],
        total_count: [{ required: true, type: 'number' }, { min: 0, type: 'number' }],
        expired_at: [{ type: 'date' }],
        total_hours: [{ required: true, type: 'number' }, { min: 0, type: 'number' }],
        status: [{ required: true, type: 'boolean' }],
      }),
      loading: updateKeysLoading,
      onSubmit: async (key) => {
        const res = await updateKeys([key])
        if (res !== false) {
          updateKeysModalForm.value.close()
        }
      },
      onOpen: () => {
        const onSearch = selectShareLinkIdProps.value.onSearch
        if (typeof onSearch === 'function') {
          onSearch('')
        }
      },
    },
    (item) => {
      // 由于 ProModalForm 的日期组件需要 Number 类型，而接口返回的是 Date 类型的日期，所以在这里进行转换
      item.expired_at = (item.expired_at ? item.expired_at.getTime() : undefined) as unknown as Date
      updateKeysModalForm.value.form.values.value = item
    },
  )
  const { loading: getShareLinksLoading, runAsync: getShareLinks } = useRequest(api.admin.share_links.get, { manual: true })
  const selectShareLinkOptions = ref<SelectOption[]>([])
  const selectShareLinkIdProps = computed<SelectProps>(() => ({
    remote: true,
    filterable: true,
    clearable: true,
    options: selectShareLinkOptions.value,
    loading: getShareLinksLoading.value,
    onSearch: async (value) => {
      const res = await getShareLinks({
        query: {
          page: 1,
          page_size: 100,
          surl: value,
        },
      })
      if (res.error) {
        selectShareLinkOptions.value = []
        return
      }
      selectShareLinkOptions.value = res.data.data.data.map(item => ({
        label: `路径:${item.path} 分享链接:${item.surl} 下载卷:${item.use_count}/${item.total_count}`,
        value: item.id,
      }))
    },
  }))

  const {
    search: { formProps: keySearchFormProps, formValues: keySearchFormValues },
    send: getKeys,
    table: { checkedRowKeys: keyCheckedRowKeys, tableProps: keyDataTableProps },
  } = useProDataTablePlus<KeyModelType['getAllKeysQuery'], TypeboxTypes['Key']>(
    {
      service: async ({ current, pageSize }) => {
        const response = await api.admin.keys.get({
          query: {
            ...keySearchFormValues.value,
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
          path: 'key',
          title: '卡密',
        },
        {
          title: '用户信息',
          render: (row) => {
            if (!row.user_data) {
              return '卡密未绑定用户'
            }

            return `百度名: ${row.user_data.baidu_name} 网盘名: ${row.user_data.netdisk_name} UK: ${row.user_data.uk}`
          },
        },
        {
          title: '可用次数',
          render: row => `${row.used_count}/${row.total_count === 0 ? '无限制' : row.total_count}`,
        },
        {
          title: '到期时间',
          render: row => row.total_hours === 0
            ? '永久有效'
            : row.expired_at
              ? renderProDateText(row.expired_at)
              : '暂无到期时间',
        },
        {
          title: '状态',
          render: row => row.status ? '正常' : `禁用(${row.reason})`,
        },
        {
          path: 'created_at',
          title: '创建时间',
          render: row => renderProDateText(row.created_at),
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
                    type: 'primary',
                    renderIcon: renderIcon(Pencil),
                    onClick: () => updateKeysModalForm.value.open({
                      ...row,
                      share_link_id: row.share_link_id ?? undefined,
                      expired_at: row.expired_at ?? undefined,
                    }),
                  },
                  { default: () => '编辑' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error',
                    renderIcon: renderIcon(Trash),
                    onClick: () => deleteKeys([row.id]),
                  },
                  { default: () => '删除' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'info',
                    renderIcon: renderIcon(Person),
                    onClick: () => router.push({
                      path: '/admin/accounts',
                      query: {
                        id: row.account_id,
                      },
                    }),
                  },
                  { default: () => '跳转到账号' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'info',
                    renderIcon: renderIcon(ShareSocial),
                    onClick: () => {
                      if (!row.share_link_id) {
                        notification.warning({
                          title: '该卡密没有分享链接',
                          duration: 3000,
                        })
                        return
                      }

                      router.push({
                        path: '/admin/share_links',
                        query: {
                          id: row.share_link_id,
                        },
                      })
                    },
                  },
                  { default: () => '跳转到分享链接' },
                ),
              ],
            })
          },
        },
      ],
      options: {
        loading: () => deleteKeysLoading.value,
        customProps: {
          cardTitle: '卡密列表',
        },
        rowKey: row => row.id,
      },
    },
    {
      columns: () => [
        {
          path: 'key',
          title: '卡密',
        },
      ],
      initValues: {},
    },
  )

  return {
    addKey,
    addKeyLoading,
    addKeyModalForm,
    addRandomModalForm,
    selectAccountIdProps,

    deleteKeys,
    deleteKeysLoading,

    updateKeys,
    updateKeysModalForm,
    selectShareLinkIdProps,

    getKeys,
    keyCheckedRowKeys,
    keyDataTableProps,
    keySearchFormProps,
    keySearchFormValues,
  }
})
