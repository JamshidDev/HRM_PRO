<script setup>
  import { ref, computed } from 'vue'
  import { useUserRoleStore, useUserStore } from '@/store/modules/index.js'
  import { DismissCircle24Regular } from '@vicons/fluent'

  const userStore = useUserStore()
  const roleStore = useUserRoleStore()

  const leftSearch = ref('')
  const rightSearch = ref('')

  const clonedPermissions = ref([])

  watch(
    () => userStore.userPermissions,
    (v) => {
      clonedPermissions.value = [...v]
    }
  )

  const attachablePermissions = computed(() => {
    return roleStore.allPermissionList.filter(
      (p) => !clonedPermissions.value.find((i) => i.id === p.id)
    )
  })

  const leftList = computed(() => {
    const q = leftSearch.value?.toLowerCase().trim()
    return attachablePermissions.value.filter((p) => !q || p.name.toLowerCase().includes(q))
  })

  const rightList = computed(() => {
    const q = rightSearch.value?.toLowerCase().trim()
    return clonedPermissions.value.filter((p) => !q || p.name.toLowerCase().includes(q))
  })

  const addPermission = (perm) => {
    clonedPermissions.value.push({
      id: perm.id,
      name: perm.name,
      direct: true,
      via_role: false,
      detachable: true,
      roles: []
    })
  }

  const removePermission = (perm) => {
    if (perm.detachable === false) return
    const idx = clonedPermissions.value.findIndex((p) => p.id === perm.id)
    if (idx !== -1) clonedPermissions.value.splice(idx, 1)
  }

  const diff = computed(() => ({
    detached_ids: userStore.userPermissions
      .filter((p) => !clonedPermissions.value.find((c) => c.id === p.id))
      .map((p) => p.id),
    attached_ids: clonedPermissions.value
      .filter((p) => !userStore.userPermissions.find((c) => c.id === p.id))
      .map((p) => p.id)
  }))

  const onSubmit = () => {
    userStore._updateUserPermissions(
      diff.value.attached_ids,
      diff.value.detached_ids,
      clonedPermissions.value
    )
  }
</script>

<template>
  <n-spin
    :show="userStore.userPermissionsLoading || userStore.savePermissionLoading"
    style="min-height: 200px"
  >
    <div class="grid grid-cols-2 gap-3 max-h-[600px] h-[600px]">
      <!-- Left Panel: Available Permissions -->
      <div class="flex flex-col border border-surface-line rounded-lg overflow-hidden h-full">
        <div class="p-2 border-b border-surface-line bg-surface-ground shrink-0">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-textColor1">{{
              $t('userPage.availablePermissions')
            }}</span>
            <n-tag size="small" type="primary" round>{{ leftList.length }}</n-tag>
          </div>
          <n-input
            v-model:value="leftSearch"
            clearable
            size="small"
            :placeholder="$t('content.search')"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-2">
          <div class="flex flex-wrap gap-1">
            <div
              v-for="perm in leftList"
              :key="perm.id"
              class="cursor-pointer inline-flex items-center px-2 py-0.5 rounded-md text-xs border border-surface-line bg-surface-section hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors select-none"
              @click="addPermission(perm)"
            >
              {{ perm.name }}
            </div>
          </div>
          <div
            v-if="leftList.length === 0 && !userStore.userPermissionsLoading"
            class="flex justify-center items-center h-16 text-sm text-textColor3"
          >
            —
          </div>
        </div>
      </div>

      <!-- Right Panel: Attached Permissions -->
      <div class="flex flex-col border border-surface-line rounded-lg overflow-hidden">
        <div class="p-2 border-b border-surface-line bg-surface-ground shrink-0">
          <div class="flex items-center justify-between mb-2">
            <span class="text-sm font-medium text-textColor1">{{
              $t('userPage.attachedPermissions')
            }}</span>
            <n-tag size="small" type="success" round>{{ clonedPermissions.length }}</n-tag>
          </div>
          <n-input
            v-model:value="rightSearch"
            clearable
            size="small"
            :placeholder="$t('content.search')"
          />
        </div>
        <div class="flex-1 overflow-y-auto p-2 min-h-0">
          <div class="flex flex-wrap gap-1">
            <div
              v-for="perm in rightList"
              :key="perm.id"
              class="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-xs border"
              :class="
                perm.detachable === false
                  ? 'border-surface-line bg-surface-ground text-textColor3'
                  : 'border-surface-line bg-surface-section text-textColor0'
              "
            >
              <!-- Remove button -->
              <n-button
                text
                size="tiny"
                :disabled="perm.detachable === false"
                class="!p-0 flex-shrink-0"
                :class="perm.detachable === false ? '!text-textColor3' : '!text-danger'"
                @click="removePermission(perm)"
              >
                <template #icon>
                  <n-icon size="14">
                    <DismissCircle24Regular />
                  </n-icon>
                </template>
              </n-button>

              <!-- Name -->
              <span class="leading-tight">{{ perm.name }}</span>

              <!-- Roles count badge -->
              <n-tooltip v-if="perm.roles && perm.roles.length > 0" trigger="hover" placement="top">
                <template #trigger>
                  <span
                    class="inline-flex items-center justify-center w-4 h-4 rounded-full bg-primary/15 text-primary text-[10px] font-semibold cursor-default flex-shrink-0 leading-none"
                  >
                    {{ perm.roles.length }}
                  </span>
                </template>
                <div class="flex flex-wrap gap-1 max-w-[220px] py-0.5">
                  <span
                    v-for="role in perm.roles"
                    :key="role.id"
                    class="inline-block px-1.5 py-0.5 rounded bg-white/15 text-xs"
                  >
                    {{ role.name }}
                  </span>
                </div>
              </n-tooltip>
            </div>
          </div>
          <div
            v-if="rightList.length === 0 && !userStore.userPermissionsLoading"
            class="flex justify-center items-center h-16 text-sm text-textColor3"
          >
            —
          </div>
        </div>
      </div>
    </div>
    <div class="flex justify-end pt-3">
      <n-button
        @click="onSubmit"
        type="primary"
        :disabled="diff.detached_ids.length === 0 && diff.attached_ids.length === 0"
        :loading="userStore.savePermissionLoading"
      >
        {{ $t('content.save') }}
      </n-button>
    </div>
  </n-spin>
</template>

<style scoped></style>
