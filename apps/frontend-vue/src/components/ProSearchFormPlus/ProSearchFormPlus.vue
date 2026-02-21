<script lang="ts" setup generic="T extends Record<string, any>">
import type { ProSearchFormPlusProps } from '@frontend/components/ProSearchFormPlus/types.ts'
import type { FormRules } from 'naive-ui'

import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Refresh, Search } from '@vicons/ionicons5'
import {
  createProForm,
  ProButton,
  ProCard,
  ProDate,
  ProDigit,
  ProForm,
  ProInput,
  ProSelect,
} from 'pro-naive-ui'

const props = withDefaults(defineProps<ProSearchFormPlusProps<T>>(), {
  title: '搜索',
})
const emit = defineEmits<{
  reset: []
  search: []
}>()
const data = defineModel<T>('value', { required: true })
const searchForm = createProForm({
  initialValues: data.value,
  onReset() {
    // 使用对象替换而非属性修改，确保响应式更新
    data.value = structuredClone(props.initValues)

    emit('reset')
  },
  onSubmit() {
    emit('search')
  },
})
</script>

<template>
  <ProCard :title="props.title">
    <ProForm :form="searchForm" :rules="props.rules as FormRules">
      <div class="searchFormWarpper">
        <div v-for="column in columns" :key="column.key" class="searchFormItem">
          <component :is="column.render(data[column.key])" v-if="column.render" />

          <ProInput
            v-else-if="column.type === 'string' || !column.type"
            :title="column.title"
            :path="column.key"
          />

          <ProDigit v-else-if="column.type === 'number'" :title="column.title" :path="column.key" />

          <ProSelect
            v-else-if="column.type === 'select'"
            :title="column.title"
            :path="column.key"
            :field-props="{
              options: column.options,
              multiple: column.multiple,
            }"
          />

          <ProDate v-else-if="column.type === 'date'" :title="column.title" :path="column.key" />
        </div>
      </div>

      <div class="buttons">
        <ProButton
          v-if="!props.hideResetButton"
          type="default"
          attr-type="reset"
          v-bind="props.resetButtonProps"
          :render-icon="renderIcon(Refresh)"
        >
          重置
        </ProButton>

        <ProButton
          v-if="!props.hideSearchButton"
          type="primary"
          attr-type="submit"
          v-bind="props.searchButtonProps"
          :render-icon="renderIcon(Search)"
        >
          查询
        </ProButton>
      </div>
    </ProForm>
  </ProCard>
</template>

<style lang="scss" scoped>
.searchFormWarpper {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;

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
