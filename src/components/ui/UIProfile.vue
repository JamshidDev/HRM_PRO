<script setup>
import {h} from "vue";
import {NIcon} from "naive-ui";
import {useRouter} from "vue-router";
import {Person24Regular, Settings16Regular, SignOut20Regular} from "@vicons/fluent";
import {useAppStore, useAccountStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
const router = useRouter()
const store = useAppStore()
const accountStore = useAccountStore()





const renderIcon = (icon)=> {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon, {class:"text-xl"})
    });
  };
}

const options = ref([
  {
    label: t('content.profile'),
    key: "profile",
    icon: renderIcon(Person24Regular)
  },
  {
    label: t('content.setting'),
    key: "setting",
    icon: renderIcon(Settings16Regular)
  },
  {
    label: t('content.logOutSystem'),
    key: "logout",
    icon: renderIcon(SignOut20Regular)
  }
])

const changeOption = (v)=>{
  console.log(v)
  if(v==='profile'){
    router.push(AppPaths.Profile)
  }else if(v==='logout'){
    store._logOutApp()
  }
}
</script>

<template>
  <n-dropdown :options="options"  trigger="click" @select="changeOption">
    <n-avatar
        class="cursor-pointer"
        round
        size="large"
        :src="accountStore.account?.worker?.photo"
        :fallback-src="useAppSetting.noAvailableImage"
    />
  </n-dropdown>
</template>

<style scoped>

</style>