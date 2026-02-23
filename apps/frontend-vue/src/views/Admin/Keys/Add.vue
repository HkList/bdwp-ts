<script lang="ts" setup>
import { useKeysStore } from '@frontend/stores/Admin/keysStore.ts'
import { NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ProButton, ProDigit, ProModalForm, ProSelect, ProTextarea } from 'pro-naive-ui'

const keysStore = useKeysStore()

const { addKeyModalForm, addRandomModalForm, selectAccountIdProps } = storeToRefs(keysStore)
</script>

<template>
  <ProModalForm title="新建密钥" v-bind="addKeyModalForm" width="700px" label-width="120px">
    <ProSelect
      title="账号ID" path="account_id" :field-props="selectAccountIdProps"
    />

    <ProTextarea
      title="密钥列表"
      path="keys"
    />

    <ProDigit title="可使用次数" path="total_count" />

    <ProDigit title="可使用时长（小时）" path="total_hours" />

    <template #footer>
      <NFlex justify="end">
        <ProButton attr-type="reset" @click="addKeyModalForm.form.close">
          取消
        </ProButton>

        <ProButton
          type="info"
          @click="addRandomModalForm.form.open()"
        >
          生成随机卡密
        </ProButton>

        <ProButton
          type="primary"
          attr-type="submit"
          @click="addKeyModalForm.form.submit"
        >
          确定
        </ProButton>
      </NFlex>
    </template>
  </ProModalForm>

  <ProModalForm title="生成随机密钥" v-bind="addRandomModalForm">
    <ProDigit title="生成数量" path="count" />
  </ProModalForm>
</template>

<style lang="scss" scoped></style>
