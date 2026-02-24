<script lang="ts" setup>
import { useKeysStore } from '@frontend/stores/Admin/keysStore.ts'
import { storeToRefs } from 'pinia'
import { ProDateTime, ProDigit, ProInput, ProModalForm, ProSelect, ProSwitch } from 'pro-naive-ui'

const keysStore = useKeysStore()
const { updateKeysModalForm, selectShareLinkIdProps } = storeToRefs(keysStore)
</script>

<template>
  <ProModalForm title="编辑卡密" v-bind="updateKeysModalForm" width="800px" label-width="120px">
    <ProDigit title="卡密ID" path="id" readonly />

    <ProInput title="卡密" path="key" />

    <ProDigit title="已使用次数" path="used_count" />

    <ProDigit title="可使用次数" path="total_count" />

    <ProSelect
      title="分享链接ID" path="share_link_id" :field-props="selectShareLinkIdProps"
    />

    <ProDateTime
      title="过期时间" path="expired_at" :field-props="{
        clearable: true,
      }"
    />

    <ProDigit title="可使用时长（小时）" path="total_hours" />

    <ProSwitch title="是否禁用" path="status" />

    <ProInput title="禁用原因" path="reason" />
  </ProModalForm>
</template>

<style lang="scss" scoped></style>
