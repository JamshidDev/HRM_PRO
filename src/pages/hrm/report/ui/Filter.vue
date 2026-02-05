<script setup>
  import { SuperStructure } from '@/components/index.js'
  import { useComponentStore, useDepartmentStore, useReport2Store } from '@/store/modules/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { useDebounce } from '@utils'
  const accStore = useAccountStore()

  const componentStore = useComponentStore()
  const store = useReport2Store()
  const dpStore = useDepartmentStore()

  const onChangeOrg = (v) => {
    if (!accStore.checkAction(accStore.pn.hrReportRead)) return
    store.department.list = []
    if (store.department.params.organization_id.length === 0) return
    store._getDepartment()
  }

  const onSearchEv = useDebounce(() => {
    store._fetchStructure()
  }, 600)

  const selectedOrg = computed(() => store.department.params.organization_id?.[0] || null)

  const onDefaultEv = (list) => {
    if (
      list.length === 1 &&
      (list?.[0].children === undefined || list?.[0]?.children?.length === 0)
    ) {
      store.department.params.organization_id = [list[0]]
      store._getDepartment()
    }
  }

  const addDepartment = () => {
    store.department.visible = true
    dpStore.visibleType = true
    dpStore._level()
    componentStore._departments()
    dpStore.resetForm()
  }

  onMounted(() => {
    store._fetchStructure(onDefaultEv)
  })
</script>

<template>
  <div class="w-full grid grid-cols-12 gap-2">
    <div class="col-span-3">
      <label class="text-textColor1 text-sm pl-2">{{ $t('content.organization') }}</label>
      <SuperStructure
        :options="store.structure.list"
        :loading="store.structure.loading"
        :multiple="false"
        v-model:value="store.department.params.organization_id"
        v-model:search="store.structure.params.search"
        v-model:cache="store.structure.cache"
        @update:search="onSearchEv"
        @update:value="onChangeOrg"
      >
        <template #label="{ data }">
          <div class="flex items-center justify-between w-full pl-1 pt-1">
            <div class="leading-[1.1]">{{ data.name }}</div>
            <div class="shrink-0 w-[80px] grid grid-cols-2 gap-1 pr-2">
              <n-button
                :type="data.rate > data.real_rate ? 'success' : 'default'"
                class="!text-[10px]"
                size="tiny"
                secondary
                >{{ data.rate }}</n-button
              >
              <n-button
                :type="data.real_rate > data.rate ? 'error' : 'default'"
                class="!text-[10px]"
                size="tiny"
                secondary
                >{{ data.real_rate }}</n-button
              >
            </div>
          </div>
        </template>
      </SuperStructure>
    </div>
    <div class="col-span-9 flex justify-end mt-5 gap-2">
      <template v-if="selectedOrg">
        <n-button
          secondary
          :type="selectedOrg.rate > selectedOrg.real_rate ? 'success' : 'default'"
        >
          {{ store.department.params.organization_id?.[0].rate }}
        </n-button>
        <n-button secondary :type="selectedOrg.real_rate > selectedOrg.rate ? 'error' : 'default'">
          {{ store.department.params.organization_id?.[0].real_rate }}
        </n-button>
        <n-button @click="addDepartment" type="primary">
          {{ $t('report.addDepartment') }}
        </n-button>
      </template>
    </div>
  </div>
</template>
