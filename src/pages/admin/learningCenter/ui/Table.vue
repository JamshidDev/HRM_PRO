<script setup>
import {NoDataPicture, UIActionButton, UIPagination, UIUser, UIMore} from "@/components/index.js"
import {useNationalityStore, useLearningCenterStore} from "@/store/modules/index.js"

const store = useLearningCenterStore()




const onEdit = (v)=>{
  console.log(v)
  store.payload.name = v.name
  store.payload.name_ru = v.name_ru
  store.payload.name_en = v.name_en

  // store.visibleType = false
  // store.elementId = v.id
  // store.payload.name = v.name
  // store.visible = true
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
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-5"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.nameUz')}}</th>
          <th class="min-w-[200px]">{{$t('content.nameRu')}}</th>
          <th class="min-w-[200px]">{{$t('content.nameEn')}}</th>
          <th class="min-w-[200px] !text-center">{{$t('content.users')}}</th>
          <th class="min-w-[90px] w-[90px] text-center!">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>{{item.name}}</td>
          <td>{{item.name_ru}}</td>
          <td>{{item.name_en}}</td>
          <td>
            <div class="flex justify-center">
              <UIMore :data="item.users">
                <template #content="{data}">
                  <UIUser
                      :data="{
                      photo:data.user.worker.photo,
                      lastName:data.user.worker.last_name,
                      firstName:data.user.worker.first_name,
                      middleName:data.user.worker.middle_name,
                      position:data.user.phone
                    }"
                  />
                </template>
              </UIMore>
            </div>
          </td>
          <td>
            <UIActionButton
                class="justify-center"
                :data="item"
                :visible-edit-btn="false"
                :loading-delete="item.id === store.elementId && store.deleteLoading"
                @on-delete="onDelete"
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