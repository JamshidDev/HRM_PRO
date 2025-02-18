<script setup>
import {useComponentStore} from "@/store/modules/index.js"
import Utils from "../../../utils/Utils.js"

const store = useComponentStore()
</script>

<template>
  <template v-if="store.workerPreview?.worker && store.workerPreview?.worker?.relatives">
    <div class="w-full grid grid-cols-12 mt-12">
      <div class="col-span-12">
        <h3 class=" text-primary font-semibold uppercase mb-2">{{$t('relativePage.title')}}</h3>
        <table class="w-full border border-surface-line border-dashed border-collapse">
          <thead>
          <tr>
            <th class="border border-surface-line border-dashed bg-surface-50" style="min-width:100px; width:160px">{{$t('relativePage.form.relative')}}</th>
            <th class="border border-surface-line border-dashed bg-surface-50" style="min-width:100px; width: 160px">{{$t('content.fullName')}}</th>
            <th class="border border-surface-line border-dashed bg-surface-50" style="min-width:100px">{{$t('relativePage.form.post_name')}}</th>
            <th class="border border-surface-line border-dashed bg-surface-50" style="min-width:100px; width:200px">{{$t('relativePage.form.birthdayPlace')}}</th>
            <th class="border border-surface-line border-dashed bg-surface-50" style="min-width:100px; width:200px">{{$t('createWorkerPage.form.address')}}</th>
          </tr>
          </thead>
          <tbody>
          <tr v-for="(item, idx) in store.workerPreview?.worker?.relatives" :key="idx">
            <td  class="p-2 font-semibold border border-surface-line border-dashed">{{item?.relative?.name}}</td>
            <td class="p-2 text-blue-900 border border-surface-line border-dashed">{{Utils.combineFullName(item)}}</td>
            <td class="p-2 text-blue-900 border border-surface-line border-dashed">{{item?.post_name}}</td>
            <td class="p-2 text-blue-900 border border-surface-line border-dashed">{{Utils.timeOnlyDate(item.birthday) + ', '+ item?.birth_place}}</td>
            <td class="p-2 text-blue-900 border border-surface-line border-dashed">{{item?.address}}</td>
          </tr>
          </tbody>
        </table>
      </div>

    </div>
  </template>

</template>

<style scoped>

</style>