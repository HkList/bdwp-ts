<script setup lang="ts">
import {
  activeTab,
  closeTab,
  switchTab,
  tabs,
  tabsOrder,
} from '@frontend/hooks/useRouteTabs.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Close } from '@vicons/ionicons5'
import { NCard, NScrollbar } from 'naive-ui'
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import Draggable from 'vuedraggable'

const router = useRouter()

const closingPath = ref<string[]>([])

async function handleCardClick(path: string) {
  if (path === activeTab.value) {
    return
  }

  if (closingPath.value.includes(path)) {
    return
  }

  await router.push(path)
}

function warpedCloseTab(path: string) {
  if (
    // 如果只有一个标签，不允许关闭
    tabsOrder.value.length === 1
    // 如果正在关闭的标签已经在关闭队列中
    || closingPath.value.includes(path)
    // 如果正在关闭的标签数量大于总标签数量, 那么说明已经没有标签可以关闭了
    || tabsOrder.value.length <= closingPath.value.length + 1

  ) {
    return
  }

  closingPath.value.push(path)

  const closingIndex = tabsOrder.value.indexOf(path)
  if (closingIndex === -1) {
    return
  }

  // 如果关闭的标签是当前激活的标签，提前切换到下一个标签, 避免需要等待动画结束, 才能看到切换效果
  if (path === activeTab.value) {
    // 提前跳转
    switchTab(tabsOrder.value[closingIndex + 1] ? closingIndex + 1 : closingIndex - 1)
  }

  setTimeout(() => {
    closeTab(path)

    const closingPathIndex = closingPath.value.indexOf(path)
    if (closingPathIndex !== -1) {
      closingPath.value.splice(closingPathIndex, 1)
    }
  }, 600)
}

const scrollbar = useTemplateRef('scrollbar')

function handleMousewheel(event: WheelEvent) {
  if (!scrollbar.value) {
    return
  }

  scrollbar.value.scrollBy({
    behavior: 'auto',
    left: Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY,
  })
}

watch(
  () => activeTab.value,
  async () => {
    await nextTick()

    if (!scrollbar.value) {
      return
    }

    const activeTabElement = document.querySelector('.tab.active') as HTMLElement
    if (!activeTabElement) {
      return
    }

    const { offsetLeft, offsetWidth } = activeTabElement
    let left = offsetLeft - offsetWidth

    if (left <= 10) {
      left = 0
    }

    scrollbar.value.scrollTo({ behavior: 'smooth', left })
  },
  { immediate: true },
)
</script>

<template>
  <NScrollbar ref="scrollbar" x-scrollable class="scrollbar" @mousewheel.stop="handleMousewheel">
    <Draggable
      v-model="tabsOrder"
      class="tabs"
      :item-key="(item: string) => item"
      animation="200"
      ghost-class="ghost"
    >
      <template #item="{ element }">
        <NCard
          class="tab"
          :class="{
            active: element === activeTab,
            closing: closingPath.includes(element),
          }"
          :path="element"
          @click="handleCardClick(element)"
          @auxclick.middle="warpedCloseTab(element)"
        >
          <template v-if="tabs[element]">
            <component :is="tabs[element].icon" class="icon" />
            <span>{{ tabs[element].title }}</span>
            <component
              :is="renderIcon(Close)"
              class="icon"
              :class="{
                invisable: tabsOrder.length <= 1,
              }"
              @click.stop="warpedCloseTab(element)"
            />
          </template>
        </NCard>
      </template>
    </Draggable>
  </NScrollbar>
</template>

<style lang="scss">
.scrollbar {
  .n-scrollbar-content {
    height: 100%;
  }

  .n-scrollbar-rail {
    display: none;
  }
}
</style>

<style scoped lang="scss">
.tabs {
  --hk-border-color: rgb(224, 224, 230);
  --hk-border-hover-color: rgb(224, 224, 230);
  --hk-border-active-color: rgb(22, 119, 255);

  --hk-background-color: transparent;
  --hk-background-hover-color: rgb(243, 243, 245);
  --hk-background-active-color: rgb(230, 244, 255);
}

.dark .tabs {
  --hk-border-color: rgba(255, 255, 255, 0.24);
  --hk-border-hover-color: rgba(255, 255, 255, 0.24);
  --hk-border-active-color: rgb(22, 104, 220);

  --hk-background-color: transparent;
  --hk-background-hover-color: rgba(255, 255, 255, 0.09);
  --hk-background-active-color: rgb(17 26 44);
}
</style>

<style scoped lang="scss">
.tabs {
  display: flex;
  align-items: center;

  height: 100%;
  white-space: nowrap;

  .tab {
    display: flex;
    align-items: flex-start;

    width: fit-content;
    max-width: 200px;
    overflow: hidden;
    margin-left: 10px;

    height: 36px;
    border-radius: 6px;
    border-color: var(--hk-border-color);
    transition:
      max-width 0.5s cubic-bezier(0.4, 0, 0.2, 1),
      opacity 0.5s,
      margin-left 0.5s,
      color 0.3s,
      box-shadow 0.3s,
      background-color 0.3s;

    > :deep(.n-card-content) {
      padding: 0 10px;
      display: flex;
      align-items: center;
      justify-content: space-around;
      gap: 5px;
      width: fit-content;
    }

    &:hover {
      cursor: pointer;
      background-color: var(--hk-background-hover-color);
      border-color: var(--hk-border-hover-color);
    }

    .icon {
      font-size: 17px;
      height: 17px;
      width: 17px;
      display: flex;

      transition: all 0.3s;

      &.invisable {
        font-size: 0px;
        width: 0;
        height: 0;
      }
    }

    &.active {
      background-color: var(--hk-background-active-color);
      border-color: var(--hk-border-active-color);
      color: var(--hk-border-active-color);
    }

    &.closing {
      max-width: 0px;
      opacity: 0;
      border-width: 0px;
      margin-left: 0px;
    }
  }

  .ghost {
    opacity: 0.5;
    background-color: var(--hk-background-hover-color);
    animation: none !important;
  }
}
</style>
