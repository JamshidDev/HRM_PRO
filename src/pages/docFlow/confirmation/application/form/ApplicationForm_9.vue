<script setup>
  import { useConfApplicationStore } from '@/store/modules/index.js'
  import { financialAidReasons } from '@/utils/financialAidReasons.js'
  import i18n from '@/i18n/index.js'

  const store = useConfApplicationStore()
  const { t } = i18n.global

  // 0 — «Boshqa»: maydon tozalanadi, xodim sababni o'zi yozadi.
  const OTHER = 0
  const options = computed(() => [
    ...financialAidReasons(t),
    { id: OTHER, name: t('applicationPage.form.reasonOther'), text: '' }
  ])
  // Hujjatga o'zbekcha matn (text) yoziladi; tahrirda shu matn bo'yicha variant topiladi.
  const reasonType = ref(
    store.payload.reason
      ? (options.value.find((o) => o.id !== OTHER && o.text === store.payload.reason)?.id ?? OTHER)
      : null
  )

  // Forma tozalansa yoki tahrirga ochilsa — tanlov matnga moslanadi.
  watch(
    () => store.payload.reason,
    (v) => {
      if (!v) {
        if (reasonType.value !== OTHER) reasonType.value = null
        return
      }
      const match = options.value.find((o) => o.id !== OTHER && o.text === v)
      if (match) reasonType.value = match.id
    }
  )

  const onSelect = (id) => {
    reasonType.value = id
    const opt = options.value.find((o) => o.id === id)
    store.payload.reason = id === OTHER || !opt ? '' : opt.text
  }
</script>

<template>
  <div class="grid grid-cols-12 gap-x-4">
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.reasonType`)">
        <n-select
          :value="reasonType"
          :options="options"
          label-field="name"
          value-field="id"
          :virtual-scroll="false"
          :menu-props="{ class: 'aid-reason-menu' }"
          :placeholder="$t(`applicationPage.form.reasonTypePlaceholder`)"
          @update:value="onSelect"
        />
      </n-form-item>
    </div>
    <div class="col-span-12">
      <n-form-item :label="$t(`applicationPage.form.reason`)" path="reason">
        <n-input
          class="w-full"
          type="textarea"
          :autosize="{ minRows: 3 }"
          v-model:value="store.payload.reason"
        />
      </n-form-item>
    </div>
  </div>
</template>

<style>
  /* Ro'yxatda uzun sabablar o'raladi; maydonning o'zida bir qator (ellipsis). */
  .n-base-select-menu.aid-reason-menu .n-base-select-option.n-base-select-option {
    height: auto;
    min-height: 34px;
    padding-top: 6px;
    padding-bottom: 6px;
  }
  .n-base-select-menu.aid-reason-menu
    .n-base-select-option
    .n-base-select-option__content.n-base-select-option__content {
    white-space: normal;
    text-overflow: clip;
    line-height: 1.35;
  }
</style>
