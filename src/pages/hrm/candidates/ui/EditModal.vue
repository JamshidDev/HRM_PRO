<script setup>
  // Nomzodni tahrirlash: F.I.Sh., JSHSHIR va asosiy telefon.
  // Oyna Bo'linmalar / Tibbiy ko'rik «Qo'shish» oynasi qolipida: sarlavha + ✕, oddiy maydonlar,
  // pastda «Bekor qilish» / «Saqlash»; o'lcham qat'iy, ichi aylanadi.
  // Backend'da alohida endpoint yo'q — profil «Saqlash» bilan bir xil yo'l: xodim to'liq yuklanadi
  // (`GET /worker-positions/{uuid}/edit`), faqat F.I.Sh., JSHSHIR va asosiy telefon almashtiriladi va
  // to'liq tana `PUT /workers/{id}` ga yuboriladi (workerProfileStore.buildBodyData bilan bir xil shakl).
  import { UIModal } from '@/components/index.js'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import { isValidPinfl } from '@/utils/pinfl.js'

  const { t } = i18n.global
  const visible = defineModel('visible', { type: Boolean, default: false })
  const props = defineProps({ row: { type: Object, default: null } })
  const emit = defineEmits(['saved'])

  const formRef = ref(null)
  const formKey = ref(0)
  const loading = ref(false)
  const saving = ref(false)
  const detail = ref(null)
  const form = reactive({ last_name: '', first_name: '', middle_name: '', pin: '', phone: '+998' })

  const digits = (v) => String(v ?? '').replace(/\D/g, '')

  // Profil bilan bir xil: profil bo'lsa — login telefoni asosiy, aks holda birinchisi.
  const mainPhoneIndex = (d) => {
    const list = Array.isArray(d?.phones) ? d.phones : []
    if (!list.length) return -1
    const i = d.profile ? list.findIndex((p) => String(p.phone) === String(d.profile.phone)) : 0
    return i < 0 ? 0 : i
  }

  // v-mask faqat yozilganda formatlaydi — boshlang'ich qiymat shu yerda mask ko'rinishiga keltiriladi.
  const fill = (src, pin, phone) => {
    form.last_name = src?.last_name ?? ''
    form.first_name = src?.first_name ?? ''
    form.middle_name = src?.middle_name ?? ''
    const n = digits(pin)
    form.pin = [n.slice(0, 4), n.slice(4, 8), n.slice(8, 12), n.slice(12, 14)].filter(Boolean).join('-')
    const p = digits(phone).replace(/^998(?=\d{9}$)/, '')
    const parts = [p.slice(0, 2), p.slice(2, 5), p.slice(5, 7), p.slice(7, 9)].filter(Boolean)
    form.phone = `+998${parts.join('-')}`
  }

  const open = () => {
    formKey.value++
    detail.value = null
    fill(props.row, props.row?.pin, props.row?.phone)
    loading.value = true
    $ApiService.workerService
      ._show({ id: props.row.uuid })
      .then((res) => {
        if (!visible.value) return
        const d = res.data.data
        detail.value = d
        const i = mainPhoneIndex(d)
        fill(d, d.pin, i >= 0 ? d.phones[i].phone : props.row?.phone)
      })
      .catch(() => (visible.value = false))
      .finally(() => (loading.value = false))
  }
  watch(visible, (v) => v && props.row && open())

  const required = { required: true, trigger: ['blur', 'input'], message: t('rules.requiredField') }
  const rules = {
    last_name: required,
    first_name: required,
    pin: {
      trigger: ['blur', 'input'],
      validator: (_, v) => {
        if (!digits(v)) return new Error(t('rules.requiredJSHSHIR'))
        if (!isValidPinfl(digits(v))) return new Error(t('rules.unExpectedFormat'))
        return true
      }
    },
    phone: {
      trigger: ['blur', 'input'],
      validator: (_, v) => {
        const p = digits(v).replace(/^998/, '')
        if (!p) return new Error(t('rules.phone'))
        if (p.length !== 9) return new Error(t('rules.unExpectedFormat'))
        return true
      }
    }
  }

  const toZone = (v) => (v ? Utils.timeToZone(new Date(v).getTime()) : null)

  const buildBody = (d, names, pin, phone) => {
    const list = Array.isArray(d.phones) ? d.phones.map((p) => String(p.phone)) : []
    const i = mainPhoneIndex(d)
    if (i >= 0) list[i] = phone
    else list.unshift(phone)
    return {
      ...names,
      birthday: toZone(d.birthday),
      country_id: d.country?.id ?? null,
      region_id: d.region?.id ?? null,
      city_id: d.city?.id ?? null,
      current_region_id: d.current_region?.id ?? null,
      current_city_id: d.current_city?.id ?? null,
      nationality_id: d.nationality?.id ?? null,
      sex: d.sex,
      address: d.address,
      inn: null,
      marital_status: d.marital_status?.id ?? null,
      work_experience: d.work_experience?.toString() ?? null,
      experience_date: toZone(d.experience_date),
      education: d.education,
      table_number: d.table_number?.toString() || null,
      company_funded_education: Boolean(d.company_funded_education),
      pin,
      user_phone: phone,
      phones: [...new Set(list)]
    }
  }

  const onSave = () => {
    formRef.value?.validate((errors) => {
      if (errors) return
      const names = {
        last_name: form.last_name.trim(),
        first_name: form.first_name.trim(),
        middle_name: form.middle_name?.trim() || null
      }
      const pin = digits(form.pin)
      const phone = digits(form.phone).replace(/^998/, '')
      if (!detail.value) return
      saving.value = true
      $ApiService.workerService
        ._update({ id: detail.value.id, data: buildBody(detail.value, names, pin, phone) })
        .then(() => {
          emit('saved')
          visible.value = false
        })
        .finally(() => (saving.value = false))
    })
  }
</script>

<template>
  <UIModal
    v-model:visible="visible"
    :title="$t('workerPage.candidates.edit')"
    width="min(700px, calc(100vw - 32px))"
    height="min(85vh, 400px)"
  >
    <n-spin :show="loading" class="w-full">
      <n-form :key="formKey" ref="formRef" :model="form" :rules="rules" :disabled="loading">
        <!-- 1-qator: F.I.Sh. -->
        <div class="grid grid-cols-12 gap-x-4">
          <n-form-item class="col-span-12 md:col-span-4" :label="$t('createWorkerPage.form.lastName')" path="last_name">
            <n-input v-model:value="form.last_name" />
          </n-form-item>
          <n-form-item class="col-span-12 md:col-span-4" :label="$t('createWorkerPage.form.firstName')" path="first_name">
            <n-input v-model:value="form.first_name" />
          </n-form-item>
          <n-form-item class="col-span-12 md:col-span-4" :label="$t('createWorkerPage.form.middleName')" path="middle_name">
            <n-input v-model:value="form.middle_name" />
          </n-form-item>
        </div>
        <!-- 2-qator: JSHSHIR va telefon — yonma-yon -->
        <div class="grid grid-cols-12 gap-x-4">
          <n-form-item class="col-span-12 md:col-span-6" :label="$t('workerPage.candidates.pin')" path="pin">
            <n-input v-model:value="form.pin" v-mask="`####-####-####-##`" />
          </n-form-item>
          <n-form-item class="col-span-12 md:col-span-6" :label="$t('workerPage.candidates.phone')" path="phone">
            <n-input v-model:value="form.phone" v-mask="`+998##-###-##-##`" />
          </n-form-item>
        </div>
      </n-form>
    </n-spin>

    <template #footer>
      <div class="flex justify-end gap-2 px-4 pb-2">
        <n-button type="error" ghost class="w-[130px]" @click="visible = false">
          {{ $t('content.cancel') }}
        </n-button>
        <n-button
          type="primary"
          class="w-[130px]"
          :loading="saving || undefined"
          :disabled="loading"
          @click="onSave"
        >
          {{ $t('content.save') }}
        </n-button>
      </div>
    </template>
  </UIModal>
</template>
