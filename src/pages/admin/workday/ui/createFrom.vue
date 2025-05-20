<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useWorkdayStore, useComponentStore} from "@/store/modules/index.js";

const store = useWorkdayStore()
const componentStore = useComponentStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      store.saveLoading = true
      if(store.visibleType){
        store._create()
      }else{
        store._update()
      }
    }
  })
}

onMounted(()=>{
  componentStore._enumsAdmin()
  componentStore._scheduleList()
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.workdayPage"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`workdayPage.form.type`)" path="type">
        <n-select
            v-model:value="store.payload.type"
            filterable

            :options="componentStore.workDayTypes"
            label-field="name"
            value-field="id"
            :loading="componentStore.enumAdminLoading"
        />
      </n-form-item>

      <n-form-item :label="$t(`workdayPage.form.schedule_id`)" path="schedule_id">
        <n-select
            v-model:value="store.payload.schedule_id"
            filterable

            :options="componentStore.scheduleList"
            label-field="name"
            value-field="id"
            :loading="componentStore.scheduleLoading"
        />
      </n-form-item>

      <n-form-item :label="$t(`workdayPage.form.day_of_week`)" path="day_of_week">
        <n-input
            type="text"

            v-model:value="store.payload.day_of_week"
        />
      </n-form-item>
      <n-form-item :label="$t(`workdayPage.form.start_time`)" path="start_time">
        <n-time-picker
            class="w-full"
            v-model:value="store.payload.start_time"

        />
      </n-form-item>
      <n-form-item :label="$t(`workdayPage.form.end_time`)" path="end_time">
        <n-time-picker
            class="w-full"
            v-model:value="store.payload.end_time"

        />
      </n-form-item>

    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{$t('content.cancel')}}
      </n-button>
      <n-button
          @click="onSubmit"
          :loading="store.saveLoading"
          type="primary">
        {{$t('content.save')}}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped>

</style>