<script setup>
import validationRules from "@/utils/validationRules.js";
import {CloudLink16Regular} from "@vicons/fluent"
import {useUniversityStore} from "@/store/modules/index.js";
import Utils from "@/utils/Utils.js"

const store = useUniversityStore()
const formRef = ref(null)
const inputFileRef = ref(null)

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error) {
      const formData = new FormData()
      formData.append('uuid', store.uuid)
      formData.append('university_id', store.payload.university_id)
      formData.append('speciality_id', store.payload.speciality_id)
      formData.append('from_date', Utils.timeToZone(store.payload.from_date))
      formData.append('to_date', Utils.timeToZone(store.payload.to_date))

      store.saveLoading = true
      if (store.visibleType) {
        formData.append('file', store.payload.file ?? '')
        store._create(formData)
      } else {
        formData.append('file', store.payload.file?.size? store.payload.file : '')
        store._update(formData)
      }
    }
  })
}

const onUpload = async (v)=>{
  store.payload.file = v.target.files[0]
}
const onFile = (v)=>{
  inputFileRef.value.click()
}


onMounted(()=>{
  if(store.universityList.length === 0){
    store._getUniversityList()
  }
  if(store.specialityList.length === 0){
    store._getSpeciality()
  }
})


</script>

<template>
  <div style="height:calc(100vh - 120px)" class="overflow-y-auto">
    <n-form
        ref="formRef"
        :rules="validationRules.universityPage"
        :model="store.payload"
    >
      <n-form-item :label="$t(`universityPage.form.university_id`)" path="university_id">
        <n-select
            v-model:value="store.payload.university_id"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="store.universityList"
            label-field="name"
            value-field="id"
            :loading="store.universityLoading"
        />
      </n-form-item>
      <n-form-item :label="$t(`universityPage.form.speciality_id`)" path="speciality_id">
        <n-select
            v-model:value="store.payload.speciality_id"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="store.specialityList"
            label-field="name"
            value-field="id"
            :loading="store.specialityLoading"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`universityPage.form.from_date`)"
          path="from_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.from_date"
            type="date"
            :placeholder="$t(`createWorkerPage.form.from_date`)"
        />
      </n-form-item>
      <n-form-item
          :label="$t(`universityPage.form.to_date`)"
          path="to_date">
        <n-date-picker
            class="w-full"
            v-model:value="store.payload.to_date"
            type="date"
            :placeholder="$t(`createWorkerPage.form.from_date`)"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.file`)" path="file">
        <n-button @click="onFile" style="width: 100%">
          <template #icon>
            <CloudLink16Regular/>
          </template>
          {{store.payload.file?.name? store.payload.file?.size? store.payload.file?.name :  Utils.fileNameFromUrl(store.payload.file?.name) : $t('universityPage.form.file')}}
        </n-button>
        <input @change="onUpload" type="file" v-show="false" ref="inputFileRef" />
      </n-form-item>
    </n-form>

  </div>
  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button
        @click="onSubmit"
        :loading="store.saveLoading"
        type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>


</template>

<style scoped>

</style>