<script setup>
import navigationData from "./data/navigation.js"
import {onMounted, ref} from "vue";

const panelPath = ref(null)
const path = ref(null)
import {useRouter, useRoute} from "vue-router";
const router = useRouter()
const routes = useRoute()

const selectRoot =(mainPath, v=null)=>{
  panelPath.value = v
  path.value = mainPath
  router.push(mainPath)
  saveRoot(mainPath,v)
}

const saveRoot = (path, panelPath)=>{
  localStorage.setItem("sidebarStore", JSON.stringify({path,panelPath}))
}

const rememberSidebar = ()=>{
  path.value = routes.path
  let store = localStorage.getItem('sidebarStore')?JSON.parse(localStorage.getItem('sidebarStore')) : null
  if(store){
    panelPath.value = store.panelPath
  }
}

watch(()=>routes.path,(newpPath, oldPath)=>{
  console.log(newpPath)
  path.value = newpPath
})

onMounted(()=>{
  rememberSidebar()
})

</script>

<template>
  <div class="sidebar__header">
    <div class="app__logo">
      <img src="/public/logo.png" alt="">
    </div>
    <div class="app__name">Market name</div>
  </div>

  <template v-for="(item, idx) in navigationData" :key="idx">

    <template v-if="item?.children?.length>0">
      <div class="multiple__item">
        <div class="list-item hover__item"
             @click="selectRoot(null, item.path)"
             :class="[panelPath === item.path && 'active__root']"
        >
          <div class="item__icon">
            <span :class="item.icon"></span>
          </div>
          <div class="item__label">
            <span>{{$t(item.label)}}</span>
            <span class="bx bx-chevron-down arrow__icon"></span>
          </div>
        </div>
        <div class="items__panel"  :style=" {height:panelPath ===item.path? (item.children.length*32 +2)+'px' : '0px'}">
          <div
              v-for="(panel,idx) in item.children"
              :key="idx"
              class="panel__item hover__item"
              :class="[path === panel.path && 'active__root']"
              @click="selectRoot(panel.path, item.path)"
          >
            <div class="item__icon">
              <span :class="panel.icon"></span>
            </div>
            <div class="item__label">
              <span>{{panel.label}}</span>
            </div>
          </div>
        </div>
      </div>
    </template>


    <template v-else>
      <div
          @click="selectRoot(item.path)"
          class="single__item hover__item"
          :class="[path === item.path && 'active__root']"
      >
        <div class="item__icon">
          <span :class="item.icon"></span>
        </div>
        <div class="item-label">
          <span>{{$t(item.label)}}</span>
          <span class="item-tooltip">{{$t('content.news')}}</span>
        </div>
      </div>
    </template>
  </template>
</template>
