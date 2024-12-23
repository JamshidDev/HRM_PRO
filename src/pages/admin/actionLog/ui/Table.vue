<script setup>
import {CodeCircle20Regular, DismissCircle24Regular} from "@vicons/fluent"
import {NoDataPicture, UIStatus, UIPagination, UIUser} from "@/components/index.js"
import {useActionLogStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useActionLogStore()





const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._getActionLog()
}

const openCode = (id)=>{
  store.activeCol =id
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
          <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="w-[200px]">{{$t('actionLog.table.owner')}}</th>
          <th class="min-w-[200px] ">{{$t('actionLog.table.detail')}}</th>
          <th class="w-[200px] min-w-[200px]">{{$t('actionLog.table.status')}}</th>
          <th class="w-[120px]">{{$t('content.date')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :data="{
                  photo:item?.causer?.photo,
                  lastName:item?.causer?.last_name,
                  firstName:item?.causer?.first_name,
                  middleName:item?.causer?.middle_name,
                  position:item?.causer?.role?.name
                }"
            />
          </td>
          <td>
            <div class="flex items-center justify-between">
               <span class="truncate w-full max-w-[400px] pb-1">
                 {{store.activeCol === item.id? ' ' : item?.properties}}
               </span>
                <n-icon v-if="store.activeCol === item.id" @click="openCode(null)" size="24" class="text-danger font-bold cursor-pointer">
                  <DismissCircle24Regular/>
                </n-icon>
              <n-icon v-else @click="openCode(item.id)" size="24" class="text-primary font-bold cursor-pointer">
                <CodeCircle20Regular/>
              </n-icon>
            </div>

            <n-collapse-transition class="text-xs bg-dark text-white rounded-xl shadow p-2" :show="store.activeCol === item.id">
              <pre>
                {{item}}
              </pre>
            </n-collapse-transition>
          </td>
          <td><UIStatus
              :color="`success`"
              :text="$t(`actionLog.status.${item.description}`)"
          /></td>
          <td>
            <div class="w-full text-center">{{Utils.timeWithMonth(item?.created_at)}}</div>
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
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