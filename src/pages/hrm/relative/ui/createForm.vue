<script setup>
  import validationRules from '@/utils/validationRules.js'
  const formRef = ref(null)
  import { useRelativeStore, useComponentStore } from '@/store/modules/index.js'
  import { useAppSetting } from '@/utils/index.js'

  const store = useRelativeStore()
  const componentStore = useComponentStore()

  const onSubmit = () => {
    formRef.value?.validate((error) => {
      if (!error) {
        store.saveLoading = true
        if (store.visibleType) {
          store.payload.worker_id = null
          store._create()
        } else {
          store._update()
        }
      }
    })
  }

  // Otasi/Onasi/Qaynotasi/Qaynonasi bittadan — qo'shilganlari turlar ro'yxatidan yashiriladi (tahrirlanayotganidan tashqari).
  const UNIQUE_TYPES = [1, 2, 10, 11]
  const relativeOptions = computed(() => {
    const editing = store.visibleType ? null : store.elementId
    const own = store.list.find((v) => v.id === editing)?.relative?.id
    const taken = new Set(
      store.list
        .filter((v) => v.id !== editing && UNIQUE_TYPES.includes(v.relative?.id))
        .map((v) => v.relative.id)
    )
    taken.delete(own)
    return componentStore.relativesList.filter((o) => !taken.has(o.id))
  })

  // Vafot etgan qarindoshda tug'ilgan sana majburiy emas (ko'pincha aniq ma'lum emas).
  const rules = computed(() => {
    if (!store.payload.died) return validationRules.relativePage
    const { birthday, ...rest } = validationRules.relativePage
    return rest
  })

  // «Vafot etgan» — JSHSHIR va yashash manzili tozalanadi; lavozim yozsa bo'ladi (obyektivkada chiqadi).
  watch(
    () => store.payload.died,
    (died) => {
      if (!died) return
      store.payload.pin = null
      store.payload.address = null
    }
  )

  onMounted(() => {
    if (componentStore.maritalList.length === 0) {
      componentStore._enums()
    }
  })
</script>

<template>
  <div style="height: calc(100vh - 120px)" class="overflow-y-auto">
    <n-form ref="formRef" :rules="rules" :model="store.payload">
      <n-form-item :label="$t(`relativePage.form.relative`)" path="relative">
        <n-select
          v-model:value="store.payload.relative"
          filterable
          :options="relativeOptions"
          label-field="name"
          value-field="id"
          :loading="componentStore.enumLoading"
        />
      </n-form-item>
      <n-form-item :show-label="false" path="died">
        <n-checkbox v-model:checked="store.payload.died">
          {{ $t('relativePage.form.died') }}
        </n-checkbox>
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.lastName`)" path="last_name">
        <n-input type="text" v-model:value="store.payload.last_name" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.firstName`)" path="first_name">
        <n-input type="text" v-model:value="store.payload.first_name" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.middleName`)" path="middle_name">
        <n-input type="text" v-model:value="store.payload.middle_name" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.birthday`)" path="birthday">
        <n-date-picker
          class="w-full"
          v-model:value="store.payload.birthday"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </n-form-item>
      <n-form-item :label="$t(`relativePage.form.post_name`)" path="post_name">
        <n-input type="text" v-model:value="store.payload.post_name" />
      </n-form-item>
      <n-form-item :label="$t(`relativePage.form.birth_place`)" path="birth_place">
        <n-input type="text" v-model:value="store.payload.birth_place" />
      </n-form-item>
      <n-form-item :label="$t(`createWorkerPage.form.address`)" path="address">
        <n-input type="text" v-model:value="store.payload.address" :disabled="store.payload.died" />
      </n-form-item>
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

<style scoped></style>
