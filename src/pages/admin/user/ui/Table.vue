<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMenuButton} from "@/components/index.js"
import {useUserStore, useAccountStore} from "@/store/modules/index.js"
import {ShieldLock20Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"
import {AppPaths, useAppSetting} from "@/utils/index.js"
import router from "@/router/index.js"
import {getActivePinia} from "pinia"

const store = useUserStore()
const accStore = useAccountStore()

const onSelect = (v)=>{
    if(v.key === Utils.ActionTypes.attachment){
      if(!accStore.checkAction(accStore.pn.usersWrite)) return
      store.elementId = v.data.uuid
      store._myRoles()
      store.visibleType = true
      store.visible = true
    }
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSuccessEv = (token)=>{
  localStorage.setItem(useAppSetting.tokenKey,token)
  accStore._index(()=>{
    getActivePinia().reset()
    router.push(AppPaths.Home)
  })
}
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-10"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.worker')}}</th>
          <th class="min-w-[60px] w-[100px]"></th>
          <th class="min-w-[200px] w-[300px]">{{$t('content.workplace')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.phone')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.phone,
                  }"
              />
            </div>
          </td>
          <td>
            <n-button
                @click="store._loginById(item.uuid, onSuccessEv)"
                :size="'small'"
                :loading="store.loginLoading"
            >{{$t('content.loginById')}}
              <template #icon>
                <ShieldLock20Regular/>
              </template>
            </n-button>
          </td>
          <td>{{item?.organization.name}}</td>
          <td>{{item?.phone}}</td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="false"
                :show-attachment="true"
                :show-delete="false"
                @selectEv="onSelect"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-show="store.totalItems>10"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>