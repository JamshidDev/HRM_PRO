<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useUserStore, useComponentStore, useAccountStore } from '@/store/modules/index.js'
  import { UIMenuButton, UISelect, UISegmentTabs } from '@/components/index.js'
  import { Globe16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'

  const componentStore = useComponentStore()
  const store = useUserStore()
  const accStore = useAccountStore()

  // «Global qilish» — faqat tarkibi bilan ko'radigan (global) rol va faqat Admin uchun.
  const selectedRole = computed(() => store.roleList.find((r) => r.id === store.payload.role_id))
  const canGlobal = computed(
    () =>
      selectedRole.value?.scope_type === 'global' &&
      accStore.checkPermission(accStore.pn.organizationAdmin)
  )
  watch(canGlobal, (v) => {
    if (!v) store.payload.is_global = false
  })

  const { t } = i18n.global
  const modeTabs = computed(() => [
    { id: 'org', name: t('userPage.assignToOrg') },
    { id: 'global', name: t('userPage.assignGlobal') }
  ])
  const mode = computed({
    get: () => (store.payload.is_global ? 'global' : 'org'),
    set: (v) => (store.payload.is_global = v === 'global')
  })

  // Global tanlansa korxona majburiy emas.
  const rules = computed(() =>
    store.payload.is_global
      ? { role_id: validationRules.userForm.role_id }
      : validationRules.userForm
  )

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

  const getRoles = () => {
    if (store.roleList.length === 0) {
      store._roles()
    }
  }

  const onSelect = (v) => {
    if (v.key === Utils.ActionTypes.delete) {
      store.payload.role_id = v.data.id
      store.payload.organization_id = [v.data.organization]
      store._update()
    }
  }

  onMounted(() => {
    getRoles()
    if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })
</script>

<template>
  <n-form ref="formRef" :rules="rules" :model="store.payload">
    <!-- Tugmalar drawer pastida turishi uchun kontent kamida ekran balandligida. -->
    <div style="min-height: calc(100vh - 150px)">
      <n-form-item :label="$t(`userRole.form.name`)" path="role_id">
        <n-select
          v-model:value="store.payload.role_id"
          filterable
          :options="store.roleList"
          label-field="name"
          value-field="id"
          :loading="store.roleLoading"
          @focus="getRoles"
        />
      </n-form-item>

      <n-form-item v-if="canGlobal" :label="$t('userPage.assignMode')" :show-feedback="false" class="mb-5">
        <UISegmentTabs v-model="mode" :tabs="modeTabs" />
      </n-form-item>

      <n-form-item
        v-if="!store.payload.is_global"
        class="w-full"
        :label="$t(`documentPage.form.organization`)"
        path="organization_id"
      >
        <UISelect
          :options="componentStore.structureList"
          :modelV="store.payload.organization_id"
          @updateModel="(v) => (store.payload.organization_id = v)"
          @defaultValue="(v) => (store.payload.organization_id = v)"
          :checkedVal="store.structureCheck"
          @updateCheck="(v) => (store.structureCheck = v)"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :loading="componentStore.structureLoading"
          :multiple="false"
        />
      </n-form-item>
      <div
        v-else
        class="mb-6 flex items-center gap-2 rounded-xl bg-fig-chip-brand px-3 py-2.5 text-sm text-fig-chip-brand-text"
      >
        <n-icon size="16"><Globe16Regular /></n-icon>
        {{ $t('userPage.globalHint') }}
      </div>

      <n-spin class="w-full min-h-[200px]" :show="store.myRoleLoading">
        <div
          v-for="(item, idx) in store.myRoleList"
          :key="idx"
          class="px-3 py-2 border border-surface-line rounded-md mb-2 flex"
        >
          <div class="flex flex-col" style="width: calc(100% - 40px)">
            <div class="font-semibold">
              <span v-if="item.is_global" class="text-primary">{{ $t('userPage.globalBadge') }}</span>
              <template v-else>{{ item.organization.name }}</template>
            </div>
            <div class="text-textColor1">{{ item.name }}</div>
          </div>
          <div class="w-[40px] flex justify-center items-center">
            <UIMenuButton :data="item" @selectEv="onSelect" />
          </div>
        </div>
        <span
          v-if="store.myRoleList.length === 0 && !store.myRoleLoading"
          class="block text-center text-xs text-textColor1"
          >{{ $t('userPage.no-roles') }}</span
        >
      </n-spin>
    </div>

    <div
      class="sticky bottom-0 -mx-4 -mb-3 mt-4 grid grid-cols-2 gap-2 border-t border-surface-line bg-surface-section px-4 py-3"
    >
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
