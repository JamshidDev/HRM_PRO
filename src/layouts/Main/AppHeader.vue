<script setup>
import {NAvatar, NText} from "naive-ui";
import uzFlag from "../../assets/images/content/uz.png"
import ruFlag from "../../assets/images/content/ru.png"
import enFlag from "../../assets/images/content/en.png"
import i18n from "../../i18n/index.js"
const {t} = i18n.global
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
              style: "margin-right: 12px;",
              src:uzFlag
            }),
            h("div", {
              class: "font-medium"
            }, [
              h(NText, { depth: 3 }, { default: () =>t('content.langUz')})
            ])
          ]
      );
    },
    props: {
      onClick: () => {
        console.log("OK1")
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
          style: "margin-right: 12px;",
          src:ruFlag
        }),
        h("div", { style: "font-size: 16px;" }, [
          h(NText, { depth: 3 }, { default: () => t('content.langRu') })
        ])
      ]
  );
},
     props: {
       onClick: () => {
         console.log("OK2")
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
               style: "margin-right: 12px;",
               src:enFlag
             }),
             h("div", { style: "font-size: 16px;" }, [
               h(NText, { depth: 3 }, { default: () => t('content.langEn') })
             ])
           ]
       );
     },
     props: {
       onClick: () => {
         console.log("OK3")
       }
     }
   },
]


</script>

<template>
  <div class="app__header-container
     w-full h-[58px] bg-surface-section border-b  border-surface-line
     flex justify-between items-center px-[20px]
"
  >
    <div></div>
    <div class="flex gap-2 justify-end items-center">

      <n-dropdown trigger="click" :options="options">
        <div class="flex items-center gap-2  border-surface-line p-1 rounded cursor-pointer">
          <n-avatar
              round
              size="small"
              :src="uzFlag"
          />
          <span class="text-sm">Uzbek</span>
        </div>
      </n-dropdown>
      <n-avatar
          class="cursor-pointer"
          round
          size="medium"
          src="./public/logo.png"
      />
    </div>
  </div>
</template>