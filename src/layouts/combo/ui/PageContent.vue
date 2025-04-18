<script setup>
import AppHeader from "./AppHeader.vue"
import {AIButton} from "@/components/index.js"
import {AppPaths} from "@/utils/index.js"

const router = useRouter()
const route = useRoute()
const emits = defineEmits(['onOpen'])

const onClick = ()=>{
  emits('onOpen')
}

</script>

<template>
<div class="page-content">
<AppHeader
    @on-change="onClick"
/>
  <div class="main-content">
    <router-view v-slot="{ Component }">
      <transition name="slide-right" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
    <div class="fixed w-[90px] h-[60px] z-[999] bottom-[60px] right-[20px]">
      <AIButton
          v-if="route.name !== AppPaths.AIConversation.substring(1)"
          @click="()=>router.push({name:AppPaths.AIConversation.substring(1)})"
      />
    </div>
  </div>
</div>
</template>
