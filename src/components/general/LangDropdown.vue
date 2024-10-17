<script setup>

import uzFlag from "@/assets/images/content/uz.png";
import {NAvatar, NText} from "naive-ui";
import ruFlag from "@/assets/images/content/ru.png";
import enFlag from "@/assets/images/content/en.png";
import i18n from "@/i18n/index.js";
import {ChevronDown24Filled} from '@vicons/fluent'
const {t} = i18n.global

const currentLang = ref('uz')
const currentLangText = ref('content.langUz')
const options= [
  {
    key: "header1",
    type: "render",
    render: ()=>{
      return h(
          "div",
          {
            class: "hover:bg-surface-200 p-1 m-1 rounded" ,
            style: "display: flex; align-items: center; cursor:pointer"
          },
          [
            h(NAvatar, {
              round: true,
              size:'small',
              class:"!w-[24px] !h-[24px] mr-2",
              src:uzFlag
            }),
            h("div", {
              class:"text-[14px] font-medium"
            }, [
              h(NText, { depth: 3 }, { default: () =>t('content.langUz')})
            ])
          ]
      );
    },
    props: {
      onClick: () => {
        changeLang('uz')
      }
    }
  },
  {
    key: "header2",
    type: "render",
    render:()=>{
      return h(
          "div",
          {
            class: "hover:bg-surface-200 p-1 m-1 rounded" ,
            style: "display: flex; align-items: center; cursor:pointer"
          },
          [
            h(NAvatar, {
              round: true,
              size:'small',
              class:"!w-[24px] !h-[24px] mr-2",
              src:ruFlag
            }),
            h("div", { class:"text-[14px] font-medium" }, [
              h(NText, { depth: 3 }, { default: () => t('content.langRu') })
            ])
          ]
      );
    },
    props: {
      onClick: () => {
        changeLang('ru')
      }
    }
  },
  {
    key: "header3",
    type: "render",
    render:()=>{
      return h(
          "div",
          {
            class: "hover:bg-surface-200 p-1 m-1 rounded" ,
            style: "display: flex; align-items: center; cursor:pointer"
          },
          [
            h(NAvatar, {
              round: true,
              size:'small',
              class:"!w-[24px] !h-[24px] mr-2",
              src:enFlag
            }),
            h("div", { class:"text-[14px] font-medium" }, [
              h(NText, { depth: 3 }, { default: () => t('content.langEn') })
            ])
          ]
      );
    },
    props: {
      onClick: () => {
        changeLang('en')
      }
    }
  },
]

const initialLang = ()=>{
  const lang = localStorage.getItem('applicationLang') || 'uz'
  changeLang(lang)
}


const  changeLang=(lang)=>{
  localStorage.setItem('applicationLang', lang)
  i18n.global.locale = lang
  if(lang ==='uz'){
    currentLangText.value = 'content.langUz'
    currentLang.value = uzFlag
  }else if(lang ==='ru'){
    currentLangText.value = 'content.langRu'
    currentLang.value = ruFlag
  }else if(lang ==='en'){
    currentLangText.value = 'content.langEn'
    currentLang.value = enFlag
  }
}


onMounted(()=>{
  initialLang()
})
</script>

<template>
  <n-dropdown trigger="click" :options="options">
    <div class="flex items-center gap-2  border-surface-line py-1 px-2 rounded-md cursor-pointer border w-[140px]">
      <n-avatar
          class="!w-[24px] !h-[24px]"
          round
          size="small"
          :src="currentLang"
      />
      <span class="text-[14px] text-surface-500 whitespace-nowrap" style="width: calc(100% - 60px)">{{$t(currentLangText)}}</span>
      <n-icon color="#0e7a0d" class="text-[16px]">
        <ChevronDown24Filled />
      </n-icon>
    </div>
  </n-dropdown>
</template>

<style scoped>

</style>