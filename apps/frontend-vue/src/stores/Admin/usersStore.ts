import { api } from '@frontend/api/index.ts'
import { defineStore } from 'pinia'
import type { UserModelType } from '@backend/modules/admin/user/model.ts'
import { ref } from 'vue'
import {
  useNDataTablePlus,
  type UseNDataTablePlusService,
} from '@frontend/utils/useNDataTablePlus.ts'

export const useUserStore = defineStore('admin_users', () => {
  const searchForm = ref<UserModelType['getAllUsersQuery']>({
    page: 1,
    page_size: 10,
  })

  const warpedGetUsers: UseNDataTablePlusService = async ({ current, pageSize }) => {
    const { data, error } = await api.admin.users.get({
      query: {
        ...searchForm.value,
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
    runAsync: getUsers,
    table: { tableProps: getUsersTableProps },
    search: { columns: searchFormColumns, rules: searchFormRules },
  } = useNDataTablePlus<UserModelType['getAllUsersQuery']>(warpedGetUsers, [
    {
      title: '用户名',
      key: 'username',
    },
  ])

  return {
    searchFormColumns,
    searchFormRules,
    searchForm,

    getUsers,
    getUsersTableProps,
  }
})
