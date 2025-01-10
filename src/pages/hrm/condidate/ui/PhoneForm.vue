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
    phone:'+998',
    main:false,
  })
}

const onChange = (value, item)=>{
  if(value){
    phones.value = phones.value.map((v)=>{
      if(v.id !== item.id) return {...v, main:false}
      else return v
    })
  }

}

watchEffect(()=>{
  if(phones.value.length === 1){
    phones.value[0].main = true
  }
  if(!phones.value.some((x)=>x.main)){
    phones.value[0].main = true
  }
})

const onRemove = (id)=>{
  phones.value = phones.value.filter((v)=>v.id !== id)

}
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <template v-for="(item, idx) in phones" :key="idx">
      <div
          class="col-span-4"
      >
        <template v-if="idx === 0">
          <n-form-item :show-label="false" path="phones">
            <n-input-group>
              <n-button
                  v-if="idx>0"
                  @click="onRemove(item.id)"
                  type="error">
                <template #icon>
                  <Delete28Regular/>
                </template>
              </n-button>

              <n-button>
                <n-checkbox v-model:checked="item.main" @update:checked="onChange($event, item)" />
              </n-button>
              <n-input
                  class="w-full"
                  type="text"
                  :placeholder="$t(`content.phone`)"
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
          </n-form-item>
        </template>
        <template v-else>
          <n-input-group>
            <n-button
                v-if="idx>0"
                @click="onRemove(item.id)"
                type="error">
              <template #icon>
                <Delete28Regular/>
              </template>
            </n-button>

            <n-button>
              <n-checkbox v-model:checked="item.main" @update:checked="onChange($event, item)" />
            </n-button>
            <n-input
                class="w-full"
                type="text"
                :placeholder="$t(`content.phone`)"
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
        </template>



      </div>
    </template>
    <div class="col-span-12">
      <span class="text-xs text-gray-400">{{$t('createWorkerPage.ui.phone')}}</span>
    </div>
  </div>
</template>

<style scoped>

</style>