<script setup>
import {NoDataPicture, UIPagination, UIMenuButton, UIUser, UIBadge} from "@/components/index.js"
import {useTelegramUserStore} from "@/store/modules/index.js"
import i18n from "@/i18n/index.js"
import Utils from "@/utils/Utils.js"

const {t} = i18n.global
const store = useTelegramUserStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}




const onSelect = (v)=>{
    store.elementId = v.data.id
    if(v.key === Utils.ActionTypes.edit){
      store.payload.user_id = v.data.id
      store.payload.devices = []
      store._edit()
      store.visibleType = false
      store.visible = true
    }else if(v.key === Utils.ActionTypes.delete){
      store._delete()
    }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-4"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('hcServer.form.name')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('hcServer.form.workers_count')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                v-if="item.worker"
                :short="false"
                :hide-tooltip="true"
                :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.id,
                  }"
            />
          </td>
          <td>
            <UIBadge :label="item.devices_count" :type="Utils.colorTypes.dark" />
          </td>
          <td>
            <UIMenuButton
                :show-edit="true"
                :data="item"
                @selectEv="onSelect"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          :page="store.params.page"
          :per_page="store.params.per_page"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>