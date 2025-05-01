<script setup>
import {NoDataPicture} from "@/components/index.js"
import {useDocumentArchiveStore} from "@/store/modules/index.js"
import {CalendarRtl16Regular,
  CommentMultiple20Regular,Eye16Regular, ArrowCircleDown12Regular,
  Flag28Regular, CalendarStar20Regular} from "@vicons/fluent"
import Utils from "@/utils/Utils.js"

const store = useDocumentArchiveStore()

const statusData = (id)=>{
  return store.visibleTypes.filter(v=>v.id === id)?.[0]
}

const downloadFile = (url)=>{
  window.open(url, '_blank')
}


</script>

<template>
  <n-spin :show="store.loading">
    <div class="w-full"  v-if="store.list.length>0">
      <template v-for="(item, idx) in store.list" :key="idx">
        <div class="w-full max-w-[1200px] mx-auto
         flex flex-col md:flex-row p-4 border border-gray-200 mb-2 cursor-pointer
          rounded-lg bg-surface-section hover:shadow-sm transition-all">
          <div
              class="flex flex-col" style="width: calc(100% - 80px)">
            <div class="flex items-start mb-2">
              <n-icon size="18" class="mr-1 text-secondary">
                <CalendarStar20Regular/>
              </n-icon>
              <span class="text-secondary">{{$t('documentArchive.form.title')}}:</span>
              <p class="font-medium ml-2 line-clamp-2">{{item.title}}</p>
            </div>

            <div class="flex items-start mb-2">
              <n-icon size="18" class="mr-1 text-secondary">
                <Flag28Regular/>
              </n-icon>
              <span class="text-secondary">{{$t('documentArchive.form.type')}}:</span>
              <span class="font-medium ml-2 text-warning">{{item.type?.name}}</span>
            </div>


<!--            <div class="flex items-center">-->
<!--              <n-icon size="18" class="mr-1 text-secondary">-->
<!--                <Eye16Regular/>-->
<!--              </n-icon>-->
<!--              <span class="text-secondary">{{$t('documentArchive.form.visibility_type')}}:</span>-->
<!--              <span class="font-medium ml-2 text-primary">{{statusData(item.visibility_type)?.name}}</span>-->
<!--            </div>-->


            <div class="flex items-start mb-2">
              <n-icon size="18" class="mr-1 text-secondary">
                <CommentMultiple20Regular/>
              </n-icon>
              <span class="text-secondary ">{{$t('documentArchive.form.description')}}:</span>
              <p class="font-medium ml-2 line-clamp-2">{{item?.description}}</p>
            </div>


            <div class="flex items-start mb-2">
              <n-icon size="18" class="mr-1 text-secondary">
                <CalendarRtl16Regular/>
              </n-icon>
              <span class="text-secondary">{{$t('content.date')}}:</span>
              <span class="font-medium ml-2">{{Utils.timeOnlyDate(item.document_date)}}</span>
            </div>

          </div>


          <div class="flex flex-col w-full md:w-[80px]">
            <n-icon size="42" class="mx-auto mt-6 text-success"
            @click="downloadFile(item.file)"
            >
              <ArrowCircleDown12Regular/>
            </n-icon>
            <span
                class="text-center text-success"
                @click="downloadFile(item.file)"
            >{{$t('content.download')}}</span>
          </div>

         </div>
      </template>
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>

<style scoped>

</style>