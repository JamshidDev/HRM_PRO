<script setup>
import {useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"

const store = useComponentStore()
</script>

<template>
  <template v-if="store.workerPreview?.worker && store.workerPreview?.worker?.relatives">
    <div class="w-full grid grid-cols-12 mt-12">
      <template
          v-for="(item, idx) in store.workerPreview?.worker?.relatives"
          :key="idx"
      >
        <div class="col-span-12 p-2">
          <div class="w-full bg-surface-section border border-surface-line
           relative rounded-lg p-4 h-full overflow-hidden">
            <div class="flex mb-relative z-2">
<!--              <span class="mr-2">{{item?.relative?.name}}</span>-->
              <span class="font-semibold text-lg w-full uppercase"><span class="text-primary">{{item?.relative?.name}}</span> / {{Utils.combineFullName(item)}}</span>
            </div>
            <div class="flex mt-4 relative z-2">
              <span class="mr-2 text-gray-400 w-[120px]">{{$t('relativePage.form.post_name')}}</span>
              <span class="text-end leading-[1.2] font-medium" style="width:calc(100% - 120px)"> {{item?.post_name}}</span>

            </div>
            <div class="flex relative z-2">
              <span class="mr-2 text-gray-400 w-[120px]">{{$t('relativePage.form.birthday')}}</span>
              <span class="text-end leading-[1.2] font-medium" style="width:calc(100% - 120px)"> {{item?.birthday}}</span>
            </div>
            <div class="flex relative z-2">
              <span class="mr-2 text-gray-400 w-[120px]">{{$t('relativePage.form.birthdayPlace')}}</span>
              <span class="text-end leading-[1.2] font-medium" style="width:calc(100% - 120px)"> {{item?.birth_place}}</span>
            </div>
            <div class="flex relative z-2">
              <span class="mr-2 text-gray-400 w-[120px]">{{$t('createWorkerPage.form.address')}}</span>
              <span class="text-end leading-[1.2] font-medium" style="width:calc(100% - 120px)"> {{item?.address}}</span>
            </div>

          </div>
        </div>
      </template>


    </div>
  </template>

</template>

<style scoped>
</style>