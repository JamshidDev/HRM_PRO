<script setup>
import {useHolidayStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {Delete16Regular} from "@vicons/fluent"
import {NIcon} from "naive-ui"
import i18n from "@/i18n/index.js"
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const {t} = i18n.global

const store = useHolidayStore()

const showDropdown = ref(false)
const x = ref(0)
const y = ref(0)
const options = [
  {
    icon: renderIcon(Delete16Regular),
    label:t('content.delete'),
    key: "delete"
  },
]

function renderIcon(icon) {
  return () => {
    return h(NIcon, null, {
      default: () => h(icon)
    })
  }
}

const handleContextMenu=(e, v)=> {
  store.elementId = v.id
  e.preventDefault()
  showDropdown.value = false;
  nextTick().then(() => {
    showDropdown.value = true;
    x.value = e.clientX;
    y.value = e.clientY;
  });
}
const onClickOutside =()=> {
  showDropdown.value = false;
}

const handleSelect =(key)=>{
  showDropdown.value = false;
  if(options[0].key === key){
    store._delete()
  }
}




const onEdit = (v)=>{
  if(!accStore.checkAction(accStore.pn.holidaysWrite)) return
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.type = v.type?.id
  store.payload.holiday_date = new Date(v.holiday_date).getTime()
  store.visible = true
}

const onChangeMonth = (v)=>{
  if(!accStore.checkAction(accStore.pn.holidaysRead)) return
  store.params.month = v.month
  store.params.year = v.year
  store._index()
}

const changeValue = (v)=>{
  if(!accStore.checkAction(accStore.pn.holidaysWrite)) return
  store.resetForm()
  store.payload.holiday_date = v
  store.visibleType = true
  store.visible = true
}

const filterHolidayByDate = (v)=>{
  return store.list.filter((x)=>x?.holiday_date === v)
}



const typeClass = (id)=>{
  if(id === 1) return 'bg-teal-100 border-teal-300'
  else return  'bg-yellow-100 border-yellow-300'
}
</script>

<template>
  <n-spin :show="store.loading">
    <n-calendar
        class="mt-10 w-full min-h-[720px]! h-auto! bg-white"
        v-model:value="store.currentDate"
        @panel-change="onChangeMonth"
        @update:value="changeValue"
    >
      <template #header="{ year, month, date}">
        <div>{{ year }}, {{Utils.getMonthNameById(month)}}</div>
      </template>


      <template #default="{ year, month, date }">
        <div v-for="(item,index) in filterHolidayByDate(Utils.timeOnlyDate(`${year}-${month}-${date}`))" :key="index">
          <p
              @contextmenu="handleContextMenu($event, item)"
              @click.stop="onEdit(item)"
              :class="typeClass(item.type?.id)"
              class="leading-4 p-1 rounded-lg mb-1 border-b text-xs"
          >{{item.name}}</p>
        </div>
      </template>
    </n-calendar>
    <n-dropdown
        placement="bottom-start"
        trigger="manual"
        :x="x"
        :y="y"
        :options="options"
        :show="showDropdown"
        :on-clickoutside="onClickOutside"
        @select="handleSelect"
    />
  </n-spin>

</template>
