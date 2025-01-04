<script setup>
import {CodeCircle20Regular, DismissCircle24Regular} from "@vicons/fluent"
import {NoDataPicture, UIStatus, UIPagination, UIUser} from "@/components/index.js"
import {useActionLogStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useActionLogStore()





const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._getAuthLog()
}

const openCode = (id)=>{
  store.authActiveCol =id
}
</script>

<template>
  <n-spin :show="store.authLoading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.authList.length>0">
      <n-table
          class="mt-10"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="w-[200px]">{{$t('actionLog.table.owner')}}</th>
          <th class="min-w-[200px] ">{{$t('actionLog.table.detail')}}</th>
          <th class="w-[160px]">{{$t('actionLog.table.loginAt')}}</th>
          <th class="w-[200px]">{{$t('actionLog.table.logoutAt')}}</th>
          <th class="w-[120px]">{{$t('actionLog.table.ip')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.authList" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :data="{
                  photo:item?.user?.photo,
                  lastName:item?.user?.last_name,
                  firstName:item?.user?.first_name,
                  middleName:item?.user?.middle_name,
                  position:item?.user?.phone
                }"
            />
          </td>
          <td>
            <div class="flex items-center justify-between">
               <span class="truncate w-full max-w-[400px] pb-1">
                 {{store.authActiveCol === item.id? ' ' : item}}
               </span>
              <n-icon v-if="store.authActiveCol === item.id" @click="openCode(null)" size="24" class="text-danger font-bold cursor-pointer">
                <DismissCircle24Regular/>
              </n-icon>
              <n-icon v-else @click="openCode(item.id)" size="24" class="text-primary font-bold cursor-pointer">
                <CodeCircle20Regular/>
              </n-icon>
            </div>

            <n-collapse-transition class="text-xs bg-dark text-white rounded-xl shadow w-full overflow-y-auto p-2" :show="store.authActiveCol === item.id">
              <pre>
                {{item}}
              </pre>
            </n-collapse-transition>
          </td>
          <td><div class="w-full text-center">{{Utils.timeWithMonth(item?.login_at)}}</div></td>
          <td><div class="w-full text-center text-sm">{{item?.logout_at? Utils.timeWithMonth(item?.logout_at) : ''}}</div></td>
          <td><div class="w-full text-center uppercase font-medium">{{item?.ip_address}}</div></td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.authTotalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.authList.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>