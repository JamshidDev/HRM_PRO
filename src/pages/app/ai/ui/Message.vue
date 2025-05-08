<script setup>
import {Copy16Regular, ThumbLike20Regular,
  ThumbDislike20Regular, BrainCircuit24Filled, ThumbLike24Filled, ThumbDislike20Filled} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
const props = defineProps({
  data:{
    type:Object,
    required:true,
  }
})
import {useAIConversationStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"
const {t} = i18n.global
const store = useAIConversationStore()


const copied = ()=>{
  $Toast.info(t('message.successDone'))
}

const isBot = computed(()=>props.data?.bot)
</script>

<template>
<div
    class="flex w-full mb-6"
    :class="[isBot? 'justify-start' : 'justify-end']"
>
  <div class="flex items-end">
    <div
        v-if="isBot"
        class="flex items-end mx-2">
      <n-avatar
          round
          size="large"
          class="bg-surface-section!"
          :src="useAppSetting.appLogoUrl"
      >

      </n-avatar>
    </div>


    <div
        :class="[isBot? 'bg-info/5' : 'bg-primary! text-white!']"
        class=" inline-block py-1 px-4  border border-surface-line rounded-2xl">
        <p
            :class="[isBot? 'text-surface!' : 'text-white!']"
            class="prose w-auto"
            v-html="data?.text"
        ></p>


      <div v-if="isBot" class="flex justify-between mt-4 text-secondary">
        <div class="flex gap-2">
          <n-icon
              class="cursor-pointer scale-100 hover:scale-[1.1] transition-all" size="20">
            <ThumbLike24Filled
                v-if="data.like===2" class="text-info/50"
            />
            <ThumbLike20Regular
                @click="store.like(data.key, true)"
                v-else/>
          </n-icon>
          <n-icon
              class="cursor-pointer scale-100 hover:scale-[1.1] transition-all" size="20">
            <ThumbDislike20Filled
                class="text-danger/50"
                v-if="data.like===3"/>
            <ThumbDislike20Regular
                @click="store.like(data.key, false)"
                v-else/>
          </n-icon>
        </div>
        <div>
          <n-icon
              @click="Utils.copyToClipboard(data?.text, copied)"
              class="cursor-pointer scale-100 hover:scale-[1.1] transition-all" size="24">
            <Copy16Regular/>
          </n-icon>
        </div>
      </div>
    </div>


    <div
        v-if="!isBot"
        class="flex items-end mx-2">
      <n-avatar
          round
          size="large"
          src="empty.png"
          :fallback-src="data?.photo"
      />
    </div>
  </div>

</div>
</template>

<style>
.prose {
  strong {
    color: var(--color-textColor0) !important;
    font-weight: bold;
  }
  pre{
    background-color: var(--color-textColor0) !important;
    width: 100%;
    overflow: auto;
    margin-top: 10px;
    margin-bottom: 10px;
    display: inline-block !important;
    text-wrap:wrap;
  }
  p{
    margin-top: 2px;
    margin-bottom: 2px;
    width: 100% !important;
  }

}

</style>