<script setup>
import {navigations} from "../../data/navigations.js"
import {ChevronDown12Regular, ChevronDoubleLeft16Filled, ErrorCircle20Filled, Bookmark16Filled} from "@vicons/fluent"
import {useAccountStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import {PageInstruction} from '@/components/index.js'

const {t} = i18n.global
const route = useRoute()
const router = useRouter()

const store = useAccountStore()
const emits = defineEmits(['onChange', 'onOpen', 'onClose'])


const checkPage = (path) => {
  if ([AppPaths.Home, AppPaths.AIConversation, AppPaths.Info].includes(path)) {
    menuPath.value = null
    emits('onClose')
  }
}

watch(
    () => route.path,
    (newPath) => {
      checkPage(newPath)
    },
);

const showPanel = ref(true)
const menuPath = ref(null)
const collapse = ref(false)

const controlCollapse = () => {
  collapse.value = !collapse.value
}

const nextPanel = (path) => {
  menuPath.value = path
  let index = navigations.findIndex((v => v.path === path))
  if (navigations[index].children && navigations[index].children.length) {
    router.push(navigations[index].children.filter((v) => (store.isModeDev || store.checkPermission(v.permission)))?.[0]?.path)
    emits('onOpen')
  } else {
    router.push(navigations[index].path)
    emits('onClose')
  }
  showPanel.value = false
  setTimeout(() => {
    showPanel.value = true
  }, 150)
}

const onChangePath = (item) => {
  if(item?.disable) return
  router.push(item.path)
}


const miniMenu = computed(() => {
  return navigations.map((v) => ({
    index: v.index,
    label: v.label,
    path: v.path,
    icon: v.icon,
    permission: v.permission,
    allowed: store.checkPermission(v.permission)
  })).filter((v) => {
    return store.isModeDev || v.allowed
  })

})

const panelMenu = computed(() => {
  if (menuPath.value == null) {
    return []
  }
  /**
   * It is impossible the navigation find returns undefined value
   * since menuPath variable is only set when clicking one of the mini menus
   * if you think about the user typing from the router you have to implement navigation guard for routes
   */
  return navigations.find((v => v.path === menuPath.value)).children.map((v) => ({
    ...v,
    allowed: store.checkPermission(v.permission)
  })).filter((v) => store.isModeDev || v.allowed)
})

const menuName = computed(() => {
  if (menuPath.value === '/hrm') return t('sidebar.hrm')
  else if (menuPath.value === '/attestation') return t('sidebar.attestation')
  else if (menuPath.value === '/admin') return t('sidebar.admin')
  else if (menuPath.value === '/chat') return t('sidebar.chat')
  else if (menuPath.value === '/docflow') return t('sidebar.docflow')
  else if (menuPath.value === '/timesheet') return t('sidebar.timesheet')
  else if (menuPath.value === '/turnstile') return t('turnstile.title')
  else if (menuPath.value === '/lms') return t('sidebar.lms')
  else if (menuPath.value === AppPaths.Hospital) return t('sidebar.hospital')
  else if (menuPath.value === AppPaths.Accountant) return t('sidebar.accountant')
  else return ''
})


const onClick = () => {
  if (panelMenu.value?.length) {
    emits('onChange')
  }
}

const isComboxMenu = (path) => {
  if (route.path.includes(path)) {
    menuPath.value = path
  }
  return route.path.includes(path)
}

const isCurrentPath = (path) => {
  return route.path === path
}

onMounted(() => {
  checkPage(route.path)
})

</script>

<template>
  <div class="sidebar-content">
    <div class="mini-content">
      <div>
        <div @click="()=>router.push({name:AppPaths.Home.substring(1)})" class="logo-content cursor-pointer">
          <img :src="useAppSetting.appLogoUrl" alt=" " class="object-center animation-logo"/>
        </div>

        <template v-for="item in miniMenu" :key="item">
          <div class="flex flex-col relative group">
            <div
                :class="[isComboxMenu(item.path) && 'active-mini-content']"
                class="main-menu-item"
                @click="nextPanel(item.path)">
              <n-icon
              >
                <component :is="item.icon"/>
              </n-icon>
            </div>
            <div class="absolute group-hover:opacity-100 group-hover:left-[60px] transition-all duration-300
            pointer-events-none opacity-0 h-[32px] bg-dark border border-secondary left-[40px] rounded-lg
             top-[20px] z-[999] text-center text-white flex items-center justify-center text-nowrap px-2">
              <p class="tooltip-triangle line-clamp-1 absolute font-bold font-poppins"></p>
              {{$t(item.label)}}
            </div>
          </div>


        </template>
      </div>
      <PageInstruction />

    </div>
    <div class="panel-content sidebar-panel overflow-y-auto! h-screen" style="scrollbar-width: none;">
      <transition name="slide-right" mode="out-in">
        <div v-if="showPanel && panelMenu?.length">
          <span class="text-sm block text-textColor2 truncate font-semibold pl-4 mb-3 mt-3">{{ menuName }}</span>
          <template v-for="item in panelMenu" :key="item">

            <template v-if="item?.children && item.children.length>0">
              <div class="panel-item-multiple">
                <div class="panel-header" @click="controlCollapse">
                  <div class="item-icon">
                    <i :class="item.icon"></i>
                  </div>
                  <div class="item-title">
                    <span>{{ $t(item.label) }}</span>
                    <n-icon size="18">
                      <ChevronDown12Regular/>
                    </n-icon>
                  </div>
                </div>
                <div class="panel-body pl-2"
                     :style="{height:collapse? (item.children.length * 38)+'px' : '0px'}"
                >
                  <div v-for="subMenu in item.children"
                       class="panel-item">
                    <div class="item-icon">
                      <i :class="subMenu.icon"></i>
                    </div>
                    <div class="item-title">{{ $t(subMenu.label) }}</div>
                  </div>

                </div>
              </div>
            </template>


            <template v-else>
              <div
                  @click="onChangePath(item)"
                  class="panel-item-single relative"
                  :class="[isCurrentPath(item.path) && 'active-panel-item-single', item?.disable && 'opacity-30']"
              >
                <div :class="[item?.color]" class="item-icon rounded-md ml-[-2px]">
                  <n-icon size="20">
                    <component :is="item.icon"/>
                  </n-icon>
                </div>
                <div class="item-title truncate pl-2">
                  <span>{{ $t(item.label) }}</span>
                </div>

<!--                <span class="absolute top-[-6px] right-[0px]">-->
<!--                  <n-icon size="18" class="text-success/60">-->
<!--                    <Bookmark16Filled/>-->
<!--                  </n-icon>-->
<!--                </span>-->
              </div>
            </template>


          </template>
        </div>
      </transition>
    </div>


    <div @click="onClick" class="control-btn border border-surface-line">
      <n-icon>
        <ChevronDoubleLeft16Filled/>
      </n-icon>
    </div>
  </div>
</template>

<style scoped>
.tooltip-triangle{
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-right: 10px solid #020304;
  border-bottom: 7px solid transparent;
  left: -10px;
  top: 8px;

}

.slide-right-enter-active {
  transition: all 0.2s ease;
}

.slide-right-leave-active {
  transition: all 0.2s ease;
}

.slide-right-enter-from {
  transform: translateX(-20px);

  opacity: 0;
}

.slide-right-enter-to {
  transform: translateX(0px);
  opacity: 1;
}

.slide-right-leave-from {
  transform: translateX(0px);
  opacity: 1;
}

.slide-right-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
</style>