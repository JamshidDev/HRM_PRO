<script setup>
import { UIDConfirm} from "@components"
import { useReport2Store} from "@stores"

const store = useReport2Store()

const onDelete = () => {
  store.department.deleteVisible = false
  store.department.selectedId = null
  store._deleteDepartment()
}
</script>

<template>
  <UIDConfirm v-model:visible="store.department.deleteVisible" type="warning">
    <div class="text-lg text-center">
      {{$t('content.deleteWarning')}}
    </div>
    <template #action>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-6">
          <n-button secondary @click="store.department.deleteVisible = false" type="error" style="width: 100%"
          >{{ $t('content.no') }}
          </n-button>
        </div>
        <div class="col-span-6">
          <n-button secondary @click="onDelete" type="primary" style="width: 100%">{{
              $t('content.yes')
            }}</n-button>
        </div>
      </div>
    </template>
  </UIDConfirm>
</template>