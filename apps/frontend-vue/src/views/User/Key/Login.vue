<script lang="ts" setup>
import { useLayoutStore } from '@frontend/stores/layoutStore.ts'
import { useDownloadTicketStore } from '@frontend/stores/User/downloadTicketStore.ts'
import { useLoginStore } from '@frontend/stores/User/loginStore.ts'
import { formatTime } from '@frontend/utils/format.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { LogIn, PhonePortrait, Refresh } from '@vicons/ionicons5'
import { NButton, NFlex, NIcon, NQrCode, NSpin, NTabPane, NTabs, NTag } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'

const downloadTicketStore = useDownloadTicketStore()
const loginStore = useLoginStore()
const layoutStore = useLayoutStore()

const {
  getQrCode,
  loginByQrCode,
  handleChangeActiveTab,
  wakeUpMobileAppLogin,
} = loginStore

const { isMobile } = storeToRefs(layoutStore)
const { key } = storeToRefs(downloadTicketStore)
const {
  activeTab,

  getQrCodeLoading,
  getQrCodeResponse,
  qrCodeExpireTimeElapsed,

  loginByQrCodeLoading,
} = storeToRefs(loginStore)

onMounted(async () => {
  await getQrCode(key.value)
})
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
        <NFlex
          :style="{ height: '100%' }"
          justify="center"
          align="center"
          :size="20"
          vertical
        >
          <template
            v-if="getQrCodeLoading || !getQrCodeResponse"
          >
            <NSpin size="large" />
            <h2>
              获取二维码中...
            </h2>
          </template>

          <p v-else-if="getQrCodeResponse.error">
            获取二维码失败: {{ getQrCodeResponse.error.value.message ?? "未知错误" }}
          </p>

          <template v-else>
            <div class="qr_wrapper">
              <NQrCode :value="getQrCodeResponse.data.data.imgurl" :size="200" />

              <div class="qr_refresh" @click="getQrCode(key)">
                <NIcon size="25">
                  <Refresh />
                </NIcon>
                <span>点击刷新</span>
              </div>
            </div>

            <NTag type="primary" round>
              请使用百度网盘App扫码登录
            </NTag>

            <NTag type="info" round>
              二维码有效期剩余：{{ formatTime(qrCodeExpireTimeElapsed) }}
            </NTag>

            <NFlex>
              <NButton
                type="primary"
                :loading="loginByQrCodeLoading"
                :render-icon="renderIcon(LogIn)"
                @click="loginByQrCode(key)"
              >
                登录
              </NButton>

              <NButton
                v-if="isMobile"
                type="primary"
                :render-icon="renderIcon(PhonePortrait)"
                @click="wakeUpMobileAppLogin"
              >
                唤醒网盘APP登录
              </NButton>
            </NFlex>
          </template>
        </NFlex>
      </NTabPane>
      <NTabPane name="smsLogin" tab="短信登录">
        暂未开放
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

  .qr_wrapper{
    position: relative;
    width: 224px;
    height: 224px;

    .qr_refresh {
      position: absolute;
      top: 0;
      left: 0;
      width: 224px;
      height: 224px;
      opacity: 0;
      transition: all 0.3s;
      background: rgba(0, 0, 0, 0.7);

      display: flex;
      flex-direction:column;
      justify-content: center;
      align-items: center;
      gap: 10px;
      font-size: 17px;
    }

    .qr_refresh:hover {
      opacity: 1;
      cursor: pointer;
    }
  }
}
</style>
