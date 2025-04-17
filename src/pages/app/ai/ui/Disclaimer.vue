<script setup>
import {ArrowUp32Filled} from "@vicons/fluent"
import i18n from "@/i18n/index.js"
import {useAccountStore} from "@/store/modules/index.js"

const store = useAccountStore()

const {t} = i18n.global

const cards = [
  {
    id:1,
    name:t('aiConversation.disclaimer.cardOne')
  },
  {
    id:2,
    name:t('aiConversation.disclaimer.cardTwo')
  },
  {
    id:3,
    name:t('aiConversation.disclaimer.cardThree')
  },
  {
    id:4,
    name:t('aiConversation.disclaimer.cardFour')
  },
]
</script>

<template>
<div class="w-full grid grid-cols-12 gap-4 mb-10">
    <div class="col-span-12">
      <h1 class="text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-danger bg-clip-text text-[transparent]">{{$t('aiConversation.welcomeTo', {n:store.fullName})}}</h1>
      <p class="text-4xl font-semibold text-[#90A1B9]">{{$t('aiConversation.canIHelpYouToday')}}</p>
    </div>

  <template v-for="(card,idx) in cards" :key="card.id">
    <div
        class="col-span-3 overflow-hidden h-full"
        :class="[idx%2===1? 'rotate-[2deg]' : 'rotate-[-2deg]']"
    >
      <div class="flex flex-col bg-surface-section py-1 px-3 text-secondary rounded-lg border border-gray-100 h-full ">
        <div>{{card?.name}}
        </div>
        <div class=" overflow-auto justify-end items-end flex flex-1">
          <n-button class="rotate-45 !bg-gray-100" circle>
            <template #icon>
              <n-icon class="text-gray-500">
                <ArrowUp32Filled/>
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