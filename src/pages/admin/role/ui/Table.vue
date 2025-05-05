<script setup>
import {NoDataPicture, UIMenuButton, UIBadge, UIPagination} from "@/components/index.js"
import {useUserRoleStore} from "@/store/modules/index.js"
import {RibbonStar24Filled} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

const store = useUserRoleStore()




const onEdit = (v)=>{
  store.visibleType = false
  store.elementId = v.id
  store.payload.name = v.name
  store.payload.permissions = v.permissions.map(x=>x.id)
  store.visible = true
}

const onDelete = (v)=>{
  store.elementId = v.id
  store._delete()
}

const onSelect = (v)=>{
  if(v.key === Utils.ActionTypes.edit){
    onEdit(v.data)
  }else if(v.key === Utils.ActionTypes.delete){
    onDelete(v.data)
  }
}

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
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
          <th class="min-w-[200px]">{{$t('content.name')}}</th>
          <th class="min-w-[40px] w-[40px]"></th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <div class="inline-block">
              <UIBadge :label="item.name" :type="Utils.colorTypes.dark" >
                <template #icon>
                  <n-icon size="20">
                    <RibbonStar24Filled/>
                  </n-icon>
                </template>
              </UIBadge>
            </div>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                :show-edit="true"
                @selectEv="onSelect"
            />
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