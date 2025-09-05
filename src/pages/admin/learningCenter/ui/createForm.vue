<script setup>
import validationRules from "@/utils/validationRules.js";
import {UINSelect} from "@/components/index.js"

const formRef = ref(null)
import {useLearningCenterStore} from "@/store/modules/index.js";
import UIHelper from "@/utils/UIHelper.js"
import utils from "@/utils/Utils.js"

const store = useLearningCenterStore()

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
  store.userListParams.page = 1
  store.userListParams.search = null
  store._userList()
})

</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.common"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item :label="$t(`content.nameUz`)" path="name" rule-path="requiredStringField">
        <n-input
            type="text"
            v-model:value="store.payload.name"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.nameRu`)" path="name" rule-path="requiredStringField">
        <n-input
            class="skip-format"
            type="text"
            v-model:value="store.payload.name_ru"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.nameEn`)" path="name" rule-path="requiredStringField">
        <n-input
            type="text"
            v-model:value="store.payload.name_en"
        />
      </n-form-item>
      <n-form-item :label="$t(`content.users`)" path="users" :rule-path="validationRules.rulesNames.requiredMultiSelectField">
        <UINSelect
            multiple
            v-model:value="store.payload.users"
            :options="store.userList"
            :loading="store.userListLoading"
            :value-field="'id'"
            :query="store.userListParams.search"
            @onSearch="store.onSearchUserList"
            @onScroll="store.onScrollUserList"
            />
      </n-form-item>
      <n-form-item :label="$t(`content.code`)" path="code" :rule-path="validationRules.rulesNames.requiredStringField">
        <n-input
            type="text"
            class="w-full!"
            v-model:value="store.payload.code"
            v-mask="'##########'"
            :allow-input="utils.onlyAllowNumber"
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