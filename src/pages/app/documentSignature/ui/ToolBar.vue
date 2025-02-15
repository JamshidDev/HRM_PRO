<script setup>
import {UILanguage} from "@/components/index.js"
import {DrawText24Regular} from "@vicons/fluent"
import {usePdfViewerStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"

const store = usePdfViewerStore()
const router = useRouter()

const goSignature = ()=>{
  const el = document.getElementById('draw-signature')
  if (el) {
    el.scrollIntoView({ behavior: "smooth" });
  }
}

</script>

<template>
<div
    style="box-shadow: 0 8px 6px -10px rgba(0, 0, 0, 0.5)"
    class="w-full h-[60px] border-b bg-surface-ground border-surface-line fixed left-0 top-0 z-50 px-5">
    <div class="flex justify-between h-full items-center max-w-[1440px] mx-auto">
      <div
          @click="router.push(AppPaths.Home)"
          class="w-[50px] h-[50px] overflow-hidden cursor-pointer" >
        <img
            class="w-full object-cover"
            src="/public/logo.png" alt="app logo">
      </div>
      <div class="flex gap-4">
        <n-button
            v-if="!store.isSigned"
            @click="goSignature"
            type="default" >
          <template #icon>
            <DrawText24Regular/>
          </template>
          {{$t('signature.goSignature')}}</n-button>
        <UILanguage/>
      </div>

    </div>
</div>
</template>