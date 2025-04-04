<script setup>
import validationRules from "@/utils/validationRules.js";
const formRef = ref(null)
import {useUserStore, useComponentStore} from "@/store/modules/index.js";
import {UIStructure, UIMenuButton} from "@/components/index.js"
import Utils from "@/utils/Utils.js"

const store = useUserStore()

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

const getRoles = ()=>{
  if(store.roleList.length === 0){
    store._roles()
  }
}

const onSelect = (v)=>{
  if(v.key === Utils.ActionTypes.delete){
    store.payload.role_id = v.data.id
    store.payload.organization_id = [v.data.organization]
    store._update()
  }
}

onMounted(()=>{

})
</script>

<template>
  <n-form
      ref="formRef"
      :rules="validationRules.userForm"
      :model="store.payload"
  >
    <div style="min-height:calc(100vh - 120px)">
      <n-form-item class="w-full mr-4" :label="$t(`documentPage.form.organization`)" path="organization_id">
        <UIStructure
            :modelV="store.payload.organization_id"
            @updateModel="(v)=>store.payload.organization_id=v"
            :checkedVal="store.structureCheck"
            @updateCheck="(v)=>store.structureCheck=v"
            :multiple="false"
        />
      </n-form-item>
      <n-form-item :label="$t(`userRole.form.name`)" path="role_id">
        <n-select
            v-model:value="store.payload.role_id"
            filterable
            :placeholder="$t(`content.choose`)"
            :options="store.roleList"
            label-field="name"
            value-field="id"
            :loading="store.roleLoading"
            @focus="getRoles"
        />
      </n-form-item>

      <n-spin class="w-full min-h-[200px]" :show="store.myRoleLoading">
        <div
            v-for="(item, idx) in store.myRoleList"
            :key="idx"
            class="px-3 py-2 border border-surface-line rounded-md mb-2 flex"
        >

          <div class="flex flex-col" style="width: calc(100% - 40px)">
            <div class="font-semibold">{{item.organization.name}}</div>
            <div class="text-textColor1">{{item.name}}</div>
          </div>
          <div class="w-[40px] flex justify-center items-center">
            <UIMenuButton
                :data="item"
                @selectEv="onSelect"
            />
          </div>
        </div>
        <span v-if="store.myRoleList.length===0 && !store.myRoleLoading"  class="block text-center text-xs text-textColor1">{{$t('userPage.no-roles')}}</span>
      </n-spin>

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