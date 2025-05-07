<script setup>
import {ArrowDownload16Filled, AddCircle28Regular, CloudArrowUp24Regular} from "@vicons/fluent"
import {useWorkerProfileStore} from "@/store/modules/index.js"
import { v4 as uuidv4 } from 'uuid';
import Utils from "@/utils/Utils.js"
import i18n from "@/i18n/index.js"
import {useAppSetting} from "@/utils/index.js"
const {t} = i18n.global
const inputFileRef = ref(null)
const selectedId = ref(null)
const store = useWorkerProfileStore()

const onAdd = ()=>{
  store.passportList.push({
    id:uuidv4(),
    serial_number:null,
    address:null,
    from_date:null,
    to_date:null,
    file:null,
    exist:false,
  })
}

const onDelete = (v)=>{
  if(v.exist){
    store._deletePassport(v.id)
  }else{
    store.passportList =  store.passportList.filter(x=>x.id !== v.id)
  }
}

const savePassport = (v)=>{
  const data = store.passportList.filter(x=>x.id === v.id)[0]

  if(data.serial_number && data.from_date && data.to_date && data.address){
    const formData = new FormData()
    formData.append('worker_id', store.workerId)
    formData.append('serial_number', data.serial_number)
    formData.append('from_date', Utils.timeToZone(data.from_date))
    formData.append('to_date', Utils.timeToZone(data.to_date))
    formData.append('address', data.address)
    formData.append('file',data.file?.size? data.file : null)


    if(data.exist){
      //   update
      store._updatePassport(formData, v.id)
    }
    else{
      //   create
      store._storePassport(formData)
    }
  }else{
    $Toast.warning(t('message.warning-data'))
  }



}

const onFile = (v)=>{
  selectedId.value = v.id
  inputFileRef.value.click()
}

const onUpload = async (v)=>{
  console.log(v.target.files[0])
  store.passportList.filter(x=>x.id === selectedId.value)[0].file = v.target.files[0]
}

const visibleAddBtn = computed(()=>{
   return (store.passportList.filter(v=>!v.exist).length===0 && store.passportList.length<3)
})

const onDownload = (v)=>{
  window.open(v.file.name, '_blank');

}

</script>

<template>
  <n-spin :show="store.passportLoading">
    <div class="grid grid-cols-12 mb-16 mt-16 gap-x-4 border border-dashed border-surface-line p-2 rounded-lg">
      <div class="col-span-12 mb-4">
        <p class="text-textColor0 font-medium">{{$t(`createWorkerPage.form.passportTitle`)}}</p>
      </div>

      <template v-for="(item, idx) in store.passportList" :key="idx">
        <div class="col-span-12 md:col-span-6 flex flex-col">
          <span class="text-xs text-gray-500">{{$t(`createWorkerPage.form.serial_number`)}}</span>
          <div class="flex flex-col md:flex-row  gap-2">
            <n-form-item
                class="w-full md:w-[200px]"
                :show-label="false"
                :label="$t(`createWorkerPage.form.serial_number`)"
                path="serial_number">
              <n-input
                  class="w-full"
                  type="text"
                  v-mask="`AA ######`"
                  :placeholder="$t(`createWorkerPage.form.serial_number`)"
                  v-model:value="item.serial_number"
              />
            </n-form-item>
            <n-form-item
                class="w-full md:w-[calc(100%-200px)]"
                :show-label="false"
                path="file">
              <n-button
                  style="width: 100%"
                  @click="onFile(item)"
                  class="w-full"
                  ghost
              >
                <span class="line-clamp-1">
                  {{item.file?.name? item.file?.size? item.file?.name :  Utils.fileNameFromUrl(item.file?.name) : $t('universityPage.form.file')}}
                </span>

                <template #icon>
                  <CloudArrowUp24Regular/>
                </template>
              </n-button>
            </n-form-item>
          </div>
          <span class="text-xs text-gray-500 mt-2">{{$t(`createWorkerPage.form.passport_address`)}}</span>
          <n-form-item
              :show-label="false"
              :label="$t(`createWorkerPage.form.passport_address`)"
              path="address">
            <n-input
                class="w-full"
                type="text"
                :placeholder="$t(`createWorkerPage.form.passport_address`)"
                v-model:value="item.address"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-4 flex flex-col">
          <span class="text-xs text-gray-500">{{$t(`createWorkerPage.form.from_date`)}}</span>
          <n-form-item
              :show-label="false"
              path="from_date">
            <n-date-picker
                class="w-full"
                v-model:value="item.from_date"
                type="date"
                :placeholder="$t(`createWorkerPage.form.from_date`)"
                :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
          <span class="text-xs text-gray-500 mt-2">{{$t(`createWorkerPage.form.to_date`)}}</span>
          <n-form-item
              :show-label="false"
              path="to_date">
            <n-date-picker
                class="w-full"
                v-model:value="item.to_date"
                type="date"
                :placeholder="$t(`createWorkerPage.form.to_date`)"
                :format="useAppSetting.datePicketFormat"
            />
          </n-form-item>
        </div>
        <div class="col-span-12 md:col-span-2 flex flex-col gap-2 pt-4">
          <n-button
              @click="savePassport(item)"
              secondary
              style="width: 100%"
              type="info"
          >{{$t(`content.save`)}}
          </n-button>
          <n-button
              secondary
              type="error"
              style="width: 100%"
              @click="onDelete(item)"
          >
            {{$t(`content.delete`)}}</n-button>
          <n-button
              v-if="item.exist && !Boolean(item.file?.size) && item.file?.name"
              @click="onDownload(item)"
              secondary
              type="success"
              style="width: 100%"
          >
            <template #icon>
              <ArrowDownload16Filled/>
            </template>
            {{$t(`content.download`)}}</n-button>

        </div>
        <div class="col-span-12 border-t border-surface-line border-dashed mb-10"></div>
      </template>
      <div v-if="store.passportList.length === 0" class="col-span-12 justify-center flex">
        <span class="text-gray-200">{{$t('workerProfile.personal.no-passport')}}</span>
      </div>


      <div class="flex justify-center col-span-12 p-2">
        <input @change="onUpload" type="file" accept=".pdf" v-show="false" ref="inputFileRef" />
        <n-button
            v-if="visibleAddBtn"
            round
            @click="onAdd"
        >
          <template #icon>
            <AddCircle28Regular/>
          </template>
          {{$t(`content.add`)}}</n-button>
      </div>

    </div>
  </n-spin>

</template>

<style scoped>

</style>