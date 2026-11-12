<script setup>
  import i18n from '@/i18n/index.js'
  import { validationRules } from '@utils'
  import { useDepartmentStore, useComponentStore } from '@stores'
  import { SuperSelect, UIMultipleLangItems, UISelect } from '@components'
  import UIHelper from '@utils/UIHelper.js'

  const store = useDepartmentStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)
  // i18n `legacy: true` — `useI18n()` bu yerda ishlamaydi («Not available in legacy mode»)
  const { t } = i18n.global

  const selectedOrg = ref([])
  const structureCheck = ref([])
  const orgItemRef = ref(null)

  // Bo'linma nomi — backend 255 belgidan uzunini 422 bilan qaytaradi
  const NAME_MAX = 255

  // Tashkilot majburiy: tanlanmasa backend bo'linmani bosh tashkilotga («O'zbekiston temir
  // yo'llari» AJ) biriktirib yuboradi (DAS-14220). UISelect Naive input emas — shuning uchun
  // tanlangach xato matnini qo'lda qayta tekshiramiz.
  const orgRule = {
    type: 'number',
    required: true,
    message: t('rules.requiredField'),
    trigger: ['change']
  }

  const onDefaultOrg = (v) => {
    selectedOrg.value = v
    store.payload.organization_id = v[0]?.id ?? null
  }

  // Tahrirlashda tashkilotni almashtirish mumkin (DAS-14221); backend lavozimli bo'limni rad etadi.
  const isEdit = computed(() => !store.visibleType && !store.parentElement)
  const originalOrgId = ref(null)

  const loadParents = (orgId) => {
    componentStore.depParams.organizations = orgId ? [orgId] : null
    componentStore.depParams.page = 1
    componentStore._departments()
  }

  const onChangeOrg = (v) => {
    selectedOrg.value = v
    store.payload.organization_id = v[0]?.id ?? null
    orgItemRef.value?.validate({ trigger: 'change' }).catch(() => {})
    if (!isEdit.value) return
    // Ota-bo'lim yangi tashkilotdan bo'lishi shart — eski tanlov tozalanadi.
    if (store.payload.organization_id !== originalOrgId.value) {
      store.showParent = false
      store.payload.parent_id = null
    }
    loadParents(store.payload.organization_id)
  }

  const initEditOrg = () => {
    const org = store.fixedOrganization
    if (!isEdit.value || !org?.id) return
    originalOrgId.value = org.id
    selectedOrg.value = [org]
    store.payload.organization_id = org.id
    componentStore._structures()
    loadParents(org.id)
  }

  const resetOrg = () => {
    selectedOrg.value = []
    structureCheck.value = []
    originalOrgId.value = null
    componentStore.depParams.organizations = null
  }

  // Bo'limlar sahifasi `store.visible`, Hisobot sahifasi o'z modalini ishlatadi — elementId bo'yicha ham kuzatiladi.
  watch(() => [store.elementId, store.fixedOrganization?.id], initEditOrg, { immediate: true })
  watch(
    () => store.visible,
    (v) => (v ? initEditOrg() : resetOrg())
  )
  onBeforeUnmount(resetOrg)

  const props = defineProps({
    callback: {
      type: Function,
      default: null
    }
  })

  // Tahrirlanayotgan bo'limning O'ZI ota-bo'lim ro'yxatida ko'rinmasin.
  // `componentStore.departmentList` `GET /hr/get-departments` dan to'ladi va
  // hech qanday chetlashtirish qilmaydi — prod bug (org 66, dep 849): dropdown'da
  // bo'lim nomi ("Axborot-hisoblash markazi") ostida tashkilot nomi ("Axborot
  // hisoblash markazi") chiqadi, ikkalasi deyarli bir xil ko'rinadi va foydalanuvchi
  // o'sha bo'limning o'zini tanlab qo'ygan → `parent_id = id` yozilib, bo'lim
  // ro'yxatdan ham, daraxtdan ham yo'qolgan.
  //
  // Avlodlar bu yerda chetlashtirilmaydi — frontendda daraxt ma'lumoti yo'q;
  // uni backend `assertParentAllowed` rad etadi.
  const parentOptions = computed(() =>
    (componentStore.departmentList ?? []).filter((v) => v && v.id !== store.elementId)
  )

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store._create(props.callback)
        } else {
          store._update(props.callback)
        }
      }
    })
  }

  // Tugmalar modal `#footer` da turadi (DepartmentPage.vue, report/ui/DepartmentModal.vue) —
  // saqlashni tashqaridan chaqirish uchun yagona yo'l.
  defineExpose({ submit: onSubmit })
</script>

<template>
  <n-form ref="formRef" :rules="validationRules.common" :model="store.payload">
    <div>
      <div
        v-if="store.parentElement"
        class="w-full text-sm px-2 py-2 border rounded-xl border-surface-line mb-4 flex flex-col cursor-pointer"
      >
        <span class="text-xs text-gray-500">{{ $t(`organizationPage.selectedOrg`) }}</span>
        <span class="text-primary font-bold">{{ store.parentElement?.name }}</span>
      </div>
      <!-- Ichki bo'lim qo'shishda tashkilot ota-bo'limniki bo'lishi shart — tanlab bo'lmaydi -->
      <n-form-item
        v-if="isEdit || (store.visibleType && !store.parentElement && !store.fixedOrganization)"
        ref="orgItemRef"
        :label="$t('content.organization')"
        path="organization_id"
        :rule="orgRule"
      >
        <UISelect
          :multiple="false"
          :options="componentStore.structureList"
          :model-v="selectedOrg"
          :checked-val="structureCheck"
          @updateModel="onChangeOrg"
          @defaultValue="onDefaultOrg"
          @updateCheck="(v) => (structureCheck = v)"
          :loading="componentStore.structureLoading"
          v-model:search="componentStore.structureParams.search"
          @onSearch="componentStore._structures"
        />
      </n-form-item>
      <!-- Hisobot sahifasidan qo'shishda tashkilot sahifadan olinadi — faqat ko'rsatiladi -->
      <n-form-item
        v-else-if="store.fixedOrganization"
        :label="$t('content.organization')"
      >
        <n-input :value="store.fixedOrganization?.name ?? ''" disabled />
      </n-form-item>

      <n-form-item
        :label="$t(`departmentPage.form.name`)"
        path="name"
        :rule-path="validationRules.rulesNames.requiredStringField"
      >
        <UIMultipleLangItems>
          <template #uz-content>
            <n-input type="text" v-model:value="store.payload.name" :maxlength="NAME_MAX" />
          </template>
          <template #ru-content>
            <n-input class="skip-format" type="text" v-model:value="store.payload.name_ru" :maxlength="NAME_MAX" />
          </template>
          <template #en-content>
            <n-input type="text" v-model:value="store.payload.name_en" :maxlength="NAME_MAX" />
          </template>
        </UIMultipleLangItems>
      </n-form-item>
      <n-form-item
        :label="$t(`departmentPage.form.level`)"
        path="level"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.level"
          filterable
          :options="store.levelList"
          label-field="name"
          value-field="id"
          :loading="store.levelLoading"
        />
      </n-form-item>
      <template v-if="!Boolean(store.parentElement)">
        <n-checkbox
          class="border border-surface-line w-full px-2 py-1 rounded-lg mb-4"
          v-model:checked="store.showParent"
          >{{ $t(`departmentPage.form.attachmentParent`) }}</n-checkbox
        >
        <template v-if="store.showParent">
          <n-form-item :label="$t(`departmentPage.form.parent_id`)" path="parent_id">
            <!--            <n-select-->
            <!--                v-model:value="store.payload.parent_id"-->
            <!--                filterable-->
            <!--                clearable-->
            <!--                :options="componentStore.departmentList"-->
            <!--                label-field="name"-->
            <!--                value-field="id"-->
            <!--                :loading="store.levelLoading"-->
            <!--            />-->
            <SuperSelect
              :options="parentOptions"
              v-model:value="store.payload.parent_id"
              v-model:search="componentStore.depParams.search"
              @onSearch="componentStore._onSearchDepartment"
              @onScroll="componentStore._onScrollDepartment"
              value-field="id"
              :loading="store.levelLoading"
              :render-label="UIHelper.selectRender.label"
              :render-tag="UIHelper.selectRender.value"
            />
          </n-form-item>
        </template>
      </template>

      <n-form-item :label="$t(`content.comment`)">
        <n-input :rows="2" type="textarea" v-model:value="store.payload.comment" />
      </n-form-item>

      <!-- Backend `city_id` ni majburiy qiladi (422), Tuman esa Viloyatsiz tanlanmaydi —
           shuning uchun ikkalasi ham shu yerda majburiy. -->
      <n-form-item
        :label="$t(`departmentPage.form.region`)"
        path="region_id"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          v-model:value="store.payload.region_id"
          @update:value="store.changeRegion"
          filterable
          clearable
          :options="componentStore.regionList"
          label-field="name"
          value-field="id"
          :loading="componentStore.regionLoading"
        />
      </n-form-item>
      <n-form-item
        :label="$t(`departmentPage.form.city`)"
        path="city_id"
        :rule-path="validationRules.rulesNames.requiredNumberField"
      >
        <n-select
          :disabled="!store.payload.region_id"
          v-model:value="store.payload.city_id"
          filterable
          clearable
          :options="store.districtList"
          label-field="name"
          value-field="id"
          :loading="store.districtLoading"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
