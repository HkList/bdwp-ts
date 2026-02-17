<template>
  <ProCard :title="props.title">
    <ProFormPlus :form="searchForm" :rules="props.rules as FormRules">
      <div class="searchFormWarpper" ref="searchFormWarpperDiv">
        <div v-for="column in columns" :key="column.key" class="searchFormItem">
          <component v-if="column.render" :is="column.render(data[column.key])" />

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
            :options="column.selectOptions"
          />

          <ProDate v-else-if="column.type === 'date'" :title="column.title" :path="column.key" />
        </div>
      </div>

      <div class="buttons">
        <ProButton
          type="default"
          attr-type="reset"
          v-if="!props.hideResetButton"
          v-bind="props.resetButtonProps"
          :render-icon="renderIcon(Reset)"
        >
          重置
        </ProButton>

        <ProButton
          type="primary"
          attr-type="submit"
          v-if="!props.hideSearchButton"
          v-bind="props.searchButtonProps"
          :render-icon="renderIcon(Search)"
        >
          查询
        </ProButton>
      </div>
    </ProFormPlus>
  </ProCard>
</template>

<script lang="ts" setup generic="T extends Record<string, any>">
import type { ProSearchFormPlusProps } from '@frontend/components/ProSearchFormPlus'
import { ref } from 'vue'
import { ProFormPlus } from '@frontend/components/ProFormPlus'
import {
  createProForm,
  ProDate,
  ProDigit,
  ProInput,
  ProSelect,
  ProButton,
  ProCard,
} from 'pro-naive-ui'
import type { FormRules } from 'naive-ui'
import { renderIcon } from '@frontend/utils/renderIcon.ts'
import { Reset, Search } from '@vicons/carbon'

const data = defineModel<T>('value', { required: true })
const props = withDefaults(defineProps<ProSearchFormPlusProps<T>>(), {
  title: '搜索',
})
const emit = defineEmits<{
  search: []
  reset: []
}>()

// 保存初始值
const initialValues = ref<T>({ ...data.value })
const searchForm = createProForm({
  initialValues: data.value,
  onSubmit() {
    emit('search')
  },
  onReset() {
    for (const key in data.value) {
      data.value[key] = initialValues.value[key]
    }

    emit('reset')
  },
})
</script>

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
