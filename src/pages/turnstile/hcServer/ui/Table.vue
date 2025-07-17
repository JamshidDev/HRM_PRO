<script setup>
import {NoDataPicture,UIPagination, UIBadge} from "@/components/index.js"
import {useHcServerStore, useComponentStore, useAccountStore} from "@/store/modules/index.js"
import {ErrorCircle24Filled, ArrowCircleDown16Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

const store = useHcServerStore()
const compStore = useComponentStore()
const accStore = useAccountStore()

const onEdit = (v)=>{


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
  if(!accStore.checkAction(accStore.pn.hrVacationsWrite)) return
  if(Utils.ActionTypes.edit === v.key){
    onEdit(v.data)
  }else if(Utils.ActionTypes.delete === v.key){
    onDelete(v.data)
  }
}

const downloadTextFile =(texts, fileName = "InvalidPhotos.txt")=> {
  const blob = new Blob([texts], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);

  URL.revokeObjectURL(url)
}

onMounted(()=>{
  store._index()
})

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
          <th class="min-w-[100px] w-[120px]">{{$t('hcServer.form.exported_count')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('hcServer.form.status')}}</th>
          <th class="min-w-[40px] w-[40px]">{{$t('hcServer.form.error')}}</th>
          <th class="min-w-[100px] w-[100px]">{{$t('content.date')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td><span>{{item?.name}}</span></td>
          <td>
            <div>
              <UIBadge :type="Utils.colorTypes.info" :show-icon="false" :label="item?.workers_count"></UIBadge>
            </div>
          </td>
          <td>
            <div>
              <UIBadge :type="Utils.colorTypes.success" :show-icon="false" :label="item?.exported_count"></UIBadge>
            </div>
          </td>
          <td>{{item?.status}}</td>
          <td>
            <div class="flex justify-center">
              <template v-if="item?.errors">
                <n-popover trigger="hover">
                  <template #trigger>
                    <n-icon size="24" class="text-danger">
                      <ErrorCircle24Filled/>
                    </n-icon>
                  </template>
                  <div>
                    <div class="w-[200px] h-[300px] overflow-y-auto">
                      <div class="text-danger mb-5" v-for="(item, index) in item?.errors.toString().trim().split('...')">
                        <span v-if="item" class="mb-4 leading-[1.2] text-xs">{{(index+1)+". " + item}}</span>
                      </div>
                    </div>
                    <div>
                      <n-button
                          size="small"
                          @click="downloadTextFile(item?.errors.toString())"
                      ><span class="text-xs">{{$t('hcServer.form.asFile')}}</span>
                      </n-button>
                    </div>
                  </div>


                </n-popover>

              </template>
            </div>


          </td>
          <td>{{Utils.timeOnlyDate(item?.created_at)}}</td>
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