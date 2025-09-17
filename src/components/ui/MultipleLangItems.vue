<script setup>
const activeTab = ref(1)
import i18n from "@/i18n/index.js"
const t = i18n.global.t
const options = [
  {
    id:1,
    name:t('content.uz'),
  },
  {
    id:2,
    name:t('content.ru'),
  },
  {
    id:3,
    name:t('content.en'),
  },
]

</script>

<template>
  <div class="flex gap-1 w-full rounded-lg border-surface-line">
    <div class="w-[calc(100%-70px)]">
      <n-tabs v-model:value="activeTab" type="segment" animated class="hidden-tab-header">
        <n-tab-pane class="pt-0!" :name="options[0].id">
          <slot name="uz-content">
            uz content
          </slot>
        </n-tab-pane>
        <n-tab-pane class="pt-0!" :name="options[1].id">
          <slot name="ru-content">
            ru content
          </slot>
        </n-tab-pane>
        <n-tab-pane class="pt-0!" :name="options[2].id">
          <slot name="en-content">
            en content
          </slot>
        </n-tab-pane>
      </n-tabs>
    </div>
    <n-select
        status="success"
        class="w-[70px]!"
        v-model:value="activeTab"
        value-field="id" label-field="name"
        :options="options" />
  </div>
</template>
