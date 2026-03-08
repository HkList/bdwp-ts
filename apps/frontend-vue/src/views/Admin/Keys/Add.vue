<script lang="ts" setup>
import { useKeysStore } from '@frontend/stores/Admin/keysStore.ts'
import { NAlert, NFlex } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { ProButton, ProDigit, ProModalForm, ProSelect, ProSwitch, ProTextarea } from 'pro-naive-ui'

const keysStore = useKeysStore()

const { addKeyModalForm, addRandomModalForm, selectAccountIdProps } = storeToRefs(keysStore)
</script>

<template>
  <ProModalForm title="新建卡密" v-bind="addKeyModalForm" width="700px" label-width="150px">
    <ProSelect
      title="账号ID" path="account_id" :field-props="selectAccountIdProps"
    />

    <ProTextarea
      title="卡密列表"
      path="keys"
    />

    <NAlert type="info" title="卡密列表" class="alert">
      卡密请通过换行分隔
    </NAlert>

    <ProDigit title="可使用次数" path="total_count" />

    <ProDigit title="可用时间（小时）" path="total_hours" />

    <NAlert type="info" title="配额提示" class="alert">
      可用次数和可用时间都可以为0，表示不限制。
    </NAlert>

    <ProSwitch
      title="禁用创建分享链接"
      path="disable_create_share_link"
    />

    <NAlert type="error" title="禁用创建分享链接" class="alert">
      <p>
        开启后，系统将不会为生成的卡密自动创建分享链接。
        此选项适用于已经有分享链接了, 但是没有下载卷的情况。
      </p>
      <p>
        这意味着您需要手动为每个卡密创建分享链接，
        <span style="color: red;">
          否则创建的卡密会占用其他卡密创建了之后还没有使用过的分享链接。
        </span>
      </p>
    </NAlert>

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

  <ProModalForm title="生成随机卡密" v-bind="addRandomModalForm">
    <ProDigit title="生成数量" path="count" />
  </ProModalForm>
</template>

<style lang="scss" scoped>
.alert {
  margin-bottom: 24px;
}
</style>
