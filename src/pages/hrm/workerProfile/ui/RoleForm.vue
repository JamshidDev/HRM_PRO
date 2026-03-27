<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { UISelect } from '@/components/index.js'
  const route = useRoute()
  const formRef = ref(null)
  import { useComponentStore, useWorkerProfileStore } from '@/store/modules/index.js'
  import { useRoute } from 'vue-router'

  const store = useWorkerProfileStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        const orgId = store.rolePayload.organization_id[0].id
        const roleId = store.rolePayload.role

        if (store.roleWorkerPositionId) {
          const roleName = componentStore.roles.find((r) => r.id === roleId)?.name
          const data = {
            uuid: store.roleWorkerPositionId,
            role_id: roleId,
            role: roleName || roleId,
            organization_id: Number(orgId)
          }
          store._attachUserRole(data)
        } else if (route.query.id) {
          const data = { organization_id: orgId, role: roleId }
          store._storeRole(data, route.query.id)
        }
      }
    })
  }

  onMounted(() => {
    if (componentStore.roles.length === 0) {
      componentStore._enums()
    }
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.rolePayload">
    <div class="pb-[60px]">
      <n-form-item
        class="w-full"
        :label="$t(`documentPage.form.organization`)"
        path="organization_id"
        :rule-path="validationRules.rulesNames.requiredMultiSelectField"
      >
        <UISelect
          :options="componentStore.structureList"
          :model-v="store.rolePayload.organization_id"
          @defaultValue="(v) => (store.rolePayload.organization_id = v)"
          @updateModel="(v) => (store.rolePayload.organization_id = v)"
          :checked-val="store.structureCheck"
          @updateCheck="(v) => (store.structureCheck = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :multiple="false"
        />
      </n-form-item>
      <n-form-item
        class="w-full"
        :label="$t(`content.role`)"
        path="role"
        :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <n-select
          v-model:value="store.rolePayload.role"
          filterable
          :options="componentStore.roles"
          :loading="componentStore.enumLoading"
          label-field="name"
          value-field="id"
        />
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="() => (store.roleVisible = false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.roleLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

