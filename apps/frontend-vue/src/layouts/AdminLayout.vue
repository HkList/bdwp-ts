<template>
  <NLayout has-sider class="adminLayout">
    <!-- 侧边栏 -->
    <NLayoutSider
      bordered
      collapse-mode="width"
      :collapsed-width="64"
      :width="240"
      :collapsed="collapsed"
      class="layoutSider"
    >
      <div class="logo">
        <img src="/favicon.ico" alt="Logo" class="logo-img" />
        <span v-if="!collapsed" class="logo-text">BDWP-ts</span>
      </div>

      <n-menu
        :collapsed="collapsed"
        :collapsed-width="64"
        :collapsed-icon-size="22"
        :options="menuOptions"
        :value="activeKey"
        @update:value="handleMenuSelect"
      />

      <div class="footer">
        <NButton
          quaternary
          @click="toggleCollapsed"
          :render-icon="renderIcon(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)"
        />
      </div>
    </NLayoutSider>

    <NLayout class="mainLayout">
      <!-- 顶部导航栏 -->
      <NLayoutHeader bordered class="header">
        <NBreadcrumb>
          <NBreadcrumbItem v-for="item in breadcrumbs" :key="item.path">
            <RouterLink :to="item.path">
              <component :is="item.icon"></component>
              {{ item.title }}
            </RouterLink>
          </NBreadcrumbItem>
        </NBreadcrumb>

        <NSpace :size="16">
          <!-- 主题切换 -->
          <ThemeSwitcher />

          <!-- 全屏切换 -->
          <NButton
            quaternary
            circle
            @click="toggle"
            :render-icon="renderIcon(isFullscreen ? FullscreenExitOutlined : FullscreenOutlined)"
          />

          <!-- 退出登陆 -->
          <NPopconfirm @positive-click="signOut" :disabled="signOutLoading">
            <template #trigger>
              <NButton
                quaternary
                circle
                :render-icon="renderIcon(LogoutOutlined)"
                :loading="signOutLoading"
              />
            </template>

            确定要退出登录吗？
          </NPopconfirm>
        </NSpace>
      </NLayoutHeader>

      <!-- 内容区域 -->
      <n-layout-content :native-scrollbar="false" class="content">
        <div class="content-wrapper">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </n-layout-content>

      <!-- 底部 -->
      <n-layout-footer bordered class="footer">
        <span>Made With ❤️ By huan_kong.</span>
      </n-layout-footer>
    </NLayout>
  </NLayout>
</template>

<script lang="ts" setup>
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NMenu,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NSpace,
  NPopconfirm,
} from 'naive-ui'
import {
  LogoutOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@vicons/antd'
import { useUserStore } from '@frontend/stores/userStore.ts'
import { ThemeSwitcher } from '@frontend/components/ThemeSwitcher/index.ts'
import { useFullscreen } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@frontend/stores/layoutStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'

const userStore = useUserStore()
const layoutStore = useLayoutStore()
const { isFullscreen, toggle } = useFullscreen()

const { signOut } = userStore
const { signOutLoading } = storeToRefs(userStore)

const { handleMenuSelect, toggleCollapsed } = layoutStore
const { collapsed, activeKey, breadcrumbs, menuOptions } = storeToRefs(layoutStore)
</script>

<style lang="scss" scoped>
.adminLayout {
  width: 100vw;
  height: 100vh;

  .layoutSider {
    position: relative;

    .logo {
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-bottom: 1px solid var(--n-border-color);
      gap: 12px;

      .logo-img {
        height: 32px;
        width: 32px;
      }

      .logo-text {
        min-width: 82px;
        font-size: 18px;
        font-weight: 600;
      }
    }

    .footer {
      display: flex;
      justify-content: flex-end;
      position: absolute;
      bottom: 0;
      width: calc(100% - 10px);
      padding-right: 10px;
      border-top: 1px solid var(--n-border-color);
    }
  }

  .mainLayout {
    .header {
      width: 100%;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 24px;
    }

    .content {
      height: calc(100vh - 64px - 48px);

      .content-wrapper {
        padding: 24px;
      }
    }

    .footer {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }
}

/* 页面切换动画 */
.fade-enter-active,
.fade-leave-active {
  transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateX(150px);
}
</style>
