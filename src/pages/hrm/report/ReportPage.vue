<script setup>
import {UIPageContent, UIModal, UIDConfirm} from "@/components/index.js"
import Filter from "./ui/Filter.vue"
import Table from "./ui/Table.vue"
import CreateForm from "./ui/CreateForm.vue"
import {useReport2Store} from "@/store/modules/index.js"

const store = useReport2Store()
</script>

<template>
  <UIPageContent>
    <Filter/>
    <Table/>
    <UIModal
        :width="900"
        v-model:visible="store.visible"
        :title="$t('departmentPositionPage.updateTitle')"
    >
      <CreateForm/>
    </UIModal>
    <UIDConfirm
        :visible="store.confirmVisible"
        @onClose="()=>store.confirmVisible = false"

        type="warning"
    >
      <h2 class="text-center font-semibold">{{$t('report.form.optimizationConfirm')}}</h2>
      <template #action>
        <div class="w-full grid grid-cols-2 gap-4">
          <n-button :loading="store.optimizationLoading" @click="store.confirmVisible=false" type="error" secondary>{{$t('content.close')}}</n-button>
          <n-button :loading="store.optimizationLoading" @click="store._getOptimization()" type="primary" secondary>{{$t('content.confirm')}}</n-button>
        </div>
      </template>
    </UIDConfirm>
  </UIPageContent>
</template>
