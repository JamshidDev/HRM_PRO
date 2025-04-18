<script setup>
import {ArrowUp32Filled, ArrowSyncCheckmark24Filled, BookClock24Filled, Scales32Filled, HatGraduation16Filled} from "@vicons/fluent"
import i18n from "@/i18n/index.js"
import {useAccountStore} from "@/store/modules/index.js"
import {marked} from "marked"

const store = useAccountStore()

const {t} = i18n.global

function normalizeMarkdown(md) {
  return md.replace(/([^\n])(-\s)/g, '$1\n$2');
}

const cards = [
  {
    id:1,
    name: marked.parse(normalizeMarkdown(t('aiConversation.disclaimer.cardOne'))),
    icon:ArrowSyncCheckmark24Filled,
  },
  {
    id:2,
    name:marked.parse(t('aiConversation.disclaimer.cardTwo')),
    icon:BookClock24Filled,
  },
  {
    id:3,
    name:marked.parse(t('aiConversation.disclaimer.cardThree')),
    icon:Scales32Filled,

  },
  {
    id:4,
    name:marked.parse(t('aiConversation.disclaimer.cardFour')),
    icon:HatGraduation16Filled,
  },
]
</script>

<template>
<div class="w-full grid grid-cols-12 gap-4 mb-10">
    <div class="col-span-12">
      <h1 class="2xl:text-5xl lg:text-4xl md:text-4xl text-sm font-bold mb-4 bg-gradient-to-r from-primary to-danger bg-clip-text text-[transparent]">{{$t('aiConversation.welcomeTo', {n:store.fullName})}}</h1>
      <p class="text-2xl font-semibold text-[#90A1B9]">{{$t('aiConversation.canIHelpYouToday')}}</p>
    </div>

  <template v-for="(card,idx) in cards" :key="card.id">
    <div
        class="col-span-3 overflow-hidden h-full"
        :class="[idx%2===1? 'rotate-[2deg]' : 'rotate-[-2deg]']"
    >
      <div class="flex flex-col bg-surface-section py-1 px-3 rounded-lg border border-gray-100 h-full overflow-hidden ">
        <div v-html="card?.name"></div>
        <div class="justify-end items-end flex flex-1 overflow-hidden">
          <n-button class="rotate-45 !bg-gray-100" circle>
            <template #icon>
              <n-icon size="26" class="text-warning">
                <component :is="card.icon" />
              </n-icon>
            </template>
          </n-button>
        </div>

      </div>
    </div>
  </template>
</div>
</template>

<style scoped>

</style>