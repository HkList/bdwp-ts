<script lang="ts" setup>
import { useDownloadTicketStore } from '@frontend/stores/User/downloadTicketStore.ts'
import { useLoginStore } from '@frontend/stores/User/loginStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import Login from '@frontend/views/User/Key/Login/Index.vue'
import Transfer from '@frontend/views/User/Key/Transfer.vue'
import { LogIn } from '@vicons/ionicons5'
import { NButton, NDivider, NFlex, NInput, NResult, NSpin } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { onMounted, ref } from 'vue'

const loginStore = useLoginStore()
const downloadTicketStore = useDownloadTicketStore()

const { getKeyInfo } = downloadTicketStore

const { isLogin } = storeToRefs(loginStore)
const { key, getKeyInfoLoading, keyInfo } = storeToRefs(downloadTicketStore)

const tempKey = ref(key.value)
function jumpToTempKey() {
  location.href = `/key/${tempKey.value}`
}

onMounted(async () => {
  await getKeyInfo({
    query: {
      key: key.value,
    },
  })
})
</script>

<template>
  <template v-if="getKeyInfoLoading || !keyInfo">
    <NResult title="卡密信息获取中..." class="result">
      <template #icon>
        <NSpin :size="60" />
      </template>
    </NResult>
  </template>

  <template v-else-if="keyInfo.error">
    <NResult status="403" :title="keyInfo.error.value.message ?? '未知错误'" class="result">
      <NFlex vertical>
        <NInput v-model:value="tempKey" label="卡密" />
        <NButton type="primary" :render-icon="renderIcon(LogIn)" @click="jumpToTempKey">
          提交
        </NButton>
      </NFlex>
    </NResult>
  </template>

  <template v-else>
    <NDivider title-placement="left">
      卡密信息
    </NDivider>
    <div class="key_info">
      <p>卡密信息: {{ key }}</p>
      <p>
        到期时间:
        {{
          keyInfo.data.data.total_hours === 0
            ? "永久有效"
            : keyInfo.data.data.expired_at ?? "暂未使用"
        }}
      </p>
      <p>
        可用次数:
        {{
          keyInfo.data.data.total_count === 0
            ? "无限制"
            : `${keyInfo.data.data.used_count}/${keyInfo.data.data.total_count}`
        }}
      </p>
      <p>
        绑定用户:
        {{
          keyInfo.data.data.user_data
            ? `${keyInfo.data.data.user_data.netdisk_name} (${keyInfo.data.data.user_data.uk})`
            : "未绑定"
        }}
      </p>
    </div>

    <NDivider />

    <Login v-if="!isLogin" />
    <Transfer v-else />
  </template>
</template>

<style lang="scss" scoped>
.key_info{
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;

  p{
    margin: 0;
  }
}

.result {
  min-height: 70dvh;
  max-height: 90dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
}
</style>

<style lang="scss">
.cardLayout > .n-card-content {
  justify-content: flex-start !important;
}
</style>
