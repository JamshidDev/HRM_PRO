<script setup>
  import { CloudLink16Regular } from '@vicons/fluent'
  import {
    useWorkerPositionCertificateStore,
    useWorkerProfileStore
  } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global

  const store = useWorkerPositionCertificateStore()
  const profileStore = useWorkerProfileStore()
  const formRef = ref(null)
  const inputFileRef = ref(null)

  // Lavozim (post_name) — read-only card'da ko'rsatiladi, forma YUBORMAYDI.
  //  · Yaratishda: xodimning JORIY (faol) lavozimidan REACTIVE olinadi
  //    (`data.positions` backend'da status=ACTIVE bilan filtrlangan, har birida
  //    `post_name` = korxona + bo'lim + lavozim). Computed bo'lgani uchun har
  //    xodimga to'g'ri yangilanadi (onMounted stale qilardi).
  //  · Tahrirda: guvohnomaning muzlagan qiymati (qatordan).
  const postNamePreview = computed(() =>
    store.visibleType
      ? (profileStore.data?.positions?.[0]?.post_name ?? null)
      : store.payload.post_name
  )

  const requiredField = (type = 'string') => ({
    type,
    required: true,
    message: t('rules.requiredField'),
    trigger: ['input', 'blur-sm', 'change']
  })

  // post_name backend'da joriy lavozimdan generate qilinadi — forma so'ramaydi.
  // Fayl ixtiyoriy. extended_date ixtiyoriy.
  const rules = computed(() => ({
    number: requiredField(),
    issue_date: requiredField(),
    expiry_date: requiredField()
  }))

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (error) return
      const p = store.payload
      const formData = new FormData()
      if (store.visibleType) formData.append('uuid', store.uuid)
      formData.append('number', p.number)
      formData.append('issue_date', p.issue_date)
      formData.append('expiry_date', p.expiry_date)
      // Bo'sh maydonlarni yubormaymiz — backend `@IsOptional` kutadi.
      if (p.extended_date) formData.append('extended_date', p.extended_date)
      // verify/returned YUBORILMAYDI — backend default false qo'yadi.
      // post_name ham yuborilmaydi — backend joriy lavozimdan generate qiladi.

      store.saveLoading = true
      if (store.visibleType) {
        formData.append('file', p.file ?? '')
        store._create(formData)
      } else {
        // Tahrirda faqat YANGI fayl (size bor) yuboriladi; eski yo'l o'zgarmaydi.
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
</script>

<template>
  <div style="height: calc(100vh - 120px)" class="overflow-y-auto">
    <!-- Lavozim (post_name) — read-only CARD. Yaratishda joriy faol lavozimdan,
         tahrirda muzlagan qiymatdan. Backend generate qiladi, forma tegmaydi. -->
    <div class="post-name-card">
      <div class="post-name-card__label">
        {{ $t('workerPositionCertificatePage.form.postName') }}
      </div>
      <div class="post-name-card__value">{{ postNamePreview || '—' }}</div>
    </div>

    <n-form ref="formRef" :rules="rules" :model="store.payload">
      <!-- Guvohnoma raqami -->
      <n-form-item :label="$t(`workerPositionCertificatePage.form.number`)" path="number">
        <n-input v-model:value="store.payload.number" :placeholder="$t('content.enterField')" />
      </n-form-item>

      <!-- Berilgan / amal qilish muddati (6 + 6). -->
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12 md:col-span-6">
          <n-form-item
            :label="$t(`workerPositionCertificatePage.form.issueDate`)"
            path="issue_date"
          >
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
          <n-form-item
            :label="$t(`workerPositionCertificatePage.form.expiryDate`)"
            path="expiry_date"
          >
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

      <!-- Uzaytirilgan sana (ixtiyoriy) + fayl. -->
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-12 md:col-span-6">
          <n-form-item :label="$t(`workerPositionCertificatePage.form.extendedDate`)">
            <n-date-picker
              v-model:formatted-value="store.payload.extended_date"
              value-format="yyyy-MM-dd"
              :format="useAppSetting.datePicketFormat"
              type="date"
              class="w-full"
              clearable
            />
          </n-form-item>
        </div>

        <div class="col-span-12 min-w-0 md:col-span-6">
          <n-form-item :label="$t(`content.file`)">
            <n-button @click="onFile" class="w-full" style="max-width: 100%">
              <template #icon>
                <CloudLink16Regular />
              </template>
              <span class="file-name truncate min-w-0">
                {{
                  store.payload.file?.name
                    ? store.payload.file?.size
                      ? store.payload.file?.name
                      : Utils.fileNameFromUrl(store.payload.file?.name)
                    : $t('workerPositionCertificatePage.form.certificateFile')
                }}
              </span>
            </n-button>
            <input @change="onUpload" type="file" v-show="false" ref="inputFileRef" />
          </n-form-item>
        </div>
      </div>
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
  /* Lavozim (post_name) read-only card — korxona + bo'lim + lavozim. */
  .post-name-card {
    border: 1px solid var(--n-border-color, #e5e7eb);
    border-radius: 10px;
    padding: 12px 14px;
    margin-bottom: 16px;
    background: var(--n-color-embedded, rgba(0, 0, 0, 0.02));
  }
  .post-name-card__label {
    font-size: 12px;
    color: #9ca3af;
    margin-bottom: 4px;
  }
  .post-name-card__value {
    font-size: 14px;
    font-weight: 500;
    line-height: 1.4;
    word-break: break-word;
  }

  .file-name {
    display: block;
    max-width: 100%;
  }
  :deep(.n-button__content) {
    min-width: 0;
    overflow: hidden;
  }
</style>
