<script setup>
  import validationRules from '@/utils/validationRules.js'
  import { CloudLink16Regular } from '@vicons/fluent'
  import { useLanguageCertificateStore, useComponentStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useLanguageCertificateStore()
  const componentStore = useComponentStore()
  const formRef = ref(null)
  const inputFileRef = ref(null)

  // Til o'zgarsa — mos kelmay qolgan sertifikat turi tozalanadi.
  const onLanguageChange = () => {
    store.onLanguageChange()
  }

  // Tur o'zgarsa — unga to'g'ri kelmaydigan qiymatlar tozalanadi:
  //  · malaka sertifikati (CELTA, TKT...) til darajasini bermaydi → CEFR;
  //  · yangi turda mavjud bo'lmagan daraja (DSD I faqat B1) → CEFR;
  //  · ball so'ralmaydigan turda (HSK, Milliy) → score.
  const onTypeChange = () => {
    const allowed = store.allowedCefrList.map((v) => v.name)
    if (store.isQualification || !allowed.includes(store.payload.cefr_level)) {
      store.payload.cefr_level = null
    }
    if (!store.showScore) store.payload.score = null
  }

  // Til + tur umumiy faylda (statik), qolganlari SHU YERDA — ular tanlangan
  // sertifikat turiga bog'liq: malaka turlarida daraja so'ralmaydi, ball esa
  // faqat raqamli natija beradigan turlarda (3318, 2-ilova).
  const requiredField = (type = 'string') => ({
    type,
    required: true,
    message: t('rules.requiredField'),
    trigger: ['input', 'blur-sm', 'change']
  })

  const rules = computed(() => {
    const base = { ...validationRules.languageCertificatePage }
    if (!store.showDetails) return base
    return {
      ...base,
      ...(store.isQualification ? {} : { cefr_level: requiredField() }),
      ...(store.showScore ? { score: requiredField() } : {}),
      certificate_number: requiredField(),
      issue_date: requiredField(),
      expiry_date: requiredField(),
      file: requiredField('any')
    }
  })

  // Qaror (3318) faqat XORIJIY tillarni qamraydi — o'zbek/tojik/qozoq/turkman
  // uchun birorta sertifikat turi yo'q. Ularni ro'yxatda qoldirsak, tanlangach
  // tur select'i bo'sh ochilib, sababi tushuntirilmasdi.
  const languageOptions = computed(() => {
    const covered = new Set(store.typeList.flatMap((t) => t.language_ids ?? []))
    if (!covered.size) return componentStore.languageList
    return componentStore.languageList.filter((l) => covered.has(l.id))
  })

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      const p = store.payload
      const formData = new FormData()
      if (store.visibleType) formData.append('uuid', store.uuid)
      formData.append('language_id', p.language_id)
      formData.append('certificate_type', p.certificate_type)
      // Bo'sh maydonlarni yubormaymiz — backend `@IsOptional` kutadi.
      if (p.cefr_level) formData.append('cefr_level', p.cefr_level)
      if (p.score) formData.append('score', p.score)
      if (p.certificate_number) formData.append('certificate_number', p.certificate_number)
      if (p.issue_date) formData.append('issue_date', p.issue_date)
      if (p.expiry_date) formData.append('expiry_date', p.expiry_date)

      store.saveLoading = true
      if (store.visibleType) {
        formData.append('file', p.file ?? '')
        store._create(formData)
      } else {
        formData.append('file', p.file?.size ? p.file : '')
        store._update(formData)
      }
    })
  }

  const onUpload = (v) => {
    store.payload.file = v.target.files[0]
  }
  const onFile = () => {
    inputFileRef.value.click()
  }

  onMounted(() => {
    store._enums()
    if (componentStore.languageList.length === 0) componentStore._enums()
  })
</script>

<template>
  <div style="height: calc(100vh - 120px)" class="overflow-y-auto">
    <n-form ref="formRef" :rules="rules" :model="store.payload">
      <n-form-item :label="$t(`languageCertificatePage.form.language`)" path="language_id">
        <n-select
          v-model:value="store.payload.language_id"
          filterable
          :options="languageOptions"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
          @update:value="onLanguageChange"
        />
      </n-form-item>

      <!-- Tanlangan tilga qarab filtrlanadi. Milliy sertifikat faqat qaror
           qamragan tillarda chiqadi (O'zbek/Tojik/Qozoq/Turkman'da — yo'q). -->
      <n-form-item :label="$t(`languageCertificatePage.form.type`)" path="certificate_type">
        <n-select
          v-model:value="store.payload.certificate_type"
          filterable
          :options="store.filteredTypeList"
          label-field="name"
          value-field="id"
          :loading="store.typeLoading"
          :disabled="!store.payload.language_id"
          @update:value="onTypeChange"
        />
      </n-form-item>

      <!-- Qolgan maydonlar til + tur tanlangandan keyin ochiladi: qaysi maydon
           kerakligi aynan sertifikat turiga bog'liq (3318, 2-ilova). -->
      <template v-if="store.showDetails">
        <!-- Daraja + sertifikat raqami (6 + 6). -->
        <div class="grid grid-cols-12 gap-2">
          <!-- Malaka sertifikatlarida daraja bo'lmaydi — select bloklanadi. -->
          <div class="col-span-12 md:col-span-6">
            <n-form-item :label="$t(`languageCertificatePage.form.cefr`)" path="cefr_level">
              <n-select
                v-model:value="store.payload.cefr_level"
                :options="store.allowedCefrList"
                label-field="name"
                value-field="name"
                clearable
                :disabled="store.isQualification"
                :placeholder="
                  store.isQualification
                    ? $t('languageCertificatePage.qualificationHint')
                    : $t('content.choose')
                "
              />
            </n-form-item>
          </div>

          <div class="col-span-12 md:col-span-6">
            <n-form-item
              :label="$t(`languageCertificatePage.form.certificateNumber`)"
              path="certificate_number"
            >
              <n-input v-model:value="store.payload.certificate_number" />
            </n-form-item>
          </div>
        </div>

        <!-- Sanalar yonma-yon (6 + 6 ustun). -->
        <div class="grid grid-cols-12 gap-2">
          <div class="col-span-12 md:col-span-6">
            <n-form-item :label="$t(`languageCertificatePage.form.issueDate`)" path="issue_date">
              <n-date-picker
                v-model:formatted-value="store.payload.issue_date"
                value-format="yyyy-MM-dd"
                :format="useAppSetting.datePicketFormat"
                type="date"
                class="w-full"
                clearable
              />
            </n-form-item>
          </div>

          <div class="col-span-12 md:col-span-6">
            <n-form-item :label="$t(`languageCertificatePage.form.expiryDate`)" path="expiry_date">
              <n-date-picker
                v-model:formatted-value="store.payload.expiry_date"
                value-format="yyyy-MM-dd"
                :format="useAppSetting.datePicketFormat"
                type="date"
                class="w-full"
                clearable
              />
            </n-form-item>
          </div>
        </div>

        <!-- Ball + sertifikat fayli bitta qatorda. Ball faqat raqamli natija
             beradigan turlarda (IELTS, TOEIC, Test DAF) — HSK/N2/ТРКИ da natija
             darajadan kelib chiqadi, Milliy/DELE da ball tushunchasi yo'q.
             Ball yashiringanda fayl to'liq kenglikni oladi. -->
        <div class="grid grid-cols-12 gap-2">
          <div v-if="store.showScore" class="col-span-12 md:col-span-6">
            <n-form-item :label="$t(`languageCertificatePage.form.score`)" path="score">
              <n-input
                v-model:value="store.payload.score"
                :placeholder="$t('content.enterField')"
              />
            </n-form-item>
          </div>

          <!-- min-w-0: uzun fayl nomi katakni (va butun formani) kengaytirib
               gorizontal scroll yaratmasligi uchun — grid item default
               min-width:auto bo'lib, kontent kengligidan pastga qisqara olmaydi. -->
          <div
            class="col-span-12 min-w-0"
            :class="store.showScore ? 'md:col-span-6' : 'md:col-span-12'"
          >
            <n-form-item :label="$t(`content.file`)" path="file">
              <n-button @click="onFile" class="w-full" style="max-width: 100%">
                <template #icon>
                  <CloudLink16Regular />
                </template>
                <!-- truncate + min-w-0: uzun nom "..." bilan qisqaradi (flex ichida
                     min-width:0 bo'lmasa kontent kengligidan qisqarmaydi). -->
                <span class="file-name truncate min-w-0">
                  {{
                    store.payload.file?.name
                      ? store.payload.file?.size
                        ? store.payload.file?.name
                        : Utils.fileNameFromUrl(store.payload.file?.name)
                      : $t('languageCertificatePage.form.certificateFile')
                  }}
                </span>
              </n-button>
              <input @change="onUpload" type="file" v-show="false" ref="inputFileRef" />
            </n-form-item>
          </div>
        </div>
      </template>
    </n-form>
  </div>

  <div class="grid grid-cols-2 gap-2">
    <n-button @click="store.openVisible(false)" type="error" ghost>
      {{ $t('content.cancel') }}
    </n-button>
    <n-button @click="onSubmit" :loading="store.saveLoading" type="primary">
      {{ $t('content.save') }}
    </n-button>
  </div>
</template>

<style scoped>
  /* n-button ichidagi kontent (ikonka + nom) flex — nom qisqarishi uchun
   uni ham min-width:0 va overflow-hidden qilamiz, aks holda span truncate
   bo'lsa ham tugma kontenti kengayib ketadi (Naive UI versiyasidan qat'i nazar). */
  .file-name {
    display: block;
    max-width: 100%;
  }
  :deep(.n-button__content) {
    min-width: 0;
    overflow: hidden;
  }
</style>
