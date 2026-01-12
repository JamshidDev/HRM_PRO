<script setup>
import UIHelper from '@/utils/UIHelper.js'
import {useNotificationStore} from "@stores";
import {NAvatar, NIcon} from "naive-ui";
import Utils from "@utils/Utils.js";
import {Checkmark16Filled, DismissCircle20Filled} from "@vicons/fluent"
const store = useNotificationStore()

const userRoleParams = reactive({
  page: 1,
  per_page: 10,
  search: null,
})

const userRoleOptions = ref([])
const totalUserRolesCount = ref(0)
const userRoleOptionsLoading = ref(false)

const getUserRoleOptions = ()=>{
  userRoleOptionsLoading.value = true
  $ApiService.workerService
      ._userRole({
        params: {
          ...userRoleParams,
          organizations: store.payload.filter.organizations.map(i=>i.id).toString() || undefined,
          roles: store.payload.filter.roles.join(',') || undefined
        }
      })
      .then((res) => {
        userRoleOptions.value.push(...res.data.data.data.map(i=>{

          return {
            fullName: [i.worker.last_name, i.worker.first_name, i.worker.last_name].filter(Boolean).join(' '),
            photo: i.worker.photo,
            position: i?.current_organization?.name,
            id: i.id
          }
        }))
        totalUserRolesCount.value = res.data.data.total
      })
      .finally(() => {
        userRoleOptionsLoading.value = false
      })
}

const searchModel = ref(null)

const onCloseEv = (v) => {
  store.payload.userIds =  store.payload.userIds.filter((x) => x !== v.id)
}

const onScrollEv = (e) => {
  if (userRoleParams.per_page > userRoleOptions.value.length) return

  if (totalUserRolesCount.value === 0) return
  const currentTarget = e.currentTarget
  if (
      currentTarget.scrollTop + currentTarget.offsetHeight + 20 >= currentTarget.scrollHeight &&
      !userRoleOptionsLoading.value &&
      totalUserRolesCount.value > userRoleOptions.value.length
  ) {
    userRoleParams.page += 1
    getUserRoleOptions()
  }
}

let timer = null
const onSearchEv = () => {
  clearTimeout(timer)
  timer = setTimeout(() => {
    userRoleParams.search = searchModel.value
    userRoleParams.page = 1
    userRoleOptions.value = []
    getUserRoleOptions()
  }, 800)
}

onUnmounted(() => {
  clearTimeout(timer)
})

onMounted(()=>{
  getUserRoleOptions()
})

let userMap = {}

const onUpdateCheckAll = ()=>{
  console.log("what")
  store.payload.userIds = []
  store.payload.unCheck = []
  userMap = {}
}



const renderAvatarOption = ({ option }) => {
  const isItemSelected = store.payload.all ? !store.payload.unCheck.includes(option.id) : store.payload.userIds.includes(option.id)

  return h('div', {
    class: "flex items-center justify-between cursor-pointer transition-all hover:bg-info/20 rounded-lg",
  onClick: ()=>{

    if(store.payload.all){

      if(store.payload.unCheck.includes(option.id)){
        store.payload.unCheck = store.payload.unCheck.filter((x) => x !== option.id)

      }else{
        store.payload.unCheck.push(option.id)
      }
    }else{
      if(store.payload.userIds.includes(option.id)){
        store.payload.userIds =  store.payload.userIds.filter((x) => x !== option.id)
        delete userMap[option.id]
      }else{
        store.payload.userIds.push(option.id)
        userMap[option.id] = option
      }
    }
  }
      },
      [h(
          'div',
          {
            class: 'flex gap-2 my-1 items-center px-2'
          },
          [
            h(NAvatar, {
              class: 'flex-shrink-0',
              src: option.photo,
              'fallback-src': Utils.noAvailableImage,
              objectFit: 'cover'
            }),
            h('div', { class: 'flex flex-col' }, [
              h(
                  'div',
                  { class: 'text-xs font-medium text-gray-500 leading-[1.2]' },
                  option?.fullName
              ),
              h('div', { class: 'text-xs text-primary leading-[1.2]' }, option.position)
            ])
          ]
      ),
          ...(isItemSelected ? [h(Checkmark16Filled, {class: 'size-4 text-info'})] : [])
      ]
  )
}

watch(()=>store.payload.filter, ()=>{
  store.payload.userIds = []
  store.payload.all = false
  store.payload.unCheck = []
  userRoleOptions.value = []
  getUserRoleOptions()
}, {
  deep: true
})

const renderTag = ({option}) => {
  return [
    h(
        'span',
        {
          class: `w-full flex gap-2 items-center border border-transparent hover:border-surface-line rounded-lg group cursor-pointer px-1 py-[1px]`
        },
        [
          h('span', { class: 'line-clamp-1 flex-1' }, `${userMap[option.id].fullName}`),

          h(NIcon, {
            size: 18,
            class: 'text-danger/80 opacity-0 group-hover:opacity-100 flex-shrink-0',
            onClick: (e) => {
              e.stopPropagation()
              onCloseEv(option)
            }
          }, { default: () => h(DismissCircle20Filled) })
        ]
    )
  ]
}
</script>

<template>
  <div class="relative w-full">
    <n-select
        :placeholder="store.payload.all ? '' : $t('content.choose')"
        @scroll="onScrollEv"
        multiple
        :value="store.payload.userIds"
        :options="userRoleOptions"
        :loading="userRoleOptionsLoading"
        :render-option="renderAvatarOption"
        :render-tag="renderTag"
        value-field="id"
        :max-tag-count="1"
        :reset-menu-on-options-change="false"
        :virtual-scroll="true"
        :menu-props="{
        class: 'p-2'
      }"
    >
      <template #header>
        <div class="w-full flex">
          <n-input
              clearable
              v-model:value="searchModel"
              class="w-full skip-format"
              :placeholder="$t('content.search')"
              :on-keyup="onSearchEv"
              @paste="onSearchEv"
              @keydown.stop
              @clear="onSearchEv"
          />
        </div>
      </template>
      <template #action>
        <n-checkbox @update:checked="()=>onUpdateCheckAll()" v-model:checked="store.payload.all">
        <span class="text-secondary text-xs"
        >{{ $t('content.selectAll') }} - ({{ totalUserRolesCount }})</span
        >
        </n-checkbox>
      </template>
    </n-select>


      <div v-if="store.payload.all" class="flex items-center gap-2 absolute top-0 left-0 bottom-0 pl-4">
        <span class="text-[15px]">{{$t('content.allSelected')}}</span>
        <n-tag>+{{totalUserRolesCount-store.payload.unCheck.length}}</n-tag>
      </div>

  </div>

</template>
