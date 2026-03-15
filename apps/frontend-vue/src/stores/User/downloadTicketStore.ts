import type { ParseModel, ParseModelType } from '@backend/modules/user/parse/model.ts'
import { api } from '@frontend/api/index.ts'
import { useProDataTablePlus } from '@frontend/hooks/useProDataTablePlus.ts'
import { formatBytes } from '@frontend/utils/format.ts'
import { parseBaiduShareLink } from '@frontend/utils/parseBaiduShareLink.ts'
import { defineStore } from 'pinia'
import { useRequest } from 'pro-naive-ui'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

export const useDownloadTicketStore = defineStore('user_download_ticket', () => {
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

        return {
          list: response.data.data.list,
          total: 0,
        }
      },
      columns: () => [
        {
          type: 'selection',
        },
        {
          title: '文件名',
          path: 'server_filename',
        },
        {
          title: '文件大小',
          path: 'size',
          render: ({ size }) => formatBytes(size),
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
