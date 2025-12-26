<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useUserRoleStore } from '@/store/modules/index.js'
  import { Checkmark16Filled, Filter24Filled } from '@vicons/fluent'

  const store = useUserRoleStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  const onSearchEv = () => {
    let query = store.query?.toString()?.trim()?.toLowerCase()
    if (!Boolean(query)) {
      store.allPermissionList = store.originAllPermissionList
    } else {
      store.allPermissionList = store.originAllPermissionList.filter((v) =>
        v?.name?.toString()?.toLowerCase()?.includes(query)
      )
    }
  }

  const onClearEv = () => {
    store.query = null
    onSearchEv()
  }
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.userRole" :model="store.payload">
    <div style="min-height: calc(100vh - 120px)">
      <n-form-item :label="$t(`userRole.form.name`)" path="name">
        <n-input type="text" v-model:value="store.payload.name" />
      </n-form-item>
      <n-form-item :label="$t(`userRole.form.permissions`)" path="permissions">
        <div class="w-full">
          <div class="mb-2 flex">
            <n-input
              clearable
              class="w-[calc(100%-200px)] skip-format"
              v-model:value="store.query"
              type="text"
              :placeholder="$t('content.search')"
              :on-keyup="onSearchEv"
              @clear="onClearEv"
            />
            <div class="w-[200px] px-4 flex gap-2">
              <n-button type="success" round secondary>
                {{ store.payload.permissions.length }}
                <template #icon>
                  <Checkmark16Filled />
                </template>
              </n-button>
              <n-button type="primary" round secondary>
                {{ store.allPermissionList.length }}
                <template #icon>
                  <Filter24Filled />
                </template>
              </n-button>
            </div>
          </div>
          <div
            class="w-full h-[calc(100vh-300px)] overflow-y-auto border border-surface-line rounded-lg p-2"
          >
            <n-checkbox-group v-model:value="store.payload.permissions">
              <div class="grid grid-cols-2 gap-2">
                <n-checkbox
                  class="text-sm! mb-2rr border border-surface-line p-1 rounded-lg"
                  v-for="(item, idx) in store.allPermissionList"
                  :key="idx"
                  :value="item.id"
                >
                  <span class="leading-[1.2] text-secondary"> {{ item.name }}</span>
                </n-checkbox>
              </div>
            </n-checkbox-group>
          </div>
        </div>
      </n-form-item>
    </div>

    <div class="grid grid-cols-2 gap-2">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>

<style scoped></style>
