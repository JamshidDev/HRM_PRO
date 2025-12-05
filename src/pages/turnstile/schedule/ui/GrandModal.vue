<script setup>
import {UIModal} from "@/components/index.js"
import {useScheduleTableStore} from "@/store/modules/index.js"
import validationRules from "@/utils/validationRules.js"
import Utils from "@/utils/Utils.js"

const formRef = ref(null)
const store = useScheduleTableStore()

const onSubmit = ()=>{
  formRef.value?.validate((error)=>{
    if(!error){
      let data = null
      if(store.grandPayload.is_turnstile){
         data = {
          is_turnstile:true,
          start_minute:store.grandPayload.start_minute || undefined,
          end_minute:store.grandPayload.end_minute || undefined,
        }
      }else{
        data = {
          is_turnstile:false,
        }
      }
      store._updateTurnstile(data)

    }
  })
}


const onChange = ()=>{
  store.grandPayload.is_turnstile = !store.grandPayload.grandToReport
}

const onChangeGrand = ()=>{
  store.grandPayload.grandToReport = !store.grandPayload.is_turnstile
}

</script>

<template>
  <UIModal
      :width="400"
      v-model:visible="store.grandVisible"
      :title="$t('shiftType.form.turnstileSetting')"
  >
    <n-form
        ref="formRef"
        :rules="validationRules.common"
        :model="store.grandPayload"
        class="grid grid-cols-12 gap-x-4 pt-4"
    >
      <div class="col-span-12 flex justify-between mb-4 items-center">
        <span class="text-secondary">{{$t(`shiftType.form.addGrand`)}}</span>
        <n-switch @change="onChangeGrand" size="large" v-model:value="store.grandPayload.is_turnstile" />
      </div>
      <n-collapse-transition class="col-span-12" :show="store.grandPayload.is_turnstile">
        <div class="col-span-12 p-2 bg-warning/10 rounded-lg leading-[1.3] text-secondary mb-4">
          {{$t('shiftType.form.groupCount')}}
        </div>
        <n-form-item class="col-span-12" :label="$t(`shiftType.form.startWorkTime`)" path="start_minute" :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-input-number
              :max="300"
              :min="0"
              :step="1"
              :show-button="false"
              class="w-full"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.grandPayload.start_minute"
          />
        </n-form-item>
        <n-form-item class="col-span-12" :label="$t(`shiftType.form.endWorkTime`)" path="end_minute" :rule-path="validationRules.rulesNames.requiredNumberField">
          <n-input-number
              :max="300"
              :min="0"
              :step="1"
              :show-button="false"
              class="w-full"
              type="text"
              :allow-input="Utils.onlyAllowNumber"
              v-model:value="store.grandPayload.end_minute"
          />
        </n-form-item>
        <n-form-item class="col-span-12" :label="$t(`content.comment`)" >
          <n-input
              :rows="2"
              type="textarea"
              v-model:value="store.grandPayload.comment"
          />
        </n-form-item>


      </n-collapse-transition>


      <div class="col-span-12 flex justify-between mb-4 items-center">
        <span class="text-secondary">{{$t(`shiftType.form.gradToReport`)}}</span>
        <n-switch @change="onChange" size="large" v-model:value="store.grandPayload.grandToReport" />
      </div>
      <n-collapse-transition class="col-span-12" :show="store.grandPayload.grandToReport">
        <div class="col-span-12 p-2 bg-warning/10 rounded-lg leading-[1.3] text-secondary mb-4">
          {{$t('shiftType.form.reportLabel')}}
        </div>
      </n-collapse-transition>
      <div class="grid grid-cols-2 gap-2 mt-4 col-span-12">
        <n-button @click="store.grandVisible=false" type="error" ghost>
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
            @click="onSubmit"
            :loading="store.savingLoading"
            type="primary">
          {{ $t('content.save') }}
        </n-button>
      </div>
    </n-form>
  </UIModal>
</template>
