<script setup lang="ts">
import {
  activeTab,
  closeTab,
  switchTab,
  tabs,
  tabsOrder,
  updateTabsOrder,
} from '@frontend/hooks/useRouteTabs.ts'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Close } from '@vicons/ionicons5'
import { NCard, NScrollbar } from 'naive-ui'
import { nextTick, ref, useTemplateRef, watch } from 'vue'
import { useRouter } from 'vue-router'
import Draggable from 'vuedraggable'

const router = useRouter()
const closeAble = ref(true)
const closingPath = ref<string[]>([])
const isClosingCount = ref(0)
watch(tabsOrder.value, newValue => (closeAble.value = newValue.length > 1), { immediate: true })
// 兜底
setTimeout(() => {
  closeAble.value = tabsOrder.value.length > 1
}, 1000)

const dropedPath = ref<string[]>([])
function onDragEnd(event: { item: HTMLElement }) {
  const element = event.item
  const path = element.getAttribute('path') ?? ''

  dropedPath.value.push(path)

  // 拖拽结束后，更新 tabsOrder 的顺序
  updateTabsOrder(tabsOrder.value)
}

async function handleCardClick(path: string) {
  if (path === activeTab.value) {
    return
  }

  if (closingPath.value.includes(path)) {
    return
  }

  await router.push(path)
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

function warpedCloseTab(event: MouseEvent, path: string, fromTab = false) {
  // 判断是否还有剩余标签
  if (!closeAble.value) {
    return
  }

  let tabElement: HTMLElement | null | undefined

  if (fromTab) {
    tabElement = event.currentTarget as HTMLElement
  }
  else {
    const target = event.currentTarget as HTMLElement
    if (!target) {
      return
    }

    tabElement = target.parentElement?.parentElement?.parentElement
  }

  if (!tabElement) {
    return
  }

  if (tabsOrder.value.length - isClosingCount.value <= 1) {
    return
  }

  closingPath.value.push(path)
  isClosingCount.value += 1

  tabElement.style.maxWidth = '0px'
  tabElement.style.opacity = '0'
  tabElement.style.borderWidth = '0px'
  tabElement.style.marginLeft = '0px'

  // 如果关闭的标签是当前激活的标签，提前切换到下一个标签, 避免需要等待动画结束, 才能看到切换效果
  if (path === activeTab.value) {
    // 提前跳转
    switchTab(path, true)
  }

  if (tabsOrder.value.length - 1 <= 1) {
    closeAble.value = false
  }

  setTimeout(() => {
    closeTab(path)

    // 清理拖拽动画关闭的标签时，可能存在的残留路径
    const pathIndex = dropedPath.value.indexOf(path)
    if (pathIndex !== -1) {
      dropedPath.value.splice(pathIndex, 1)
    }

    const closingPathIndex = closingPath.value.indexOf(path)
    if (closingPathIndex !== -1) {
      closingPath.value.splice(closingPathIndex, 1)
    }

    isClosingCount.value -= 1
  }, 600)
}

// 监听路由变化，自动滚动到 activeTab
watch(
  activeTab,
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
      @end="onDragEnd"
    >
      <template #item="{ element: path }">
        <NCard
          class="tab"
          :class="{
            active: path === activeTab,
            fadeIn: !dropedPath.includes(path),
          }"
          :path="path"
          @click="handleCardClick(path)"
          @auxclick.middle="(event: MouseEvent) => warpedCloseTab(event, path, true)"
        >
          <template v-if="tabs[path]">
            <component :is="tabs[path].icon" class="icon" />
            <span>{{ tabs[path].title }}</span>
            <div
              class="icon"
              :class="{
                invisable: !closeAble,
              }"
            >
              <component
                :is="renderIcon(Close)"
                @click.stop="(event: MouseEvent) => warpedCloseTab(event, path)"
              />
            </div>
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

  @keyframes tabIn {
    from {
      max-width: 0px;
      opacity: 0;
      margin-left: 0px;
    }

    to {
      max-width: 200px;
      opacity: 1;
      margin-left: 10px;
    }
  }

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

    :deep(.n-card__content) {
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

    &.fadeIn {
      animation: tabIn 0.8s;
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
  }

  .ghost {
    opacity: 0.5;
    background-color: var(--hk-background-hover-color);
    animation: none !important;
  }
}
</style>
