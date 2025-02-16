<script setup>
import {ArrowCircleDown16Regular, StarEmphasis32Filled, EyeOff20Filled} from "@vicons/fluent"
import {useWorkerProfileStore} from "@/store/modules/index.js"
const store = useWorkerProfileStore()
</script>

<template>
  <div class="grid col-span-12 w-full">
    <div class="col-span-12 border-b border-surface-line flex gap-4 justify-between pb-2 pt-10 mb-6 ">

      <n-button text type="warning" icon-placement="right">
        <template #icon>
          <StarEmphasis32Filled/>
        </template>
        4.67</n-button>
      <div class="flex items-center gap-2">
        <n-button type="primary" secondary icon-placement="right">
          <template #icon>
            <EyeOff20Filled/>
          </template>
        </n-button>
        <n-button type="primary" icon-placement="right">
          <template #icon>
            <ArrowCircleDown16Regular/>
          </template>
          Ma'lumotnoma yuklash
        </n-button>
      </div>
    </div>
    <template v-if="store.workerPreview">
      <div class="col-span-12 text-2xl text-primary font-semibold mb-2 uppercase">
        {{store.workerPreview?.worker.last_name+ ' '+store.workerPreview?.worker.first_name+' '+store.workerPreview?.worker.middle_name}}
      </div>
      <div class="col-span-12"><span class="font-medium">{{$t('workerView.general.passportJSHSHIR')}}</span>: {{store.workerPreview?.worker.pin}}</div>
      <div class="col-span-12"> <span class="font-medium">{{$t('workerView.general.phone')}}</span>: {{store.workerPreview?.worker.phones[0].phone}}	</div>
      <div class="col-span-12"> <span class="font-medium">{{$t('workerView.general.position')}}</span>: {{store.workerPreview?.post_name}}	</div>
      <div class="col-span-12"><span class="font-medium">{{$t('workerView.general.department')}}</span>: {{store.workerPreview?.department?.name}}	</div>
      <div class="col-span-12"><span class="font-medium">{{$t('workerView.general.salary')}}</span>: {{store.workerPreview?.salary}} {{$t('content.sum')}}</div>
    </template>


  </div>
</template>

<style scoped>

</style>