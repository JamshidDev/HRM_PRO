<script setup>
  import validationRules from '@/utils/validationRules.js'
  import i18n from '@/i18n/index.js'
  import { useOrganizationLeaderStore, useComponentStore } from '@/store/modules/index.js'
  import { UISelect } from '@/components/index.js'
  import Utils from '@/utils/Utils.js'
  import { Delete20Regular, Add16Regular } from '@vicons/fluent'
  import { Mask } from 'maska'
  import { useThemeVars } from 'naive-ui'

  const { t } = i18n.global

  const MAX_PHONES = 5
  // Ichki raqam (5 xona) yoki to'liq raqam (9 xona)
  const mask = new Mask({ mask: ['##-###-##-##', '##-###'] })

  const formRef = ref(null)
  const store = useOrganizationLeaderStore()
  const componentStore = useComponentStore()
  const themeVars = useThemeVars()

  // Tahrirlashda kim tahrirlanayotgani — oddiy matn (ism qalin, tashkilot kichik kulrang)
  const editWorker = computed(() => Utils.combineFullName(store.editRow?.worker_position?.worker))

  const onSubmit = () => {
    phoneTouched.value = true
    formRef.value?.validate((error) => {
      if (!error && !phoneError.value) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  const changeOrg = (v) => {
    store.payload.organization_id = v
    store.payload.worker_position_id = null
    componentStore.workerParams.organization_id = v[0].id
    componentStore._workers()
  }

  const workerRenderLabel = (option) => {
    return [
      h('div', { class: 'flex flex-col py-0.5' }, [
        h('div', { class: 'text-sm font-medium text-textColor1' }, option.name),
        h('div', { class: 'text-xs text-textColor3' }, option.position)
      ])
    ]
  }
  const workerRenderValue = ({ option }) => {
    return [h('div', { class: 'text-sm text-textColor1 truncate' }, option.name)]
  }

  // Raqam faqat xonalar sifatida saqlanadi (niqobsiz), maydonda — niqob bilan
  const onPhoneInput = (idx, v) => {
    store.payload.phones[idx] = String(v ?? '')
      .replace(/\D/g, '')
      .slice(0, 9)
  }

  const addPhone = () => {
    if (store.payload.phones.length < MAX_PHONES) store.payload.phones.push('')
  }

  const removePhone = (idx) => {
    store.payload.phones.splice(idx, 1)
  }

  // Telefonlar Naive qoidasi bilan EMAS, o'zimiz tekshiriladi: form-item holati ichidagi
  // HAMMA maydonni qizil qiladi — bizga faqat xato qator qizil bo'lishi kerak.
  // Har qator — 5 xonali ichki yoki 9 xonali to'liq raqam (bo'sh qator ham xato: o'chirib qo'yiladi).
  // Xato birinchi blur / «Saqlash» dan keyin ko'rinadi, to'g'rilangan zahoti yo'qoladi.
  const phoneTouched = ref(false)
  const badPhone = (p) => p.length !== 5 && p.length !== 9
  const phoneError = computed(() =>
    phoneTouched.value && store.payload.phones.some(badPhone)
      ? t('organizationLeaderPage.invalidPhone')
      : ''
  )

  onMounted(() => {
    // Tashkilot qidiruvi umumiy (componentStore) — filtrda yozilgan matn bu yerga o'tmasin
    if (componentStore.structureParams.search) {
      componentStore.structureParams.search = null
      componentStore._structures()
    } else if (componentStore.structureList.length === 0) {
      componentStore._structures()
    }
  })

  // Tugmalar modal `#footer` da turadi (organizationLeaderPage.vue) — saqlashni
  // tashqaridan chaqirish uchun yagona yo'l.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :model="store.payload" :rules="validationRules.common">
    <!-- Tahrirlash: faqat telefonlar o'zgaradi — tepada kim ekanligi oddiy matn bilan -->
    <div v-if="!store.visibleType && store.editRow" class="mb-4 flex flex-col">
      <span class="text-[15px] font-semibold text-textColor0">{{ editWorker }}</span>
      <span class="text-xs text-textColor3">{{ store.editRow?.organization?.name }}</span>
    </div>

    <template v-if="store.visibleType">
      <n-form-item
        :label="$t(`content.organization`)"
        path="organization_id"
        rule-path="requiredMultiSelectField"
      >
        <UISelect
          :options="componentStore.structureList"
          :modelV="store.payload.organization_id"
          :checkedVal="store.structureCheck"
          @updateModel="changeOrg"
          @updateCheck="(v) => (store.structureCheck = v)"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
          :loading="componentStore.structureLoading"
          :multiple="false"
          :auto-select="true"
        />
      </n-form-item>
      <n-form-item
        :label="$t(`content.staff`)"
        path="worker_position_id"
        rule-path="requiredNumberField"
      >
        <n-select
          :disabled="store.payload.organization_id.length === 0"
          v-model:value="store.payload.worker_position_id"
          filterable
          :placeholder="$t('content.searchWorker')"
          :options="componentStore.workerList"
          label-field="name"
          value-field="id"
          :render-label="workerRenderLabel"
          :render-tag="workerRenderValue"
          :loading="componentStore.workerLoading"
          @scroll="componentStore.onScrollWorker"
          @search="componentStore.onSearchWorker"
          :reset-menu-on-options-change="false"
        />
      </n-form-item>
    </template>

    <!-- Telefonlar: har qatorda maydon + o'ngda o'chirish, pastda bitta «Raqam qo'shish» -->
    <n-form-item :label="$t('content.phone')" show-require-mark :show-feedback="false">
      <div class="w-full flex flex-col gap-2">
        <div
          v-for="(item, idx) in store.payload.phones"
          :key="idx"
          class="flex items-center gap-2"
        >
          <n-input
            :value="mask.masked(item)"
            placeholder="90-123-45-67"
            class="flex-1"
            :status="phoneTouched && badPhone(item) ? 'error' : undefined"
            @update:value="(v) => onPhoneInput(idx, v)"
            @blur="phoneTouched = true"
          />
          <n-button
            v-if="store.payload.phones.length > 1"
            quaternary
            circle
            type="error"
            :title="$t('content.delete')"
            @click="removePhone(idx)"
          >
            <template #icon>
              <n-icon :component="Delete20Regular" />
            </template>
          </n-button>
        </div>

        <div v-if="store.payload.phones.length < MAX_PHONES">
          <n-button text type="primary" @click="addPhone">
            <template #icon>
              <n-icon :component="Add16Regular" />
            </template>
            {{ $t('organizationLeaderPage.addPhone') }}
          </n-button>
        </div>
      </div>
    </n-form-item>
    <!-- Naive feedback o'rnida (xuddi shu rang/o'lcham) — faqat xato qatorlar qizil -->
    <div class="min-h-6 text-sm leading-6" :style="{ color: themeVars.errorColor }">
      {{ phoneError }}
    </div>
  </n-form>
</template>
