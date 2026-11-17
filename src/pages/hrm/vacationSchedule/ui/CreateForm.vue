<script setup>
  // Grafik sarlavhasi: yaratishda barcha xodimlar serverda qo'shiladi, keyin grafik ichi ochiladi.
  import { useComponentStore, useVacationScheduleStore } from '@stores'
  import { useAppSetting, Utils, validationRules } from '@utils'
  import UIHelper from '@utils/UIHelper.js'
  import { SuperSelect } from '@components'

  const formRef = ref(null)

  const store = useVacationScheduleStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      if (store.visibleType) store._createSchedule()
      else store._updateHeader()
    })
  }

  // Kelishuvchilar ro'yxati + tahrirlanayotgan grafikning o'z odamlari (takrorlanmasin).
  const peopleOptions = computed(() => {
    const seen = new Set()
    return [...store.headerPeople, ...(componentStore.confirmationList || [])].filter(
      (p) => !seen.has(p.id) && seen.add(p.id)
    )
  })

  const onSearchCreator = (v) => {
    store.creator.params.page = 1
    store.creator.params.search = v
    store._fetchCreator()
  }

  const onScrollCreator = () => {
    store.creator.params.page += 1
    store._fetchCreator(true)
  }

  onMounted(() => {
    if (!componentStore.confirmationList?.length) componentStore._confirmations()
    store._fetchCreator()
  })
</script>

<template>
  <n-form
    ref="formRef"
    :rules="validationRules.common"
    :model="store.payload"
    class="grid grid-cols-12 gap-x-4"
  >
    <n-form-item
      class="col-span-12 sm:col-span-6"
      :label="$t(`content.year`)"
      path="year"
      :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <n-select
        :options="Utils.yearList"
        v-model:value="store.payload.year"
        value-field="id"
        label-field="name"
        :disabled="!store.visibleType"
      />
    </n-form-item>
    <n-form-item
      class="col-span-12 sm:col-span-6"
      :label="$t(`vacationSchedule.form.to_date`)"
      path="date"
      :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <n-date-picker
        class="w-full"
        v-model:value="store.payload.date"
        type="date"
        :format="useAppSetting.datePicketFormat"
      />
    </n-form-item>
    <n-form-item
      class="col-span-12 sm:col-span-6"
      :label="$t(`documentPage.command.form.director_id`)"
      path="director_id"
      :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <n-select
        value-field="id"
        label-field="last_name"
        v-model:value="store.payload.director_id"
        :options="peopleOptions"
        :loading="componentStore.confirmationLoading"
        :render-label="UIHelper.avatarRender.label"
        :render-tag="UIHelper.avatarRender.value"
      />
    </n-form-item>
    <n-form-item
      class="col-span-12 sm:col-span-6"
      :label="$t(`vacationSchedule.form.tradeUnion`)"
      path="trade_union_id"
      :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <n-select
        value-field="id"
        label-field="last_name"
        v-model:value="store.payload.trade_union_id"
        :options="peopleOptions"
        :loading="componentStore.confirmationLoading"
        :render-label="UIHelper.avatarRender.label"
        :render-tag="UIHelper.avatarRender.value"
      />
    </n-form-item>
    <n-form-item
      class="col-span-12"
      :label="$t(`vacationSchedule.grid.creator`)"
      path="creator_id"
      :rule-path="validationRules.rulesNames.requiredNumberField"
    >
      <SuperSelect
        :max-tag-count="1"
        :options="store.creator.list"
        :loading="store.creator.loading"
        :total-count="store.creator.total"
        :per-page="store.creator.params.per_page"
        v-model:value="store.payload.creator_id"
        v-model:search="store.creator.params.search"
        value-field="id"
        @onSearch="onSearchCreator"
        @onScrollEv="onScrollCreator"
      />
    </n-form-item>
    <p
      v-if="store.visibleType"
      class="col-span-12 mb-4 mt-1 block text-xs leading-5 text-textColor2"
    >
      {{ $t('vacationSchedule.grid.createHint') }}
    </p>
    <div class="grid grid-cols-2 gap-2 col-span-12">
      <n-button @click="store.openVisible(false)" type="error" ghost>
        {{ $t('content.cancel') }}
      </n-button>
      <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
        {{ store.visibleType ? $t('vacationSchedule.grid.create') : $t('content.save') }}
      </n-button>
    </div>
  </n-form>
</template>
