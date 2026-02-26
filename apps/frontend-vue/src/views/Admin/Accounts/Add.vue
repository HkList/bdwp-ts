<script lang="ts" setup>
import { useAccountsStore } from '@frontend/stores/Admin/accountsStore.ts'
import { NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ProButton, ProInput, ProModalForm, ProSelect } from 'pro-naive-ui'

const accountsStore = useAccountsStore()
const { resetEnterpriseOptions, getEnterpriseInfo } = accountsStore
const { addAccountModalForm, enterpriseOptions } = storeToRefs(accountsStore)
</script>

<template>
  <ProModalForm title="新建账号" v-bind="addAccountModalForm">
    <ProInput title="百度名称" path="baidu_name" />

    <ProInput title="Cookie" path="cookie" @change="resetEnterpriseOptions" />

    <ProSelect
      title="所属组织"
      path="cid"
      :field-props="{
        options: enterpriseOptions,
      }"
    />

    <template #footer>
      <NFlex justify="end">
        <ProButton attr-type="reset" @click="addAccountModalForm.form.close">
          取消
        </ProButton>

        <ProButton
          type="info"
          :disabled="!addAccountModalForm.form.values.value.cookie"
          @click="getEnterpriseInfo({ cookie: addAccountModalForm.form.values.value.cookie })"
        >
          获取组织信息
        </ProButton>

        <ProButton
          type="primary"
          attr-type="submit"
          :disabled="addAccountModalForm.form.values.value.cid === undefined"
          @click="addAccountModalForm.form.submit"
        >
          确定
        </ProButton>
      </NFlex>
    </template>
  </ProModalForm>
</template>

<style lang="scss" scoped></style>
