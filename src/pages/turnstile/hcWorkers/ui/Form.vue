<script setup>
import validationRules from "@/utils/validationRules.js";
import {useComponentStore, useTurnstileHikCentralWorkerStore, useTurnstileTerminalUserStore} from "@/store/modules/index.js";
import {UISelect, NoDataIllustration, UINSelect} from "@/components/index.js"
import {Checkmark16Filled, AddCircle16Filled, AddCircle28Regular} from "@vicons/fluent"
import {UICropper} from "@/components/index.js";
import checkWorkerSelect from '@/pages/lms/Teacher/ui/checkWorkerSelect.vue'
import {useAppSetting} from "@/utils/index.js"

const formRef = ref(null)
const store = useTurnstileHikCentralWorkerStore()
const componentStore = useComponentStore()
const terminalUserStore = useTurnstileTerminalUserStore()

const onSubmit = () => {
  formRef.value?.validate((error) => {
    if (!error) {
      store.saveLoading = true
      if (store.visibleType) {
        store._add_worker()
      }
    }
  })
}

const changeAccessLevelOrg = (v) => {
  store.payload.level_org_id = v
  store.payload.access_level_id = null
  if (v[0]?.id) {
    store._access_levels()
  }
}

const resetWorkerId = ()=>{
  store.payload.worker_id = null
  store.payload.search_worker_id = null
  store.payload.photo_index = null
  store.photos = []
}

const changeWorkerOrg = (v) => {
  store.payload.worker_org_id = v
  store.payload.worker_id = null
  store.photos = []
  store.payload.photo_index = null
  componentStore.workerList = []
  if (v[0]?.id) {
    componentStore.workerParams.organization_id = v[0]?.id
    componentStore._workers()
  }
}

const onChangeSearchWorker = (_, obj) => {
  clearPhoto()
  if (obj) {
    store.payload.worker_id = obj.worker.id
    store._worker_photos(obj.worker.id)
  } else {
    store.payload.worker_id = null
  }
}

const clearPhoto = ()=>{
  store.photos = []
  store.payload.photo_index = null
}

const onChangeWorker = (v) => {

  store.photos = []
  store.payload.photo_index = null
  if (v) {
    store._worker_photos()
  }
}

const workerRenderLabel = (option) => {
  return [
    h('div', {class: 'flex flex-col'}, [
      h('div', {class: 'text-xs font-medium text-gray-500'}, option.name),
      h('div', {class: 'text-xs text-primary'}, option.position),
    ])
  ];
}

const workerRenderValue = ({option}) => {
  return [
    h('div', {class: 'flex flex-col'}, [
      h('div', {class: 'text-sm font-medium text-gray-500'}, option.name),
    ])
  ];
}

const toggleImage = (v) => {
  if (store.payload.photo_index === v) {
    store.payload.photo_id = null
    store.payload.photo = null
    store.payload.photo_index = null
  } else {
    if (store.photos[v]?.id) {
      store.payload.photo_id = store.photos[v]?.id
      store.payload.photo = null
    } else {
      store.payload.photo = store.photos[v].photo
      store.payload.photo_id = null
    }
    store.payload.photo_index = v
  }
}

const cropperRef = ref(null)

const openCropper = () => {
  cropperRef.value.openFile()
}

const onResult = (v) => {
  store.photos.push({
    photo: v.imgUrl
  })
}

const openAddUserForm = () =>{
  terminalUserStore.resetUserForm()
  store.userVisible = true
}

let timer = null
const onSearch = (v)=>{
  if(v?.toString().length === 17){
    clearTimeout(timer)
    timer = setTimeout(()=>{
      store.freeWorkerList = []
      store.payload.worker_id = null
      clearPhoto()
      let pin = v.split('-').join("")
      store._searchWorkerByPin(pin)
    },600)
  }
}

onMounted(() => {
  componentStore.structureParams.search = null
  componentStore.workerParams.search = null
  if (componentStore.structureList.length === 0) {
    componentStore._structures()
  }
})

</script>


<template>
  <n-spin :show="false">
    <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
      <n-form
          ref="formRef"
          :model="store.payload"
          :rules="validationRules.common"
          class="flex flex-col"
      >

        <n-radio-group
            class="mx-auto mb-3"
            @update:value="resetWorkerId"
            v-model:value="store.payload.isWorker"
        >
          <n-radio-button :value="1">
            {{$t('turnstile.terminalUser.companyWorker')}}
          </n-radio-button>
          <n-radio-button :value="0">
            {{$t('turnstile.terminalUser.notCompanyWorker')}}
          </n-radio-button>
        </n-radio-group>

        
        <div class="p-1 rounded-sm border border-dashed mb-1 border-surface-line">
          <template v-if="store.payload.isWorker" >
            <n-form-item :label="$t(`content.organization`)" path="worker_org_id" rule-path="requiredMultiSelectField">
              <UISelect
                  :options="componentStore.structureList"
                  :modelV="store.payload.worker_org_id"
                  @defaultValue="changeWorkerOrg"
                  @updateModel="changeWorkerOrg"
                  :checkedVal="store.structureCheck2"
                  @updateCheck="(v)=>store.structureCheck2=v"
                  :loading="componentStore.structureLoading"
                  v-model:search="componentStore.structureParams.search"
                  @onSearch="componentStore._structures"
                  :multiple="false"
              />
            </n-form-item>
            <n-form-item :label="$t(`content.staff`)" path="worker_id" rule-path="requiredNumberField">
              <n-select
                  :disabled="!store.payload.worker_org_id.length"
                  v-model:value="store.payload.worker_wrapper_id"
                  filterable
                  :options="componentStore.workerList"
                  label-field="name"
                  value-field="id"
                  :render-label="workerRenderLabel"
                  :render-tag="workerRenderValue"
                  :loading="componentStore.workerLoading"
                  @scroll="componentStore.onScrollWorker"
                  @search="componentStore.onSearchWorker"
                  :reset-menu-on-options-change="false"
                  @update:value="onChangeSearchWorker"
              />
            </n-form-item>
          </template>
          <n-form-item v-else :label="$t(`content.staff`)" path="worker_id" rule-path="requiredNumberField">
            <UINSelect
                clearable
                v-model:value="store.payload.worker_id"
                @update:value="onChangeWorker"
                value-field="id"
                label-field="name"
                :options="store.freeWorkerList"
                :loading="store.freeWorkerLoading"
                :query="store.pin"
                pin-select
                @onSearch="onSearch"

            />
          </n-form-item>
          <p v-if="!store.payload.isWorker" @click="openAddUserForm" class="text-xs text-primary flex gap-1 items-center cursor-pointer justify-end"> <n-icon size="16"><AddCircle28Regular/></n-icon>  {{$t('turnstile.terminalUser.addBtn')}}</p>

        </div>
        <n-form-item :label="$t(`content.deadline`)" :feedback="$t('turnstile.terminalUser.deadline_feedback')">
          <n-date-picker
              class="w-full"
              v-model:value="store.payload.end_time"
              type="date"
              update-value-on-close
              :actions="null"
              clearable
              :format="useAppSetting.datePicketFormat"
          />
        </n-form-item>
        <n-form-item :label="$t(`content.photo`)" path="photo_index" rule-path="requiredNumberField">
          <div class="h-[250px] max-h-[250px] p-2 border border-surface-line border-dashed w-full rounded-md relative">
            <n-spin class="h-full w-full overflow-y-auto pr-1" :show="store.photosLoading">
              <NoDataIllustration v-if="!store.photos.length" class="w-full h-full"/>
              <div v-else
                   class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] grid-rows-[repeat(auto-fill,minmax(120px,1fr))] gap-[10px]">
                <div v-for="(photo,idx) in store.photos" :key="idx" class="rounded-md overflow-hidden relative"
                     @click="toggleImage(idx)" style="box-shadow: rgba(0, 0, 0, 0.1) 0 4px 12px;">
                  <img class="w-full h-full object-cover transition-all hover:scale-[1.1] cursor-pointer"
                       alt="worker-photo" :src="photo.photo"/>
                  <n-icon-wrapper class="absolute top-1 right-1" v-if="store.payload.photo_index===idx" :size="24"
                                  :border-radius="10">
                    <n-icon :size="18" :component="Checkmark16Filled"/>
                  </n-icon-wrapper>
                </div>
              </div>
            </n-spin>
            <div class="absolute bottom-[10px] right-[10px]">
              <n-button :disabled="typeof store.payload.photo_index === 'number'" @click="openCropper" type="primary"
                        size="tiny">
                {{ $t('content.upload') }}
                <template #icon>
                  <AddCircle16Filled/>
                </template>
              </n-button>
            </div>
            <UICropper ref="cropperRef" @on-result="onResult"/>
          </div>
        </n-form-item>
        <div class="p-1 rounded-sm border border-dashed mb-1 border-surface-line">
          <n-form-item :label="$t(`content.organization`)" path="level_org_id" rule-path="requiredMultiSelectField">
            <UISelect
                :options="componentStore.structureList"
                :modelV="store.payload.level_org_id"
                @defaultValue="changeAccessLevelOrg"
                @updateModel="changeAccessLevelOrg"
                :checkedVal="store.structureCheck"
                @updateCheck="(v)=>store.structureCheck=v"
                :loading="componentStore.structureLoading"
                v-model:search="componentStore.structureParams.search"
                @onSearch="componentStore._structures"
                :multiple="false"
            />
          </n-form-item>

          <n-form-item :label="$t(`turnstile.hcWorkersPage.access_levels`)" path="access_level_ids"
                       rule-path="requiredMultiSelectField">
<!--            <n-select-->
<!--                :disabled="!store.payload.level_org_id.length"-->
<!--                v-model:value="store.payload.access_level_id"-->
<!--                filterable-->
<!--                :options="store.accessLevels"-->
<!--                label-field="name"-->
<!--                value-field="id"-->
<!--                :loading="store.accessLevelsLoading"-->
<!--            >-->
<!--            </n-select>-->
            <UINSelect
                multiple
                :disabled="!store.payload.level_org_id.length"
                v-model:value="store.payload.access_level_ids"
                :options="store.accessLevels"
                value-field="id"
                />
          </n-form-item>
        </div>
      </n-form>


    </div>
    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.visible = false" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button
          :loading="store.saveLoading"
          type="primary"
          @click="onSubmit">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-spin>


</template>
