<script setup>
  import { useCommandStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import validationRules from '@/utils/validationRules.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useCommandStore()
  const formRef = ref(null)

  const onSubmit = async (mainData) => {
    let data = null
    await formRef.value?.validate(async (error) => {
      if (!error) {
        data = {
          ...mainData,
          new_last_name: store.form_74.new_last_name,
          new_first_name: store.form_74.new_first_name,
          new_middle_name: store.form_74.new_middle_name,
          change_date: Utils.timeToZone(store.form_74.change_date),
          passport_authority: store.form_74.passport_authority,
          passport_serial: store.form_74.passport_serial,
          passport_date: Utils.timeToZone(store.form_74.passport_date),
          certificate_serial: store.form_74.certificate_serial,
          certificate_date: Utils.timeToZone(store.form_74.certificate_date)
        }
      } else {
        data = null
      }
    })
    return {
      data: data,
      isValid: Boolean(data)
    }
  }

  const validateForm = async () => {
    await formRef.value?.validate()
  }

  defineExpose({
    onSubmit,
    validateForm
  })
</script>

<template>
  <n-form
    ref="formRef"
    :model="store.form_74"
    :rules="validationRules.form_74"
    class="grid grid-cols-12 mb-8 gap-x-4 border border-surface-line border-dashed p-2 rounded-md bg-surface-ground"
  >
    <!-- Yangi F.I.Sh -->
    <div class="col-span-12 md:col-span-4">
      <n-form-item :label="$t(`documentPage.command.form.new_last_name`)" path="new_last_name">
        <n-input class="w-full" type="text" v-model:value="store.form_74.new_last_name" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-4">
      <n-form-item :label="$t(`documentPage.command.form.new_first_name`)" path="new_first_name">
        <n-input class="w-full" type="text" v-model:value="store.form_74.new_first_name" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-4">
      <n-form-item :label="$t(`documentPage.command.form.new_middle_name`)" path="new_middle_name">
        <n-input class="w-full" type="text" v-model:value="store.form_74.new_middle_name" />
      </n-form-item>
    </div>

    <!-- Kuchga kirish sanasi -->
    <div class="col-span-12 md:col-span-4">
      <n-form-item :label="$t(`documentPage.command.form.change_date`)" path="change_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_74.change_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>

    <!-- Passport -->
    <div class="col-span-12 md:col-span-4">
      <n-form-item
        :label="$t(`documentPage.command.form.passport_authority`)"
        path="passport_authority"
      >
        <n-input class="w-full" type="text" v-model:value="store.form_74.passport_authority" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-4">
      <n-form-item :label="$t(`documentPage.command.form.passport_serial`)" path="passport_serial">
        <n-input class="w-full" type="text" v-model:value="store.form_74.passport_serial" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-4">
      <n-form-item :label="$t(`documentPage.command.form.passport_date`)" path="passport_date">
        <n-date-picker
          class="w-full"
          v-model:value="store.form_74.passport_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>

    <!-- Guvohnoma (asos) -->
    <div class="col-span-12 md:col-span-4">
      <n-form-item
        :label="$t(`documentPage.command.form.certificate_serial`)"
        path="certificate_serial"
      >
        <n-input class="w-full" type="text" v-model:value="store.form_74.certificate_serial" />
      </n-form-item>
    </div>
    <div class="col-span-12 md:col-span-4">
      <n-form-item
        :label="$t(`documentPage.command.form.certificate_date`)"
        path="certificate_date"
      >
        <n-date-picker
          class="w-full"
          v-model:value="store.form_74.certificate_date"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
    </div>
  </n-form>
</template>
