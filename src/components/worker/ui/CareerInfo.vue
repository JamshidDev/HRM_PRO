<script setup>
import {CheckmarkCircle32Filled} from "@vicons/fluent"
import {useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"
const store = useComponentStore()
</script>

<template>
  <h3 class="text-sm uppercase mb-2 font-semibold mt-12 text-primary">{{$t('oldCareerPage.title')}}</h3>
  <div class="w-full grid grid-cols-12 border p-6 rounded-sm border-surface-line border-dashed">
    <div class="col-span-12">
    </div>
    <template v-if="store.workerPreview?.worker && store.workerPreview?.worker?.old_careers">
      <n-timeline class="w-full col-span-12">
        <template
            v-for="(item, idx) in store.workerPreview?.worker?.old_careers" :key="idx"
        >
          <n-timeline-item
              class="w-full"
              type="info"
              :title="Utils.timeOnlyYear(item?.from_date) + ' - ' + Utils.timeOnlyYear(item?.to_date)"
              line-type="dashed"
          >
            <div class="w-full pb-4">
              {{item.post_name}}
            </div>
            <template #icon>
              <n-icon size="24" class="text-primary">
                <CheckmarkCircle32Filled/>
              </n-icon>
            </template>
          </n-timeline-item>
        </template>

      </n-timeline>
    </template>

  </div>

  <h3 class="text-sm uppercase mb-2 font-semibold mt-12 text-primary">{{$t('oldCareerPage.systemTitle')}}</h3>
  <div class="w-full grid grid-cols-12 border p-6 rounded-sm border-surface-line border-dashed mb-6">
    <div class="col-span-12">
    </div>
    <template v-if="store.workerPreview?.worker && store.workerPreview?.worker?.new_careers">
      <n-timeline class="w-full col-span-12">
        <template
            v-for="(item, idx) in store.workerPreview?.worker?.new_careers" :key="idx"
        >
          <n-timeline-item
              class="w-full"
              type="info"
              :title="Utils.timeOnlyYear(item?.from) + ' - ' + (Utils.timeOnlyYear(item?.to) || '')"
              line-type="dashed"
          >
            <div class="w-full pb-4">
              {{item.full_position}}
            </div>
            <template #icon>
              <n-icon size="24" class="text-primary">
                <CheckmarkCircle32Filled/>
              </n-icon>
            </template>
          </n-timeline-item>
        </template>

      </n-timeline>
    </template>

  </div>
</template>
