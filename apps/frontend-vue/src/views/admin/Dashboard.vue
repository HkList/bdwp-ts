<template>
  <div class="dashboard">
    <n-h1>仪表盘</n-h1>

    <n-grid :cols="4" :x-gap="16" :y-gap="16" responsive="screen">
      <n-grid-item>
        <n-card :bordered="false" class="stat-card">
          <n-statistic label="总用户数" :value="1234">
            <template #prefix>
              <n-icon :component="UserOutlined" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card :bordered="false" class="stat-card">
          <n-statistic label="今日访问" :value="567">
            <template #prefix>
              <n-icon :component="EyeOutlined" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card :bordered="false" class="stat-card">
          <n-statistic label="任务数" :value="89">
            <template #prefix>
              <n-icon :component="FileTextOutlined" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card :bordered="false" class="stat-card">
          <n-statistic label="消息" :value="12">
            <template #prefix>
              <n-icon :component="BellOutlined" />
            </template>
          </n-statistic>
        </n-card>
      </n-grid-item>
    </n-grid>

    <n-grid :cols="2" :x-gap="16" :y-gap="16" style="margin-top: 16px" responsive="screen">
      <n-grid-item>
        <n-card title="最近活动" :bordered="false">
          <n-list>
            <n-list-item v-for="i in 5" :key="i">
              <n-thing :title="`活动项目 ${i}`" description="这是活动描述信息" />
            </n-list-item>
          </n-list>
        </n-card>
      </n-grid-item>

      <n-grid-item>
        <n-card title="快速操作" :bordered="false">
          <n-space vertical>
            <n-button type="primary" block>
              <template #icon>
                <n-icon :component="PlusOutlined" />
              </template>
              创建新任务
            </n-button>
            <n-button block>
              <template #icon>
                <n-icon :component="FileTextOutlined" />
              </template>
              查看报告
            </n-button>
            <n-button block>
              <template #icon>
                <n-icon :component="SettingOutlined" />
              </template>
              系统设置
            </n-button>
          </n-space>
        </n-card>
      </n-grid-item>
    </n-grid>

    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
    <p>1</p>
  </div>
</template>

<script lang="ts" setup>
import {
  NH1,
  NGrid,
  NGridItem,
  NCard,
  NStatistic,
  NIcon,
  NList,
  NListItem,
  NThing,
  NSpace,
  NButton,
} from 'naive-ui'
import {
  UserOutlined,
  EyeOutlined,
  FileTextOutlined,
  BellOutlined,
  PlusOutlined,
  SettingOutlined,
} from '@vicons/antd'
</script>

<style lang="scss" scoped>
.dashboard {
  .stat-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;

    :deep(.n-statistic) {
      .n-statistic-value__content {
        color: white;
      }
      .n-statistic__label {
        color: rgba(255, 255, 255, 0.9);
      }
    }
  }

  .stat-card:nth-child(2) {
    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  }

  .stat-card:nth-child(3) {
    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  }

  .stat-card:nth-child(4) {
    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
  }
}
</style>
