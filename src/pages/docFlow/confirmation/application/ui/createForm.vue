<script setup>
  import validationRules from '@/utils/validationRules.js'
  import i18n from '@/i18n/index.js'
  import {
    ArrowCircleRight20Regular,
    ArrowCircleLeft28Regular,
    DismissCircle28Regular,
    DocumentRibbon28Regular
  } from '@vicons/fluent'
  const formRef = ref(null)
  import { useConfApplicationStore, useComponentStore } from '@/store/modules/index.js'
  import ApplicationForm_3 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_3.vue'
  import ApplicationFinish from '@/pages/docFlow/confirmation/application/form/ApplicationFinish.vue'
  import ApplicationForm_1 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_1.vue'
  import ApplicationForm_101 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_101.vue'
  import ApplicationForm_2 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_2.vue'
  import ApplicationForm_4 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_4.vue'
  import ApplicationForm_5 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_5.vue'
  import ApplicationForm_6 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_6.vue'
  import ApplicationForm_7 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_7.vue'
  import ApplicationForm_9 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_9.vue'
  import ApplicationForm_10 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_10.vue'
  import ApplicationForm_8 from '@/pages/docFlow/confirmation/application/form/ApplicationForm_8.vue'
  import ApplicationSchemaForm from '@/pages/docFlow/confirmation/application/form/ApplicationSchemaForm.vue'
  const schemaFormRef = ref(null)

  const store = useConfApplicationStore()
  const componentStore = useComponentStore()

  // Tugash sanasi boshlanishdan oldin bo'lmasin. Kalendar `is-date-disabled` bilan buni faqat
  // bosishda to'sadi — klaviaturadan yozilgan sana (masalan 01.10.2026) to'g'ridan-to'g'ri
  // modelga tushadi va backend'ga borardi (DAS-14201).
  const notBefore = (startKey) => ({
    key: 'range',
    trigger: ['input', 'blur'],
    validator: (_rule, value) => {
      const start = store.payload[startKey]
      // O'tgan kun bo'lsa — `notPast` xabari yetarli, ikkita xato ustma-ust chiqmasin.
      if (!value || !start || value >= start || store.isPastDay(value)) return true
      return new Error(i18n.global.t('rules.endBeforeStart'))
    }
  })
  // O'tgan kun — kalendarda yopiq (`store.isPastDay`), yozib kiritilsa shu qoida to'sadi.
  const notPast = {
    trigger: ['input', 'blur'],
    validator: (_rule, value) =>
      !value || !store.isPastDay(value) || new Error(i18n.global.t('rules.pastDate'))
  }
  const rules = {
    ...validationRules.applicationPage,
    from: [validationRules.applicationPage.from, notPast],
    to: [validationRules.applicationPage.to, notPast, notBefore('from')],
    period_to: [validationRules.applicationPage.period_to, notBefore('period_from')],
    // 1/2 (korxona tanlanadigan tur) da lavozim ixtiyoriy — nomzodda faol lavozim bo'lmasligi mumkin.
    worker_position_id: {
      trigger: ['change', 'blur'],
      validator: (_rule, value) =>
        store.isOrgPlace() || value != null || new Error(i18n.global.t('rules.requiredField'))
    }
  }
  // Boshlanish sanasi keyin o'zgarsa, allaqachon tanlangan tugash sanasi qayta tekshiriladi.
  watch(
    () => [store.payload.from, store.payload.period_from],
    () => {
      if (!store.payload.to && !store.payload.period_to) return
      formRef.value?.validate(undefined, (rule) => rule?.key === 'range').catch(() => {})
    }
  )

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        if (store.activeTab === 101) {
          // Ishga kirish (1, 2): korxona majburiy — rahbar va HR shu korxonadan aniqlanadi.
          store.orgError = store.isOrgPlace() && !store.organization_id?.length
          if (store.orgError) return
          // Tavsifli tur — umumiy forma; eski 2, 3, 5, 7 — o'z formasi.
          store.activeTab = store.schemaDef() ? 'schema' : store.payload.type
          // Eski formalarda (1, 2, 6, 7) «Sana» bo'sh bo'lsa — bugungi kun.
          if (!store.schemaDef() && [1, 2, 6, 7].includes(store.payload.type) && store.payload.from_date == null) {
            store.payload.from_date = new Date().setHours(0, 0, 0, 0)
          }
          if (store.typeList.includes(store.payload.type) && !store.visibleType) {
            componentStore._departmentPosition(store.department_id?.[0]?.id)
          }
          store.stepNumber = 2
        } else {
          if (store.activeTab === 'schema' && !schemaFormRef.value?.validate()) return
          if (store.visibleType) {
            store._create()
          } else {
            store._update()
          }
        }
      }
    })
  }


  const goBack = () => {
    if (store.activeTab !== 100) {
      store.activeTab = 101
      store.stepNumber = 1
    } else {
      store.activeTab = store.schemaDef() ? 'schema' : store.payload.type
      store.stepNumber = 2
    }
  }
</script>

<template>
  <n-form ref="formRef" :rules="rules" :model="store.payload">
    <!-- Qadamlar almashganda oyna balandligi o'zgarmaydi — ichki qism aylantiriladi. -->
    <div class="app-application-body">
      <n-tabs animated v-model:value="store.activeTab" class="hidden-tab-header" type="segment">
        <n-tab-pane :name="store.tabList[0].id">
          <ApplicationForm_101 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[1].id">
          <ApplicationFinish />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[2].id">
          <ApplicationForm_3 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[3].id">
          <ApplicationForm_4 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[4].id">
          <ApplicationForm_1 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[5].id">
          <ApplicationForm_2 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[6].id">
          <ApplicationForm_5 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[7].id">
          <ApplicationForm_6 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[8].id">
          <ApplicationForm_7 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[9].id">
          <ApplicationForm_9 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[10].id">
          <ApplicationForm_10 />
        </n-tab-pane>
        <n-tab-pane :name="store.tabList[11].id">
          <ApplicationForm_8 />
        </n-tab-pane>
        <n-tab-pane name="schema">
          <ApplicationSchemaForm ref="schemaFormRef" />
        </n-tab-pane>
      </n-tabs>
    </div>
    <!-- Tugmalar modal tubida. -->
    <div class="app-form-footer col-span-12 flex justify-center">
      <div class="grid grid-cols-2 w-full gap-4">
        <div>
          <n-button
            v-if="store.activeTab !== 101 && store.activeTab !== 100"
            :loading="store.saveLoading"
            style="width: 100%"
            @click="goBack()"
          >
            <template #icon>
              <ArrowCircleLeft28Regular />
            </template>
            {{ $t('content.back') }}
          </n-button>
        </div>

        <div :class="store.activeTab === 101 && 'col-span-2'">
          <n-button
            v-if="store.activeTab !== 100"
            :loading="store.saveLoading"
            style="width: 100%"
            @click="onSubmit"
            icon-placement="right"
            type="primary"
          >
            <template #icon>
              <ArrowCircleRight20Regular />
            </template>
            {{ store.activeTab === 101 ? $t('content.next') : $t('content.save') }}
          </n-button>
        </div>
        <div class="col-span-2">
          <n-button
            v-if="store.activeTab === 100"
            style="width: 100%"
            @click="store.visible = false"
            type="error"
          >
            <template #icon>
              <DismissCircle28Regular />
            </template>
            {{ $t('content.close') }}
          </n-button>
        </div>
      </div>
    </div>
  </n-form>
</template>

<style scoped>
  .app-form-footer {
    margin-top: 12px;
  }
  .app-application-body {
    height: min(480px, calc(100vh - 320px));
    overflow-y: auto;
    overflow-x: hidden;
    padding-right: 6px;
  }
</style>

<style>
  /* Select menyusi body'ga chiqadi — scoped emas. Uzun variant o'raladi va to'liq ko'rinadi. */
  .app-select-wrap .n-base-select-option {
    height: auto !important;
    min-height: 34px;
    padding-top: 6px;
    padding-bottom: 6px;
  }
  .app-select-wrap .n-base-select-option__content {
    white-space: normal !important;
    overflow: visible !important;
    text-overflow: clip !important;
    line-height: 1.35;
  }
</style>
