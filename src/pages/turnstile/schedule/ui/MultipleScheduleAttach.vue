<script setup>
import {useScheduleTableStore} from "@stores"
import {UIModal, UIPagination} from "@components"

const store = useScheduleTableStore()

</script>

<template>
  <UIModal
      :width="600"
      v-model:visible="store.multipleAttachVisible"
      :title="$t('shiftType.form.turnstileSetting')"
  >
    <n-input class="mx-[10px] !w-[calc(100%-20px)] mb-2" :placeholder="$t('content.search')"/>
    <n-checkbox-group v-model:value="store.selectedWorkers">
      <div class="w-full h-[calc(100vh-280px)] overflow-y-auto px-2">
        <template v-for="item in store.workerList">
          <n-checkbox class="w-full !items-center flex px-4 py-2 bg-surface-ground/30 rounded-lg border border-surface-line mb-2" size="large" :value="item.id">
            <div class="font-medium">{{item.fullName}}</div>
            <div class="text-secondary text-xs line-clamp-1">{{item.position}}</div>
          </n-checkbox>
        </template>
      </div>
    </n-checkbox-group>
    <UIPagination
        :short="true"
        :show-size-picker="false"
    />
    <div class="flex justify-end px-4 gap-4 py-4">
      <n-button type="error" secondary>{{$t('content.cancel')}}</n-button>
      <n-button type="primary">{{$t('content.save')}}</n-button>
    </div>
  </UIModal>
</template>
