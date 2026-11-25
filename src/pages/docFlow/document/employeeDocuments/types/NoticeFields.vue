<script setup>
  // Bildirgi: NTF turi (guruhlangan) va shu turning maydonlari; javob turi va ogohlantirish muddati — ma'lumot uchun.
  import { selectWrap } from '@/utils/selectWrap.js'
  import { UIChip } from '@/components/index.js'
  import { useEmployeeDocumentStore } from '@/store/modules/index.js'
  import SchemaFields from './SchemaFields.vue'

  // part: 'type' — tur tanlovi (formaning tepasida), 'fields' — turga xos maydonlar.
  const props = defineProps({ part: { type: String, default: 'fields' } })
  const store = useEmployeeDocumentStore()
  const fieldsRef = ref(null)

  const typeOptions = computed(() =>
    (store.noticeSchema?.groups ?? []).map((g) => ({
      type: 'group',
      key: `g${g.id}`,
      label: g.name,
      children: store.noticeSchema.types.filter((v) => v.group === g.id).map((v) => ({ value: v.id, label: `${v.id} - ${v.name}` }))
    }))
  )
  const def = computed(() => store.noticeDef())

  // Tur almashsa oldingi turning maydonlari tozalanadi.
  const onType = (v) => {
    store.payload.data.notice_type = v
    store.payload.data.fields = {}
  }

  defineExpose({ validate: () => fieldsRef.value?.validate() ?? true })
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <n-form-item v-if="props.part === 'type'" class="col-span-12" :label="$t('noticesPage.type')" path="data.notice_type">
      <n-select
        v-bind="selectWrap"
        filterable
        :value="store.payload.data.notice_type"
        @update:value="onType"
        :options="typeOptions"
        :loading="!store.noticeSchema"
      />
    </n-form-item>
    <div v-if="def && props.part === 'type'" class="col-span-12 mb-1 flex flex-wrap gap-2 text-xs">
      <UIChip>{{ $t('noticesPage.term') }}: {{ def.term }}</UIChip>
      <UIChip tone="info">{{ $t(`noticesPage.response.${def.response}`) }}</UIChip>
    </div>
    <div v-if="def && props.part === 'fields'" class="col-span-12">
      <SchemaFields ref="fieldsRef" :key="def.id" :fields="def.fields" :data="store.payload.data.fields" />
    </div>
  </div>
</template>
