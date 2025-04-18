<script setup>
import {useUsefulStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {Mask} from "maska"

const mask = new Mask({mask: ['##-###-##-##', '##-###']})
const store = useUsefulStore()

</script>
<template>
<div class="h-full flex flex-col gap-2">
  <div
    class="rounded-xl border-surface-line border overflow-hidden flex gap-2 h-[200px]"
    v-for="(item, idx) in store.orgInstance.leaders"
    :key="idx"
  >
    <div class="h-full w-[150px] overflow-hidden shrink-0">
      <img class="w-full h-full object-cover object-top" :alt="Utils.combineFullName(item.worker)" :src="item.worker.photo" />
    </div>
    <div class="flex flex-col gap-2 p-2">
      <p class="font-semibold text-xl">{{Utils.combineFullName(item.worker)}}</p>
      <p>{{item.position_full_name}}</p>
      <div class="flex flex-wrap gap-2">
        <n-button v-for="(phone, idx) in item.phones" :key="idx" type="primary" size="tiny" dashed>
          {{mask.masked(phone)}}
        </n-button>
      </div>
    </div>
  </div>
</div>
</template>