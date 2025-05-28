<script setup>
import {UIStatus} from "@/components/index.js"
import {useUploadReportStore} from "@/store/modules/index.js"
import Utils from "@/utils/Utils.js"
import {Info24Regular} from "@vicons/fluent"

const store = useUploadReportStore()

const onDownload = (url)=>{
  window.open(url, "_blank")
}

const showComment = (v)=>{
    store.selectedId = store.selectedId===v.id? null:v.id
}

</script>

<template>
  <n-spin :show="store.loading">
    <div class="w-full overflow-y-auto h-[calc(100vh-490px)] mt-4">
      <n-table
          v-if="store.list.length>0"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
          <th class="min-w-[100px] !max-w-[400px]">{{$t('uploadReport.form.type')}} - <span class="text-xs bg-primary/10 px-1 rounded">#{{store.selectedTitle}}</span></th>
          <th class="w-[100px]">{{$t('content.status')}}</th>
          <th class="w-[80px]">{{$t('content.date')}}</th>
          <th class="min-w-[100px] w-[120px]">{{$t('uploadReport.form.file')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{idx + 1}}</span></td>
          <td>
            <div class="flex flex-col w-full">
              <div class="flex max-w-[400px]">
                <span class="text-sm font-medium">{{Utils.getMonthNameById(item.month)}} - {{item.year}}</span>
                <div class="truncate text-textColor3 !w-[calc(100%-120px)] ml-1 text-xs ">
                  {{item.comment}}
                </div>
                <n-button
                    @click="showComment(item)"
                    size="small"
                    class="ml-2"
                    v-if="item.comment" circle tertiary>
                  <template #icon>
                    <Info24Regular/>
                  </template>
                </n-button>
              </div>
              <div class="bg-warning/10 rounded max-w-[300px]">
                <n-collapse-transition class="p-1" :show="item.id === store.selectedId">
                  {{item.comment}}
                </n-collapse-transition>
              </div>

            </div>

          </td>
          <td>
            <UIStatus :status="item.status"></UIStatus>
          </td>
          <td>
            {{Utils.timeOnlyDate(item.created_at)}}
          </td>
          <td>
            <div v-if="item?.file" class="flex justify-center w-full">
              <n-button size="small" @click="onDownload(item.file)">{{$t('content.download')}}</n-button>
            </div>
          </td>
        </tr>
        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>
