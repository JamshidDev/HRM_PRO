<script setup>
  // Ta'til kunlari tarkibi: asosiy + o'tgan davrdan qolgan + 41-buyruqdagi qo'shimchalar.
  import { useComponentStore } from '@stores'
  import { Dismiss16Regular } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'

  const props = defineProps({
    row: { type: Object, required: true },
    disabled: { type: Boolean, default: false },
    loading: { type: Boolean, default: false }
  })
  const emit = defineEmits(['save'])

  const { t } = i18n.global
  const componentStore = useComponentStore()
  const SECOND_DAY_ID = 'second_day'

  const show = ref(false)
  const mainDay = ref(0)
  const items = ref([])
  const addId = ref(null)

  const options = computed(() => [
    { id: SECOND_DAY_ID, name: t('vacationSchedule.grid.secondDay') },
    ...(componentStore.vacationAdditional || [])
  ])
  const nameOf = (id) => options.value.find((o) => String(o.id) === String(id))?.name ?? id
  const freeOptions = computed(() =>
    options.value.filter((o) => !items.value.some((i) => String(i.id) === String(o.id)))
  )
  const total = computed(() =>
    Math.max(
      0,
      (Number(mainDay.value) || 0) +
        (Number(props.row.rest_day) || 0) +
        items.value.reduce((s, i) => s + (Number(i.value) || 0), 0)
    )
  )

  const onShow = (v) => {
    show.value = v
    if (!v) return
    mainDay.value = props.row.main_day
    items.value = (props.row.additional || []).map((i) => ({ id: i.id, value: i.value }))
    addId.value = null
    if (!componentStore.vacationAdditional?.length) componentStore._enums()
  }

  const onAdd = (id) => {
    if (id === null || id === undefined) return
    items.value.push({ id, value: 0 })
    nextTick(() => (addId.value = null))
  }

  const onSave = () => {
    emit('save', {
      main_day: Number(mainDay.value) || 0,
      additional: items.value.map((i) => ({ id: i.id, value: Number(i.value) || 0 }))
    })
    show.value = false
  }
</script>

<template>
  <n-popover
    trigger="click"
    placement="bottom-end"
    :show="show"
    :disabled="disabled"
    @update:show="onShow"
  >
    <template #trigger>
      <n-button size="small" secondary :type="disabled ? 'default' : 'primary'" :loading="loading">
        {{ row.all_days }} {{ $t('vacationSchedule.grid.dayUnit') }}
      </n-button>
    </template>
    <div class="flex w-[340px] flex-col gap-2">
      <div class="flex items-center justify-between gap-2">
        <span class="text-sm">{{ $t('vacationSchedule.grid.mainDay') }}</span>
        <n-input-number
          v-model:value="mainDay"
          class="w-[110px]"
          :min="0"
          :max="99"
          :precision="0"
          size="small"
        />
      </div>
      <div class="flex items-center justify-between gap-2 text-sm">
        <span>{{ $t('vacationSchedule.grid.restDay') }}</span>
        <span class="w-[110px] pr-3 text-right font-medium">{{ row.rest_day }}</span>
      </div>
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center justify-between gap-2 rounded-md border border-surface-line bg-surface-ground px-2 py-1"
      >
        <span class="text-xs leading-4">{{ nameOf(item.id) }}</span>
        <span class="flex shrink-0 items-center gap-1">
          <n-input-number
            v-model:value="item.value"
            class="w-[80px]"
            :min="0"
            :max="99"
            :precision="0"
            size="small"
          />
          <n-button quaternary circle size="tiny" @click="items = items.filter((i) => i !== item)">
            <template #icon>
              <n-icon><Dismiss16Regular /></n-icon>
            </template>
          </n-button>
        </span>
      </div>
      <n-select
        v-if="freeOptions.length"
        v-model:value="addId"
        size="small"
        :options="freeOptions"
        label-field="name"
        value-field="id"
        :placeholder="$t('vacationSchedule.grid.addAdditional')"
        @update:value="onAdd"
      />
      <div class="flex items-center justify-between border-t border-surface-line pt-2">
        <span class="text-sm font-semibold">
          {{ $t('vacationSchedule.grid.total') }}: {{ total }}
          {{ $t('vacationSchedule.grid.dayUnit') }}
        </span>
        <n-button size="small" type="primary" @click="onSave">{{ $t('content.save') }}</n-button>
      </div>
    </div>
  </n-popover>
</template>
