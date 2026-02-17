import { api } from '@frontend/api'
import { defineStore } from 'pinia'
import type { UserModelType } from '@backend/modules/admin/user/model'
import { ref } from 'vue'
import {
  useProDataTablePlus,
  type UseProDataTablePlusService,
} from '@frontend/components/ProDataTablePlus'
import { useDataTableSection } from '@frontend/utils/useDataTableSection'
import type { TypeboxTypes } from '@backend/db'

export const useUsersStore = defineStore('admin_users', () => {
  const searchForm = ref<UserModelType['getAllUsersQuery']>({
    page: 1,
    page_size: 10,
  })

  const warpedGetUsers: UseProDataTablePlusService = async ({ current, pageSize }) => {
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
    table: { tableProps: getUsersTableProps, onChange: getUsers },
    search: {
      proSearchFormProps: searchFormProps,
      rules: searchFormRules,
      columns: searchFormColumns,
    },
  } = useProDataTablePlus<UserModelType['getAllUsersQuery']>(
    warpedGetUsers,
    [
      {
        title: '用户名',
        key: 'username',
      },
    ],
    {},
  )

  const dataTableSectionAttrs = useDataTableSection<TypeboxTypes['UserTypeboxSchemaType']>(
    (row) => row.id,
  )

  return {
    searchForm,
    searchFormProps,
    searchFormRules,
    searchFormColumns,

    getUsers,
    getUsersTableProps,

    dataTableSectionAttrs,
  }
})
