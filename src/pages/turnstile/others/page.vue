<script setup>
import {Tabs, TabBar} from "./ui/index.js"
import {useAccountStore, useOthersStore} from "@/store/modules/index.js"
import UserImageLogPage from "@/pages/turnstile/userImageLogs/page.vue"
import InvalidUserPage from "@/pages/turnstile/invalidUser/page.vue"
import TelegramUserPage from "@/pages/turnstile/telegramUser/page.vue"
import HCServerPage from "@/pages/turnstile/hcServer/page.vue"
import SyncLogPage from "@/pages/turnstile/syncLog/page.vue"

import i18n from "@/i18n/index.js"
import {
  AlertUrgent16Filled,
  ArrowSyncCircle24Filled, CellularData124Filled,
  ImageMultiple24Filled,
  PersonProhibited24Filled
} from "@vicons/fluent"

const store = useOthersStore()
const accStore = useAccountStore()
const t = i18n.global.t






const emitTeleportEvent = (content) => {
  window.dispatchEvent(new CustomEvent('teleport-changed', {
    detail: { hasContent: content }
  }))
}
const pages =computed(()=>{
  return [
    // {
    //   name:t('userImageLogs.name'),
    //   icon: markRaw(ImageMultiple24Filled),
    //   component:markRaw(UserImageLogPage),
    //   key:store.tabs[0],
    //   visible:accStore.checkPermission(accStore.pn.turnstileHikCentralUserImageLogs),
    //   color:'primary',
    // },
    // {
    //   name:t('invalidUser.name'),
    //   icon: markRaw(PersonProhibited24Filled),
    //   component:markRaw(InvalidUserPage),
    //   key:store.tabs[1],
    //   visible:accStore.checkPermission(accStore.pn.turnstileHikCentralInvalidUser),
    //   color:'error',
    // },

    {
      name:t('syncLog.name'),
      icon: markRaw(ArrowSyncCircle24Filled),
      component:markRaw(SyncLogPage),
      key:store.tabs[3],
      visible:accStore.checkPermission(accStore.pn.turnstileHikCentralEvents),
      color:'primary',
    },
    {
      name:t('hcServer.name'),
      icon: markRaw(CellularData124Filled),
      component:markRaw(HCServerPage),
      key:store.tabs[4],
      visible:accStore.checkPermission(accStore.pn.turnstileHikCentralJob),
      color:'primary',
    },
    {
      name:t('notification.name'),
      icon: markRaw(AlertUrgent16Filled),
      component:markRaw(TelegramUserPage),
      key:store.tabs[2],
      visible:accStore.checkPermission(accStore.pn.turnstileHikCentralTgUser),
      color:'warning',
    },
  ]
})

onMounted(()=>{
  store.pageOptions = pages.value.filter(page=>page.visible)
  store.activeTab = pages.value.filter(page=>page.visible)?.[0]?.key || null

  emitTeleportEvent(true)

})

onBeforeUnmount(()=>{
  emitTeleportEvent(false)
})
</script>

<template>
<div>
  <Teleport to="#layout-header-tab">
    <TabBar v-if="store.pageOptions.length>0"/>
  </Teleport>
  <Tabs/>
</div>
</template>
