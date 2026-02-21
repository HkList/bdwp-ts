<script lang="ts" setup>
import Logo from '@frontend/layouts/AdminLayout/components/Logo.vue'
import { useLayoutStore } from '@frontend/stores/layoutStore.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { ChevronBack, ChevronForward } from '@vicons/ionicons5'
import { NButton, NLayoutSider, NMenu } from 'naive-ui'
import { storeToRefs } from 'pinia'
import { computed } from 'vue'

const props = defineProps<{
  isMobileDrawer?: boolean
}>()

const layoutStore = useLayoutStore()

const { handleMenuSelect, toggleCollapsed } = layoutStore
const { activeKey, collapsed, menuOptions } = storeToRefs(layoutStore)

const collapsedWarped = computed(() => {
  if (props.isMobileDrawer) {
    return false
  }
  return collapsed.value
})
</script>

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

    <div v-if="!props.isMobileDrawer" class="footer">
      <NButton
        quaternary
        :render-icon="renderIcon(collapsed ? ChevronForward : ChevronBack)"
        @click="toggleCollapsed"
      />
    </div>
  </NLayoutSider>
</template>

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
