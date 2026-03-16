import type { ParseModel, ParseModelType } from '@backend/modules/user/parse/model.ts'
import { api } from '@frontend/api/index.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { useLayoutStore } from '@frontend/stores/layoutStore.ts'
import { formatBytes } from '@frontend/utils/format.ts'
import { iconList } from '@frontend/utils/genFileIcon'
import { getFileIcon } from '@frontend/utils/genFileIcon.ts'
import { parseBaiduShareLink } from '@frontend/utils/parseBaiduShareLink.ts'
import { NA } from 'naive-ui'
import { defineStore, storeToRefs } from 'pinia'
import { renderProDateText, useRequest } from 'pro-naive-ui'
import { computed, h } from 'vue'
import { useRoute } from 'vue-router'

export const useDownloadTicketStore = defineStore('user_download_ticket', () => {
  const layoutStore = useLayoutStore()
  const { isMobile } = storeToRefs(layoutStore)

  const route = useRoute()
  const key = computed<string>(() => {
    if (Array.isArray(route.params.key)) {
      return route.params.key[0] ?? ''
    }
    return route.params.key ?? ''
  })

  const { loading: getKeyInfoLoading, data: keyInfo, runAsync: getKeyInfo } = useRequest(api.user.parse.get_key_info.get, { manual: true })

  const { data: getFileListData, runAsync: _getFileList } = useRequest(api.user.parse.get_list.get, { manual: true })
  const {
    search: { formProps: fileListSearchFormProps, formValues: fileListSearchFormValues },
    send: getFileList,
    table: { tableProps: fileListDataTableProps, checkedRowKeys: fileListCheckedRowKeys },
  } = useProDataTablePlus<ParseModelType['getListQuery'], (typeof ParseModel['getListSuccess']['static'])['data']['list'][number]>(
    {
      service: async () => {
        const response = await _getFileList({
          query: {
            ...fileListSearchFormValues.value,
            surl: parseBaiduShareLink(fileListSearchFormValues.value.surl).surl,
          },
        })

        if (response.error) {
          return {
            list: [],
            total: 0,
          }
        }

        if (fileListSearchFormValues.value.dir !== '/') {
          let prevDir = fileListSearchFormValues.value.dir?.split('/').slice(0, -1).join('/') ?? '/'
          if (prevDir === '') {
            prevDir = '/'
          }
          response.data.data.list.unshift({
            category: 0,
            fs_id: -1,
            is_dir: true,
            local_ctime: 0,
            local_mtime: 0,
            path: prevDir,
            server_ctime: 0,
            server_filename: '..',
            server_mtime: 0,
            size: 0,
            md5: '',
          })
        }

        return {
          list: response.data.data.list,
          total: 0,
        }
      },
      columns: () => [
        {
          type: 'selection',
          disabled: ({ is_dir }) => is_dir, // 禁止选择文件夹
        },
        {
          title: '文件名',
          render: (row) => {
            return h(
              'p',
              { style: 'display: flex; gap: 8px;' },
              [
                h('img', { style: 'width: 22px; height: 22px;', src: row.is_dir ? iconList.folder : getFileIcon(row.server_filename) }),
                row.is_dir
                  ? h(NA, { onClick: () => openDir(row), onDblclick: () => openDir(row, true) }, () => row.server_filename)
                  : row.server_filename,
              ],
            )
          },
        },
        {
          title: '文件大小',
          render: ({ size }) => formatBytes(size),
        },
        {
          title: '修改时间',
          render: ({ server_mtime }) => renderProDateText(server_mtime * 1000),
        },
      ],
      options: {
        customProps: {
          cardTitle: '文件列表',
          scrollX: 'unset',
        },
        disablePagination: true,
        manual: true,
        rowKey: row => row.fs_id,
      },
    },
    {
      columns: () => [
        {
          path: 'surl',
          title: '分享链接',
          onBlur() {
            const { url, pwd } = parseBaiduShareLink(fileListSearchFormValues.value.surl)
            fileListSearchFormValues.value.surl = url
            if (pwd !== '') {
              fileListSearchFormValues.value.pwd = pwd
            }
          },
        },
        {
          path: 'pwd',
          title: '提取码',
        },
        {
          path: 'dir',
          title: '当前路径',
          disabled: true,
        },
      ],
      rules: () => ({
        surl: { required: true },
      }),
      initValues: {
        key: key.value,
        surl: '',
        dir: '/',
      },
      title: '分享链接信息',
      searchFormItemStyle: 'width: 100% !important;',
    },
  )

  const openDir = async (row: (typeof ParseModel['getListSuccess']['static'])['data']['list'][number], isDblClick = false) => {
    if (
      !row.is_dir
      || (!isDblClick && !isMobile.value)
    ) {
      return
    }

    fileListSearchFormValues.value.dir = row.path
    await getFileList()
  }

  const transferSelectedFile = () => {
    console.error('选中的ID', fileListCheckedRowKeys.value)
  }

  return {
    key,

    keyInfo,
    getKeyInfo,
    getKeyInfoLoading,

    getFileList,
    getFileListData,
    fileListSearchFormProps,
    fileListSearchFormValues,
    fileListDataTableProps,
    fileListCheckedRowKeys,

    transferSelectedFile,
  }
})
