import type { TypeboxTypes } from '@backend/db'
import type { ShareLinkModelType } from '@backend/modules/admin/share_link/model.ts'

import { api } from '@frontend/api/index.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { useRequest } from '@frontend/hooks/useRequest.ts'
import { router } from '@frontend/router/index.ts'
import { dialog } from '@frontend/utils/discreteApi.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Person, Trash } from '@vicons/ionicons5'
import { NA, NButton, NFlex } from 'naive-ui'
import { defineStore } from 'pinia'
import { ProDataTable, renderProDateText, renderProImages } from 'pro-naive-ui'
import { h } from 'vue'

export const useShareLinksStore = defineStore('admin_share_links', () => {
  const {
    table: { tableProps: shareLinkShareInfoTkbindListDataTableProps },
  } = useProDataTablePlus<object, TypeboxTypes['ShareLinkShareInfoTkbindList']>({
    // 假数据
    service: async () => ({ list: [], total: 0 }),
    options: { rowKey: row => row.uk, disablePagination: true },
    columns: () => [
      {
        type: 'index',
        title: '序号',
      },
      {
        title: '用户信息',
        render: row => `${row.username}(${row.uk})`,
      },
      {
        title: '用户头像',
        render: (bind: TypeboxTypes['ShareLinkShareInfoTkbindList']) => renderProImages(bind.avatar),
      },
      {
        title: '绑定日期',
        render: (bind: TypeboxTypes['ShareLinkShareInfoTkbindList']) => renderProDateText(bind.ctime * 1000),
      },
    ],
  })

  const { loading: deleteShareLinksLoading, send: _deleteShareLinks } = useRequest(api.admin.share_links.delete)
  async function deleteShareLinks(params: ShareLinkModelType['deleteShareLinkBody']) {
    dialog.create({
      title: '确认删除分享链接',
      content: () => h(NFlex, { vertical: true }, {
        default: () => [
          h(
            'div',
            { style: { color: 'red' } },
            params.force
              ? '强制删除会不检查分享链接的情况, 直接删除分享链接, '
              : '删除会检查分享链接的状态, 如果分享链接有效就会忽略不删除选中的条目, ',
          ),
          h('div', `但不会删除关联的卡密, 确定要删除选中的 ${params.ids.length} 个分享链接吗？`),
        ],
      }),
      positiveText: '确认',
      negativeText: '取消',
      onPositiveClick: async () => {
        await _deleteShareLinks(params)
        await getShareLinks()
      },
    })
  }

  const {
    search: { formValues: shareLinkSearchFormValues },
    send: getShareLinks,
    table: { tableProps: shareLinkDataTableProps, checkedRowKeys: shareLinkCheckedRowKeys },
  } = useProDataTablePlus<ShareLinkModelType['getAllShareLinksQuery'], TypeboxTypes['ShareLink']>(
    {
      service: async ({ current, pageSize }) => {
        const response = await api.admin.share_links.get({
          query: {
            ...shareLinkSearchFormValues.value,
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
          type: 'expand',
          expandable: row => row.share_info !== null,
          renderExpand: row => h(ProDataTable, {
            ...shareLinkShareInfoTkbindListDataTableProps.value,
            data: row.share_info?.tkbind_list ?? [],
          }),
        },
        {
          type: 'selection',
        },
        {
          path: 'id',
          title: 'ID',
          width: 80,
        },
        {
          title: '分享链接',
          render: row => h(
            NA,
            {
              href: `https://pan.baidu.com/s/${row.surl}?pwd=${row.pwd}`,
              target: '_blank',
            },
            { default: () => `https://pan.baidu.com/s/${row.surl}?pwd=${row.pwd}` },
          ),
        },
        {
          path: 'path',
          title: '绑定路径',
        },
        {
          title: '下载卷使用情况',
          render: row => row.share_info
            ? `已使用 ${row.share_info.total_count} 张 / 共 ${row.share_info.use_count} 张`
            : '获取分享信息失败',
        },
        {
          title: '本地端-创建时间',
          render: row => renderProDateText(row.created_at),
        },
        {
          title: '百度端-创建时间',
          render: row => renderProDateText(row.ctime),
        },
        {
          title: '操作',
          fixed: 'right',
          render: (row) => {
            return h(NFlex, null, {
              default: () => [
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'info',
                    renderIcon: renderIcon(Person),
                    onClick: () => {
                      router.push({
                        path: '/admin/accounts',
                        query: {
                          id: row.account_id,
                        },
                      })
                    },
                  },
                  { default: () => '跳转到账号' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error',
                    renderIcon: renderIcon(Trash),
                    onClick: () => deleteShareLinks({ ids: [row.id] }),
                  },
                  { default: () => '删除' },
                ),
                h(
                  NButton,
                  {
                    size: 'small',
                    type: 'error',
                    renderIcon: renderIcon(Trash),
                    onClick: () => deleteShareLinks({ ids: [row.id], force: true }),
                  },
                  { default: () => '强制删除' },
                ),

              ],
            })
          },
        },
      ],
      options: {
        customProps: {
          cardTitle: '分享链接列表',
        },
        rowKey: row => row.id,
      },
    },
    {
      columns: () => [],
      initValues: {},
    },
  )

  return {
    getShareLinks,
    shareLinkDataTableProps,
    shareLinkCheckedRowKeys,
    shareLinkSearchFormValues,

    deleteShareLinks,
    deleteShareLinksLoading,
  }
})
