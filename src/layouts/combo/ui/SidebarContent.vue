<script setup>
import {navigations} from "../../data/navigations.js"
import {ChevronDown12Regular, PeopleSwap20Regular} from "@vicons/fluent"
import {useAccountStore} from "@/store/modules/index.js"
import {useRoute, useRouter} from "vue-router";
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"
const {t} = i18n.global
const router = useRouter()
const route = useRoute()

const store = useAccountStore()
const emits = defineEmits(['onChange', 'onOpen'])

const onClick = () => {
  emits('onChange')
}


const showPanel = ref(true)
const menuPath = ref(null)
const collapse = ref(false)

const controlCollapse = ()=>{
  collapse.value = !collapse.value
}

const nextPanel = (path)=>{
  pushFirstMenu(path)
  menuPath.value = path
  emits('onOpen')
  showPanel.value =false
  setTimeout(()=>{
    showPanel.value = true
  },150)
}

const onChangePath = (path)=>{
  router.push(path)
}






const miniMenu = computed(()=>{
  return navigations.map((v)=>({
    index:v.index,
    label:v.label,
    path:v.path,
    icon:v.icon,
  }))
})

const panelMenu = computed(()=>{
  let index = navigations.findIndex((v=>v.path === menuPath.value))
  return (index === -1)? navigations[0].children : navigations[index].children
})

const menuName = computed(()=>{
  if(menuPath.value === '/hrm') return t('sidebar.hrm')
  else if (menuPath.value === '/lms') return t('sidebar.lms')
  else if (menuPath.value === '/admin') return t('sidebar.admin')
  else if (menuPath.value === '/chat') return t('sidebar.chat')
  else if (menuPath.value === '/docflow') return t('sidebar.docflow')
  else return t('content.checking')
})



const isComboxMenu =(path)=>{
  if(route.path.includes(path)){
    menuPath.value = path
  }
  return route.path.includes(path)
}

const isCurrentPath = (path)=>{
  return route.path===path
}

const pushFirstMenu = (path)=>{
  let index = navigations.findIndex((v=>v.path === path))
  router.push(navigations[index].children[0].path)
}

const accountFullName = computed(()=>{
  return store.account? `${store.account?.last_name} ${store.account?.first_name}`
      : t('content.checking')
})

const accountRole = computed(()=>{
  return store.account? store.account.role?.name : t('content.checking')
})

const accountPhoto = computed(()=>{
  return store.account? store.account.photo : Utils.noAvailableImage
})



</script>

<template>
  <div class="sidebar-content">
    <div class="mini-content">
      
      <div class="logo-content cursor-pointer">
        <img src="/public/logo.svg" alt=" " class="object-center animation-logo" />
      </div>
      
      <template v-for="item in miniMenu" :key="item">
          <div
              :class="[isComboxMenu(item.path) && 'active-mini-content']"
              class="main-menu-item"
              @click="nextPanel(item.path)">
            <i :class="item.icon"></i>
          </div>
      </template>

    </div>
    <div class="panel-content bg-gradient--v2">

      <transition name="slide-right" mode="out-in">
        <div v-if="showPanel">

          <n-tooltip trigger="hover" :delay="900">
            <template #trigger>
              <div
                  @click="store.openRoleModal()"
                  class="w-full whitespace-nowrap overflow-hidden flex items-center gap-[2px] px-1 py-1 border border-[transparent]
          rounded-md  mb-5 cursor-pointer hover:shadow-sm transition-all hover:rounded-xl hover:border-blue-300 ">
                <n-avatar
                    round
                    size="small"
                    :src="accountPhoto"
                />
                <div class="flex flex-col w-[120px] pl-1">
                  <span class="leading-3 text-xs text-gray-800 truncate w-full">{{accountFullName}}</span>
                  <span class="text-xs font-medium leading-3 truncate">{{accountRole}}</span>
                </div>
                <n-icon size="20" class="text-blue-800">
                  <PeopleSwap20Regular/>
                </n-icon>

              </div>
            </template>
            {{$t('account.changeAccount')}}
          </n-tooltip>


          <span class="text-sm block text-gray-600 truncate font-semibold pl-4 mb-3">{{menuName}}</span>
          <template v-for="item in panelMenu" :key="item">

            <template v-if="item?.children && item.children.length>0">
              <div class="panel-item-multiple">
                  <div class="panel-header" @click="controlCollapse">
                    <div class="item-icon">
                      <i :class="item.icon"></i>
                    </div>
                    <div class="item-title">
                      <span>{{item.label}}</span>
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
                      <div class="item-title">{{subMenu.label}}</div>
                    </div>

                  </div>
              </div>
            </template>







            <template v-else>
              <div
                  @click="onChangePath(item.path)"
                  class="panel-item-single"
                  :class="[isCurrentPath(item.path) && 'active-panel-item-single']"
              >
                <div class="item-icon">
                  <i :class="item.icon"></i>
                </div>
                <div class="item-title">
                  <span>{{item.label}}</span>
                </div>
              </div>
            </template>


          </template>
        </div>
      </transition>
    </div>


    <div @click="onClick" class="control-btn">
      <i class='bx bx-chevrons-left'></i>
    </div>
  </div>
</template>

<style scoped>

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
.slide-right-leave-to{
  transform: translateX(20px);
  opacity: 0;
}
</style>