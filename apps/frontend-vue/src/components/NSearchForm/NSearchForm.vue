<template>
  <NFormPlus
    :model="data"
    :rules="computedRules"
    @submit.prevent="(event) => emit('submit', event)"
  >
    <div class="searchFormWarpper" ref="searchFormWarpperDiv">
      <div v-for="column in columns" :key="column.key" class="searchFormItem">
        <NFormItem :label="column.title" :path="column.key.toString()">
          <component v-if="column.render" :is="column.render(data[column.key])" />

          <NInput
            v-else-if="column.type === 'text' || !column.type"
            v-model:value="data[column.key]"
            :placeholder="column.placeholder"
          />

          <NInputNumber
            v-else-if="column.type === 'number'"
            v-model:value="data[column.key]"
            :placeholder="column.placeholder"
          />

          <NSelect
            v-else-if="column.type === 'select'"
            v-model:value="data[column.key]"
            :options="column.selectOptions"
            :placeholder="column.placeholder"
          />

          <NDatePicker
            v-else-if="column.type === 'date'"
            v-model:value="data[column.key]"
            :placeholder="column.placeholder"
          />
        </NFormItem>
      </div>
    </div>

    <div class="buttons">
      <NButton type="default" v-if="!props.hideReset" @click="handleReset">重置</NButton>
      <NButton type="primary" attr-type="submit" v-if="!props.hideSubmit">查询</NButton>

      <!-- 收起 -->
      <NButton
        quaternary
        v-if="!props.disableCollapse"
        @click="toggleCollapse"
        :render-icon="renderIcon(isCollapsed ? ChevronDown : ChevronUp)"
      >
        {{ isCollapsed ? '展开' : '收起' }}
      </NButton>
    </div>
  </NFormPlus>
</template>

<script lang="ts" setup>
import type { NSearchFormProps } from '@frontend/components/NSearchForm/index.ts'
import { NFormPlus } from '@frontend/components/NFormPlus/index.ts'
import { computed, onMounted, onUnmounted, ref, useTemplateRef } from 'vue'
import type { FormRules } from 'naive-ui'
import { NFormItem, NInput, NInputNumber, NSelect, NDatePicker, NButton } from 'naive-ui'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { ChevronDown, ChevronUp } from '@vicons/ionicons5'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type T = Record<string, any>
const data = defineModel<T>('value', { required: true })
const props = defineProps<NSearchFormProps<T>>()
const emit = defineEmits<{
  submit: [e: Event]
  reset: []
}>()

// 保存初始值
const initialValues = ref<T>({ ...data.value })
// 重置表单
const handleReset = () => {
  console.log('reset form')
  Object.keys(initialValues.value).forEach((key) => {
    data.value[key] = initialValues.value[key]
  })
  emit('reset')
}

const computedRules = computed<FormRules>(() => {
  const rules: FormRules = {}
  props.columns.forEach((column) => {
    if (column.required || !('required' in column)) {
      rules[column.key.toString()] = [{ required: true, message: `${column.title}为必填项` }]
    }
  })
  return rules
})

const searchFormWarpperDiv = useTemplateRef('searchFormWarpperDiv')
const isCollapsed = ref(false)
const toggleCollapse = () => {
  if (searchFormWarpperDiv.value) {
    searchFormWarpperDiv.value!.style.setProperty(
      'max-height',
      isCollapsed.value ? `${searchFormWarpperDiv.value!.scrollHeight}px` : `58px`,
    )
  }

  isCollapsed.value = !isCollapsed.value

  if (searchFormWarpperDiv.value) {
    searchFormWarpperDiv.value!.style.setProperty(
      'max-height',
      isCollapsed.value ? '58px' : `${searchFormWarpperDiv.value!.scrollHeight}px`,
    )
  }
}

const makeSureSearchFormMaxHeight = () => {
  if (searchFormWarpperDiv.value) {
    searchFormWarpperDiv.value!.style.setProperty(
      'max-height',
      isCollapsed.value ? '58px' : `${searchFormWarpperDiv.value!.scrollHeight}px`,
    )
  }
}

onMounted(() => {
  makeSureSearchFormMaxHeight()

  window.addEventListener('resize', makeSureSearchFormMaxHeight)
})

onUnmounted(() => {
  window.removeEventListener('resize', makeSureSearchFormMaxHeight)
})
</script>

<style lang="scss" scoped>
.searchFormWarpper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  transition: max-height 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  max-height: 9999px;
  overflow: hidden;

  .searchFormItem {
    // 默认 1 列
    width: 100%;

    // 中等屏幕：2 列
    @media (min-width: 768px) {
      width: calc((100% - 12px) / 2);
    }

    // 大屏幕：3 列
    @media (min-width: 1024px) {
      width: calc((100% - 12px * 2) / 3);
    }
  }
}

.buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
}
</style>
