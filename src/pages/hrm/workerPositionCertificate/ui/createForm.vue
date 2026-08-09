<script setup>
  import { ArrowSync16Regular, CloudLink16Regular } from '@vicons/fluent'
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

  // Lavozim (post_name) — TAHRIRLANADIGAN maydon.
  //  · `generatedPostName` — xodimning JORIY (faol) lavozimidan (`data.positions`
  //    backend'da status=ACTIVE bilan filtrlangan, `post_name` = korxona + bo'lim +
  //    lavozim). Computed: profil ma'lumoti kech kelsa ham to'g'ri qiymat chiqadi.
  //  · Yaratishda input SHU qiymat bilan oldindan to'ldiriladi, foydalanuvchi
  //    o'zgartirib saqlashi mumkin. Tahrirda guvohnomaning o'z qiymati keladi.
  //  · "Qayta generate" tugmasi inputni yana joriy lavozim nomiga qaytaradi.
  const generatedPostName = computed(
    () => profileStore.data?.positions?.[0]?.post_name ?? ''
  )

  // Faqat YARATISHDA va maydon bo'sh bo'lganda to'ldiramiz — foydalanuvchi
  // yozganini profil ma'lumoti kech kelib bosib ketmasin.
  watch(
    generatedPostName,
    (v) => {
      if (store.visibleType && !store.payload.post_name) store.payload.post_name = v
    },
    { immediate: true }
  )

  const onRegeneratePostName = () => {
    store.payload.post_name = generatedPostName.value
  }

  const requiredField = (type = 'string') => ({
    type,
    required: true,
    message: t('rules.requiredField'),
    trigger: ['input', 'blur-sm', 'change']
  })

  // Fayl ixtiyoriy. extended_date ixtiyoriy.
  const rules = computed(() => ({
    post_name: requiredField(),
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
      formData.append('post_name', p.post_name)
      formData.append('number', p.number)
      formData.append('issue_date', p.issue_date)
      formData.append('expiry_date', p.expiry_date)
      // Bo'sh maydonlarni yubormaymiz — backend `@IsOptional` kutadi.
      if (p.extended_date) formData.append('extended_date', p.extended_date)
      // verify/returned YUBORILMAYDI — backend default false qo'yadi.

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
    <n-form ref="formRef" :rules="rules" :model="store.payload">
      <!-- Lavozim (post_name) — generate qilingan qiymat bilan to'ldiriladi,
           foydalanuvchi tahrirlashi yoki qayta generate qilishi mumkin. -->
      <n-form-item path="post_name">
        <template #label>
          <div class="flex items-center gap-2">
            <span>{{ $t('workerPositionCertificatePage.form.postName') }}</span>
            <n-button
              text
              type="primary"
              size="tiny"
              :disabled="!generatedPostName"
              @click="onRegeneratePostName"
            >
              <template #icon>
                <ArrowSync16Regular />
              </template>
              {{ $t('workerPositionCertificatePage.form.regenerate') }}
            </n-button>
          </div>
        </template>
        <n-input
          v-model:value="store.payload.post_name"
          type="textarea"
          :autosize="{ minRows: 2, maxRows: 5 }"
          :placeholder="$t('content.enterField')"
        />
      </n-form-item>

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
  .file-name {
    display: block;
    max-width: 100%;
  }
  :deep(.n-button__content) {
    min-width: 0;
    overflow: hidden;
  }
</style>
