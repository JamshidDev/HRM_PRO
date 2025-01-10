<script setup>
import onlyOfficeApp from "./onlyOfficeApp.vue"
import {useOnlyOfficeStore} from "@/store/modules/index.js"
import {PanelLeftContract16Filled} from "@vicons/fluent"
const store = useOnlyOfficeStore()

const emits = defineEmits(["onBack"])

const onBack = ()=>{
  store.visible = false
  emits('onBack')
}
</script>

<template>
  <n-drawer  :close-on-esc="false" class="ui__onlyOffice-drawer" height="100vh" v-model:show="store.visible" width="100%"  placement="bottom">
    <n-drawer-content title="Stoner" class="h-screen" >
      <div class="w-full flex-col flex">
        <div class="w-full h-[50px] flex justify-between items-center px-4">
          <div class="flex">
            <n-button @click="onBack" type="error" secondary>
              {{$t('content.back')}}
              <template #icon>
                <n-icon size="24">
                  <PanelLeftContract16Filled/>
                </n-icon>
              </template>
            </n-button>
          </div>
          <div></div>
          <div></div>
        </div>
        <div class="w-full" style="height: calc(100vh - 50px)">
          <onlyOfficeApp/>
        </div>
      </div>
    </n-drawer-content>
  </n-drawer>
</template>
