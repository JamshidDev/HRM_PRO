<script setup>
import {useTurnstileHikCentralWorkerStore} from "@/store/modules/index.js"
import {UIModal} from "@/components/index.js"

const store = useTurnstileHikCentralWorkerStore()
</script>

<template>
  <UIModal
      :width="600"
      v-model:visible="store.errorVisible"
      :title="$t('content.error')"
  >
    <template #default>
      <n-spin :show="store.errorLoading">
        <div class="w-full h-[400px] overflow-y-auto">
          <template v-for="item in store.errorList" :key="item.id">
            <div class="bg-surface-ground/60 p-2 rounded-lg mt-2">
              <div class="flex justify-between">
                <n-button size="tiny" type="primary" secondary>{{item.name}}</n-button>
                <n-button text size="tiny">{{item.time}}</n-button>
              </div>

              <div class="text-danger block mt-1">
                  {{item.code}}
              </div>
            </div>
          </template>

        </div>
      </n-spin>

    </template>
  </UIModal>
</template>