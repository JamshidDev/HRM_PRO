<script setup>
import {NoDataPicture, UIBadge, UIMenuButton, UIPagination, UIStatus, UIUser} from "@/components/index.js"
import {useExpiredHealthStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"

const store = useExpiredHealthStore()




const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.marker.coords = [v.long, v.lat]
  store.payload.marker.name = v.name
  store.payload.region_id = v.region.id
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelectEv = (v)=>{
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
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
          <th class="min-w-[100px]">{{$t('confirmationPage.table.worker')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('medPage.form.status')}}</th>
          <th class="min-w-[100px] w-[200px]">{{$t('date.day')}}</th>
          <th class="min-w-[100px]">{{$t('medPage.form.organization')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('medPage.form.from')}}</th>
          <th class="min-w-[90px] w-[90px]">{{$t('medPage.form.to')}}</th>
          <th class="min-w-[200px] w-[200px]">{{$t('medPage.form.comment')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div>
              <UIUser
                  :short="false"
                  :data="{
                    photo:item?.worker.photo,
                    firstName:item?.worker.first_name,
                    middleName:item?.worker.middle_name,
                    lastName:item?.worker.last_name,
                    position:item?.position,
                  }"
              />
            </div>
          </td>
          <td>
            <div>

              <UIStatus :status="{
                name:item.status.name,
                id:item.status.id === 1? 6 : 5,
              }" />
            </div>
          </td>
          <td>
            <div>
              <UIBadge
                  :show-icon="false"
                  :label="Math.abs(item.days) + ' ' + $t('date.day')"
                  :type="item.days<0? Utils.colorTypes.error:Utils.colorTypes.success"
              />
            </div>
          </td>
          <td>{{item.organization.name}}</td>
          <td><UIBadge :show-icon="false" :type="Utils.colorTypes.dark" :label="Utils.timeOnlyDate(item.from)" />
          </td>
          <td>
            <UIBadge :show-icon="false" :type="Utils.colorTypes.dark" :label="Utils.timeOnlyDate(item.to)" />
          </td>
          <td>{{item.comment}}</td>

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