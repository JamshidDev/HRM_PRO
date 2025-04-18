<script setup>
import {UIHierarchy, UIPanZoomArea, TreeData, UIUserGroup, UIUser} from "@/components/index.js";
import {TextBulletListTree16Filled, Organization12Filled, Eye24Regular} from '@vicons/fluent'
import {useUsefulStore} from "@/store/modules/index.js"

const store = useUsefulStore()

const tab = ref(0);
const buttons = [
  {
    icon: TextBulletListTree16Filled,
  },
  {
    icon: Organization12Filled,
  },
]

onMounted(() => {
  store._leaders()
})

const openOrgDetail = (org) => {
  store.orgInstance = org
  store.visible = true
}

</script>
<template>
  <div>
    <div class="absolute top-2 right-2 z-10">
      <n-button-group>
        <n-button v-for="(item, idx) in buttons" :key="idx" @click="tab=idx"
                  :type="tab === idx ? 'primary' : 'default'">
          <template #icon>
            <n-icon :component="item.icon"/>
          </template>
        </n-button>
      </n-button-group>

    </div>
    <n-tabs animated style="height: calc(100vh - 150px);" v-model:value="tab" class="h-full"
            :tab-style="{display: 'none'}" :pane-wrapper-style="{height: '100%'}">

      <n-tab-pane :name="0" class="h-full overflow-auto">

        <!-- Data List -->
        <TreeData
            :multiple="false"
            :opened="true"
            :options="store.leaders"
            :modelV="store.structureModel"
            :checkedVal="store.structureCheck"
            @updateModel="(v)=>store.structureModel=v"
            @updateCheck="(v)=>store.structureCheck=v"
        >

          <template v-slot:title="{data}">
            <div class="flex justify-between items-center border-b  border-surface-line h-[45px]">
              <p class="font-semibold">
                {{ data.name }}
              </p>
              <div class="flex gap-1 items-center">
                <div>
                  <UIUser
                      class="w-[300px]"
                      v-if="data.leaders.length > 0"
                      :data="{
                      photo:data.leaders[0]?.worker.photo,
                      firstName:data.leaders[0]?.worker.first_name,
                      middleName:data.leaders[0]?.worker.middle_name,
                      lastName:data.leaders[0]?.worker.last_name,
                      position: data.leaders[0]?.position_short_name
                    }"
                  >
                    <template v-slot:name="{title}">
                      <span class="font-bold leading-2 text-sm text-textColor2 truncate w-full ">{{ title }}</span>
                    </template>
                  </UIUser>
                </div>
                <n-button v-if="data?.leaders?.length" type="primary" size="tiny" tertiary @click="openOrgDetail(data)">
                  <template #icon>
                    <n-icon :component="Eye24Regular"/>
                  </template>
                </n-button>
              </div>
            </div>
          </template>
        </TreeData>
      </n-tab-pane>
      <n-tab-pane :name="1" class="h-full">

        <UIPanZoomArea>
          <UIHierarchy v-if="store.leaders?.[0]" :tree="store.leaders[0]">
            <template v-slot:default="{data}">
              <div
                  class="cursor-pointer flex flex-col gap-2 items-center rounded-md border-surface-line border p-1 hover:bg-blue-50 transition-all"
                  @click="openOrgDetail(data)">
                <p class="text-center font-semibold text-xs
">{{ data.name }}</p>

                <UIUser
                    class="w-full"
                    :avatar-clickable="false"
                    v-if="data.leaders.length > 0"
                    :data="{
                      photo:data.leaders[0]?.worker.photo,
                      firstName:data.leaders[0]?.worker.first_name,
                      middleName:data.leaders[0]?.worker.middle_name,
                      lastName:data.leaders[0]?.worker.last_name,
                      position: data.leaders[0]?.position_short_name
                    }"
                >
                </UIUser>


              </div>
            </template>
          </UIHierarchy>
        </UIPanZoomArea>
      </n-tab-pane>

    </n-tabs>
  </div>
</template>