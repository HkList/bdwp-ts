<script lang="ts" setup>
import type { Breadcrumb } from '@frontend/stores/layoutStore.ts'

import { ThemeSwitcher } from '@frontend/components/ThemeSwitcher/index.ts'
import LayoutSider from '@frontend/layouts/AdminLayout/components/LayoutSider.vue'
import Logo from '@frontend/layouts/AdminLayout/components/Logo.vue'
import Tabs from '@frontend/layouts/AdminLayout/components/Tabs.vue'
import { useAuthStore } from '@frontend/stores/authStore.ts'
import { useLayoutStore } from '@frontend/stores/layoutStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Contract, Expand, LogOut, Menu } from '@vicons/ionicons5'
import { useFullscreen } from '@vueuse/core'
import {
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NDrawer,
  NDrawerContent,
  NFlex,
  NLayout,
  NLayoutContent,
  NLayoutFooter,
  NLayoutHeader,
  NPopconfirm,
} from 'naive-ui'
import { storeToRefs } from 'pinia'
import { useRouter } from 'vue-router'

const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const { isFullscreen, toggle } = useFullscreen()

const { signOut } = authStore
const { signOutLoading } = storeToRefs(authStore)

const { toggleCollapsedMobileDrawer, toggleShowMenu } = layoutStore
const { breadcrumbs, collapsedMobileDrawer, isMobile, showMenu } = storeToRefs(layoutStore)

const router = useRouter()
router.beforeEach(() => {
  // 每次路由切换时，关闭移动端抽屉
  collapsedMobileDrawer.value = false
})

async function handleClickCrumb(item: Breadcrumb) {
  await router.push(item.path)
}
</script>

<template>
  <NLayout has-sider class="adminLayout">
    <!-- 侧边栏 -->
    <LayoutSider
      v-if="!isMobile"
      class="pcLayoutSider"
      :class="{
        invisable: !showMenu,
      }"
    />

    <NDrawer v-model:show="collapsedMobileDrawer" placement="left" class="mobileDrawer">
      <NDrawerContent>
        <LayoutSider :is-mobile-drawer="true" />
      </NDrawerContent>
    </NDrawer>

    <NLayout class="mainLayout">
      <!-- 顶部导航栏 -->
      <NLayoutHeader bordered class="header">
        <template v-if="isMobile">
          <div class="mobileHeader">
            <NButton
              quaternary
              :render-icon="renderIcon(Menu, 24)"
              @click="toggleCollapsedMobileDrawer"
            />

            <Logo :show-text="true" />
          </div>
        </template>

        <template v-else>
          <div class="pcHeader">
            <NButton quaternary :render-icon="renderIcon(Menu, 24)" @click="toggleShowMenu" />

            <NBreadcrumb class="breadcrumb">
              <NBreadcrumbItem v-for="item in breadcrumbs" :key="item.path" :clickable="false">
                <NButton
                  quaternary
                  :disabled="item.route.children?.length !== 0 && !item.route.redirect"
                  @click="handleClickCrumb(item)"
                >
                  <NFlex :size="8" align="center" :wrap="false">
                    <component :is="item.icon" />
                    <span>{{ item.title }}</span>
                  </NFlex>
                </NButton>
              </NBreadcrumbItem>
            </NBreadcrumb>
          </div>
        </template>

        <NFlex :size="16" :wrap="false" class="rightButtons">
          <!-- 主题切换 -->
          <ThemeSwitcher />

          <!-- 全屏切换 -->
          <NButton
            quaternary
            circle
            :render-icon="renderIcon(isFullscreen ? Contract : Expand)"
            @click="toggle"
          />

          <!-- 退出登陆 -->
          <NPopconfirm :disabled="signOutLoading" @positive-click="signOut">
            <template #trigger>
              <NButton
                quaternary
                circle
                :render-icon="renderIcon(LogOut)"
                :loading="signOutLoading"
              />
            </template>

            确定要退出登录吗？
          </NPopconfirm>
        </NFlex>
      </NLayoutHeader>

      <!-- 二级导航栏 -->
      <NLayoutHeader bordered class="subHeader">
        <Tabs />
      </NLayoutHeader>

      <!-- 内容区域 -->
      <NLayoutContent :native-scrollbar="false" class="content">
        <div class="content-wrapper">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in">
              <component :is="Component" />
            </Transition>
          </RouterView>
        </div>
      </NLayoutContent>

      <!-- 底部 -->
      <NLayoutFooter bordered class="footer">
        <span>Made With ❤️ By huan_kong.</span>
      </NLayoutFooter>
    </NLayout>
  </NLayout>
</template>

<style lang="scss" scoped>
.adminLayout {
  width: 100vw;
  height: 100vh;

  .pcLayoutSider {
    width: 240px !important;

    &.invisable {
      width: 0 !important;
    }
  }

  .mainLayout {
    .header {
      width: 100%;
      height: 64px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 15px;

      .pcHeader {
        display: flex;
        align-items: center;
        gap: 12px;
        width: 70%;
        overflow: auto;

        .breadcrumb {
          width: calc(100% - 16px);
          overflow: auto;
        }
      }

      .mobileHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
    }

    .rightButtons {
      overflow: auto;
    }

    .subHeader {
      width: 100%;
      height: 42px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      padding-left: 5px;
    }

    .content {
      height: calc(100vh - 64px - 42px - 48px); // 减去头部、二级导航栏和底部的高度

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

<style lang="scss">
.mobileDrawer {
  .n-drawer-body-content-wrapper {
    padding: 0 !important;
  }
}
</style>
