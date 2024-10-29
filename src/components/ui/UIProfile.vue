<script setup>
import {h} from "vue";
import {NIcon} from "naive-ui";
import {useRouter} from "vue-router";
import {Person24Regular, Settings16Regular, SignOut20Regular} from "@vicons/fluent";
import i18n from "@/i18n/index.js"
const {t} = i18n.global
const router = useRouter()
import {AppPaths} from "@/utils/index.js";

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
    router.push(AppPaths.Login)
  }
}
</script>

<template>
  <n-dropdown :options="options"  trigger="click" @select="changeOption">
    <n-avatar
        class="cursor-pointer"
        round
        size="large"
        src="empty.png"
        fallback-src="/public/default-user.png"
    />
  </n-dropdown>
</template>

<style scoped>

</style>