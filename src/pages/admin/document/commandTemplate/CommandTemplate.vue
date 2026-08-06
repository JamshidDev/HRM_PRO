<script setup>
  import { useCommandTempStore } from '@/store/modules/index.js'
  import { UITreeData } from '@/components/index.js'
  import Table from './ui/Table.vue'
  import { useAccountStore } from '@/store/modules/index.js'
  const accStore = useAccountStore()
  const store = useCommandTempStore()

  const onSelect = (v) => {
    store.payload.organizations = v
    store._index()
  }

  const onClearEv = () => {
    store.payload.organizations = []
    store._index()
  }

  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.documentExamplesRead)) return
    store._index()
  })
</script>

<template>
  <div class="h-full grid grid-cols-12 gap-4">
    <div class="col-span-12 md:col-span-6 flex flex-col gap-4 overflow-auto">
      <div class="bg-surface-ground rounded-sm flex justify-between border-dashed border-gray-300">
        <span class="text-sm">{{ $t('documentSetting.form.organization') }}</span>
        <span class="text-primary font-medium">
          <template v-if="store.payload.organizations.length">
            <n-button @click="onClearEv" size="tiny" type="error" secondary>
              {{ $t('content.clear') }}
            </n-button>
          </template>

          {{ $t('documentSetting.form.count', { n: store.payload.organizations.length }) }}
        </span>
      </div>

      <UITreeData
        class="bg-gray-50 rounded-sm flex-1 overflow-auto"
        :model-v="store.payload.organizations"
        :checked-val="store.checkedVal"
        @updateModel="onSelect"
        @updateCheck="(v) => (store.checkedVal = v)"
      />
    </div>

    <div class="col-span-12 md:col-span-6 flex flex-col overflow-auto">
      <Table />
    </div>
  </div>
</template>
