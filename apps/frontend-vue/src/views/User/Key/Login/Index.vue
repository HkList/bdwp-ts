<script lang="ts" setup>
import { useLoginStore } from '@frontend/stores/User/loginStore.ts'
import QrLogin from '@frontend/views/User/Key/Login/QrLogin.vue'
import SmsLogin from '@frontend/views/User/Key/Login/SmsLogin.vue'
import { NTabPane, NTabs } from 'naive-ui'
import { storeToRefs } from 'pinia'

const loginStore = useLoginStore()

const { handleChangeActiveTab } = loginStore
const { activeTab } = storeToRefs(loginStore)
</script>

<template>
  <div class="login_container">
    <NTabs
      type="line"
      size="large"
      justify-content="center"
      animated
      :value="activeTab"
      class="login_tabs"
      @update:value="handleChangeActiveTab"
    >
      <NTabPane name="qrLogin" tab="扫码登录">
        <QrLogin />
      </NTabPane>
      <NTabPane name="smsLogin" tab="短信登录">
        <SmsLogin />
      </NTabPane>
    </NTabs>
  </div>
</template>

<style lang="scss" scoped>
.login_container {
  width: 100%;
  margin-top: -24px;

  .login_tabs {
    :deep(.n-tabs-pane-wrapper .n-tab-pane){
      display: flex;
      justify-content: center;
    }
  }
}
</style>
