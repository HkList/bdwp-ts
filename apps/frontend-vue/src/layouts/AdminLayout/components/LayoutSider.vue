<template>
  <NLayoutSider
    bordered
    collapse-mode="width"
    :collapsed-width="64"
    width="100%"
    :collapsed="collapsedWarped"
    class="layoutSider"
  >
    <Logo :show-text="!collapsedWarped" show-border />

    <NMenu
      :collapsed="collapsedWarped"
      :collapsed-width="64"
      :collapsed-icon-size="22"
      :options="menuOptions"
      :value="activeKey"
      @update:value="handleMenuSelect"
    />

    <div class="footer" v-if="!props.isMobileDrawer">
      <NButton
        quaternary
        @click="toggleCollapsed"
        :render-icon="renderIcon(collapsed ? MenuUnfoldOutlined : MenuFoldOutlined)"
      />
    </div>
  </NLayoutSider>
</template>

<script lang="ts" setup>
import { NLayoutSider, NMenu, NButton } from 'naive-ui'
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@vicons/antd'
import { storeToRefs } from 'pinia'
import { useLayoutStore } from '@frontend/stores/layoutStore'
import { renderIcon } from '@frontend/utils/renderIcon'
import { computed } from 'vue'
import Logo from '@frontend/layouts/AdminLayout/components/Logo.vue'

const layoutStore = useLayoutStore()

const { handleMenuSelect, toggleCollapsed } = layoutStore
const { collapsed, activeKey, menuOptions } = storeToRefs(layoutStore)

const collapsedWarped = computed(() => {
  if (props.isMobileDrawer) {
    return false
  }
  return collapsed.value
})

const props = defineProps<{
  isMobileDrawer?: boolean
}>()
</script>

<style lang="scss" scoped>
.layoutSider {
  position: relative;
  height: 100%;
  transition: all 0.3s;

  .footer {
    display: flex;
    justify-content: flex-end;
    align-items: center;

    position: absolute;
    bottom: 0;
    width: calc(100% - 10px);
    height: 48px;
    padding-right: 10px;
    border-top: 1px solid var(--n-border-color);
  }
}
</style>
