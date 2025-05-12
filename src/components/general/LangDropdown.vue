<script setup>

import uzFlag from "@/assets/images/content/uz.png";
import {NAvatar, NText} from "naive-ui";
import ruFlag from "@/assets/images/content/ru.png";
import enFlag from "@/assets/images/content/en.png";
import i18n from "@/i18n/index.js";
import {ChevronDown24Filled} from '@vicons/fluent'
import {useAppSetting} from "@/utils/index.js"
const {t} = i18n.global

const currentLang = ref('uz')
const options= [
  {
    key: "header1",
    type: "render",
    render: ()=>{
      return h(
          "div",
          {
            class: "hover:bg-surface-200 p-1 m-1 rounded-sm" ,
            style: "display: flex; align-items: center; cursor:pointer"
          },
          [
            h(NAvatar, {
              round: true,
              size:'small',
              class:"w-[24px]! h-[24px]! mr-2",
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
            class: "hover:bg-surface-200 p-1 m-1 rounded-sm" ,
            style: "display: flex; align-items: center; cursor:pointer"
          },
          [
            h(NAvatar, {
              round: true,
              size:'small',
              class:"w-[24px]! h-[24px]! mr-2",
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
            class: "hover:bg-surface-200 p-1 m-1 rounded-sm" ,
            style: "display: flex; align-items: center; cursor:pointer"
          },
          [
            h(NAvatar, {
              round: true,
              size:'small',
              class:"w-[24px]! h-[24px]! mr-2",
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



const  changeLang=(lang)=>{
  localStorage.setItem(useAppSetting.languageKey, lang)
  window.location.reload()
  currentLang.value = lang

}

const dropdown = computed(()=>{
  if(currentLang.value === 'en') return {icon:enFlag, text:'content.langEn'}
  else if(currentLang.value === 'ru') return {icon:ruFlag, text:'content.langRu'}
  else return {icon:uzFlag, text:'content.langUz'}
})


onMounted(()=>{
  currentLang.value = localStorage.getItem(useAppSetting.languageKey)
})
</script>

<template>
  <n-dropdown trigger="click" :options="options">
    <div class="flex items-center  border-surface-line py-1 px-1 rounded-xl border w-[90px] cursor-pointer h-[32px] overflow-hidden">
      <n-avatar
          class="w-[20px]! h-[20px]!"
          round
          size="small"
          :src="dropdown.icon"
      />
      <span class="text-sm text-textColor3 whitespace-nowrap mx-1 w-[40px]">{{$t(dropdown.text)}}</span>
      <n-icon class="text-[12px] text-secondary">
        <ChevronDown24Filled />
      </n-icon>
    </div>
  </n-dropdown>
</template>