<script setup>
import {useComponentStore} from "@/store/modules/index.js"
import {HomePerson20Regular, Search48Filled} from "@vicons/fluent"

const store = useComponentStore()

const search = ref(null)

const onAdd = ()=>{
  store.checkUserVisible = true
}
</script>

<template>
<div class="grid grid-cols-12">
  <div class="col-span-6">
    <n-input
        style="max-width: 200px; width: 100%"
        v-model:value="search"
        type="text"
        :placeholder="$t('content.search')"

    >
      <template #suffix>
        <n-icon :component="Search48Filled" />
      </template>
    </n-input>
  </div>
  <div class="col-span-6 flex justify-end ">

    <n-button
        type="primary"
        icon-placement="right"
        @click="onAdd"
    >
      <template #icon>
        <n-icon>
          <HomePerson20Regular/>
        </n-icon>
      </template>
      {{$t('workerPage.filter.contract')}}
    </n-button>

  </div>
</div>
</template>

<style scoped>

</style>