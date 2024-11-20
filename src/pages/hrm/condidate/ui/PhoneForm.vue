<script setup>
import {Delete28Regular, AddCircle28Regular} from "@vicons/fluent"
import { v4 as uuidv4 } from 'uuid';

const phones = defineModel('phones', {
  type:Array,
  required:true,
  default:[],
})

const onAdd = ()=>{
  phones.value.push({
    id:uuidv4(),
    phone:'+998'
  })
}

const onRemove = (id)=>{
  phones.value = phones.value.filter((v)=>v.id !== id)
}
</script>

<template>
  <div class="grid grid-cols-12 gap-4">
    <template v-for="(item, idx) in phones" :key="idx">
      <div
          class="col-span-4"
      >

        <n-input-group>
          <n-button
              v-if="idx>0"
              @click="onRemove(item.id)"
              type="error">
            <template #icon>
              <Delete28Regular/>
            </template>
          </n-button>
          <n-input
              class="w-full"
              type="text"
              :placeholder="$t(`createWorkerPage.form.lastName`)"
              v-model:value="item.phone"
              v-mask="`+998##-###-##-##`"
          />
          <n-button
              v-if="(idx+1)===phones.length && phones.length<3 "
              @click="onAdd"
              type="primary">
            <template #icon>
              <AddCircle28Regular/>
            </template>
          </n-button>
        </n-input-group>
      </div>
    </template>
  </div>
</template>

<style scoped>

</style>