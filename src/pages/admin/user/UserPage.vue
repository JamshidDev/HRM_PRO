<script setup>
  import { UIDrawer, UIModal, UIPageContent, UIConfirm } from '@/components/index.js'
  import { useUserStore, useAccountStore, useUserRoleStore } from '@/store/modules/index.js'
  import Table from './ui/Table.vue'
  import createForm from './ui/createForm.vue'
  import Filter from './ui/Filter.vue'
  import PermissionForm from './ui/permissionForm.vue'
  import EditPinForm from './ui/editPinForm.vue'
  import MainPhoneForm from '@/components/worker/ui/MainPhoneForm.vue'

  const store = useUserStore()
  const accStore = useAccountStore()
  const roleStore = useUserRoleStore()
  onMounted(() => {
    if (!accStore.checkAction(accStore.pn.usersRead)) return
    store._index()
    roleStore._getAllPermission()
  })
</script>

<template>
  <UIPageContent>
    <Filter />
    <Table />
    <UIModal
      v-model:visible="store.isPermissionsVisible"
      :width="960"
      :title="$t('userPage.permissions')"
    >
      <PermissionForm />
    </UIModal>
    <UIModal
      v-model:visible="store.pinVisible"
      :width="460"
      :title="$t('userPage.pinTitle')"
    >
      <EditPinForm v-if="store.pinVisible" />
    </UIModal>
    <UIModal v-model:visible="store.phoneVisible" :width="460" :title="$t('mainPhone.title')">
      <MainPhoneForm
        v-if="store.phoneVisible"
        :worker="store.phoneRow?.worker"
        :subtitle="store.phoneRow?.organization?.name"
        :phone="store.phoneRow?.phone"
        :loading="store.phoneSaveLoading"
        @save="store._updatePhone"
        @cancel="store.phoneVisible = false"
      />
    </UIModal>
    <UIDrawer
      :visible="store.visible"
      @update:visible="(v) => (store.visible = v)"
      :title="store.visibleType ? $t('userPage.createTitle') : $t('userPage.updateTitle')"
    >
      <template #content>
        <createForm />
      </template>
    </UIDrawer>
    <UIConfirm
      v-model:visible="store.confirmVisible"
      :type="store.isSpam ? 'confirm' : 'warning'"
      :danger="!store.isSpam"
      :title="$t(store.isSpam ? 'userPage.form.cancelSpam' : 'userPage.form.confirmSpam')"
      :confirm-text="$t('content.confirm')"
      @confirm="store._onSpam"
    />
  </UIPageContent>
</template>
