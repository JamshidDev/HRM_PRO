<script setup>
  import { usePublicStore } from '@stores'
  import { UIUser } from '@components'

  const store = usePublicStore()
</script>

<template>
  <div
    v-if="store.confirmations.length && store.existFile"
    class="bg-surface-section px-4 pb-2 pt-4 rounded-xl border border-surface-line"
  >
    <p class="!mb-4 font-medium">{{ $t('timesheetPage.verifiers') }}</p>
    <template v-for="item in store.confirmations">
      <UIUser
        class="!mb-2"
        :hide-tooltip="true"
        :short="false"
        :data="{
          photo: item.worker.photo,
          lastName: item.worker.last_name,
          firstName: item.worker.first_name,
          middleName: item.worker.middle_name,
          position: item.position
        }"
      />
    </template>
  </div>
</template>
