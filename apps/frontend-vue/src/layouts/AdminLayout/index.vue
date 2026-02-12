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
              @click="toggleCollapsedMobileDrawer"
              :render-icon="renderIcon(Menu, 24)"
            />

            <Logo :show-text="true" />
          </div>
        </template>

        <template v-else>
          <div class="pcHeader">
            <NButton quaternary @click="toggleShowMenu" :render-icon="renderIcon(Menu, 24)" />

            <NBreadcrumb>
              <NBreadcrumbItem v-for="item in breadcrumbs" :key="item.path" :clickable="false">
                <NButton
                  quaternary
                  :disabled="item.route.children?.length !== 0 && !item.route.redirect"
                  @click="handleClickCrumb(item)"
                >
                  <NSpace :size="8" align="center">
                    <component :is="item.icon"></component>
                    <span>{{ item.title }}</span>
                  </NSpace>
                </NButton>
              </NBreadcrumbItem>
            </NBreadcrumb>
          </div>
        </template>

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

<script lang="ts" setup>
import {
  NLayout,
  NLayoutHeader,
  NLayoutContent,
  NLayoutFooter,
  NBreadcrumb,
  NBreadcrumbItem,
  NButton,
  NSpace,
  NPopconfirm,
  NDrawer,
  NDrawerContent,
} from 'naive-ui'
import { LogoutOutlined, FullscreenOutlined, FullscreenExitOutlined } from '@vicons/antd'
import { useUserStore } from '@frontend/stores/userStore.ts'
import { ThemeSwitcher } from '@frontend/components/ThemeSwitcher/index.ts'
import { useFullscreen } from '@vueuse/core'
import { storeToRefs } from 'pinia'
import { useLayoutStore, type Breadcrumb } from '@frontend/stores/layoutStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import LayoutSider from '@frontend/layouts/AdminLayout/components/LayoutSider.vue'
import Logo from '@frontend/layouts/AdminLayout/components/Logo.vue'
import Tabs from '@frontend/layouts/AdminLayout/components/tabs.vue'
import { Menu } from '@vicons/ionicons5'
import { useRouter } from 'vue-router'

const userStore = useUserStore()
const layoutStore = useLayoutStore()
const { isFullscreen, toggle } = useFullscreen()

const { signOut } = userStore
const { signOutLoading } = storeToRefs(userStore)

const { toggleCollapsedMobileDrawer, toggleShowMenu } = layoutStore
const { breadcrumbs, isMobile, collapsedMobileDrawer, showMenu } = storeToRefs(layoutStore)

const router = useRouter()
router.beforeEach(() => {
  // 每次路由切换时，关闭移动端抽屉
  collapsedMobileDrawer.value = false
})

const handleClickCrumb = (item: Breadcrumb) => {
  router.push(item.path)
}
</script>

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
      }

      .mobileHeader {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
    }

    .subHeader {
      width: 100%;
      height: 40px;
      display: flex;
      align-items: center;
      padding: 0 24px;
      padding-left: 5px;
    }

    .content {
      height: calc(100vh - 64px - 40px - 48px); // 减去头部、二级导航栏和底部的高度

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
