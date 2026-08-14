<script setup>
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import icons from '@/assets/icons'
  import i18n from '@/i18n/index.js'
  import { UIDeleteConfirm, UIProfileButton } from '@/components/index.js'
  import ProfileBlock from '../ProfileBlock.vue'
  import ProfileField from '../ProfileField.vue'
  import { useWorkerProfileStore } from '@/store/modules/index.js'

  /**
   * Figma "Pasport ma'lumotlar" (node 2609:73390) va "Xorijga chiqish pasporti"
   * (node 2810:73691) bloklari — maydonlar to'plamidan tashqari bir xil.
   */
  const props = defineProps({
    item: { type: Object, required: true },
    foreign: { type: Boolean, default: false }
  })

  const { t } = i18n.global
  const store = useWorkerProfileStore()
  // `item` — store ro'yxatidagi yozuvning o'zi; blok uni joyida tahrirlaydi,
  // shu bois maydonlar shu havola orqali yoziladi (prop'ni to'g'ridan-to'g'ri emas).
  const row = computed(() => props.item)

  const editing = ref(!row.value.exist) // yangi qo'shilgan yozuv darrov tahrirda ochiladi
  const fileRef = ref(null)
  const deleteVisible = ref(false)

  const loading = computed(() =>
    props.foreign ? store.foreignPassportLoading : store.passportLoading
  )

  const fileLabel = computed(() => {
    const name = row.value.file?.name
    if (!name) return t('universityPage.form.file')
    return row.value.file?.size ? name : Utils.fileNameFromUrl(name)
  })

  const hasStoredFile = computed(() => Boolean(row.value.file?.name && !row.value.file?.size))

  const onPickFile = () => fileRef.value?.click()
  const onFileChange = (e) => {
    const file = e.target.files?.[0]
    if (file) row.value.file = file
  }

  const onDownload = () => window.open(row.value.file.name, '_blank')

  const onDelete = () => {
    deleteVisible.value = false
    if (!row.value.exist) {
      if (props.foreign) {
        store.foreignPassportList = store.foreignPassportList.filter((x) => x.id !== row.value.id)
      } else {
        store.passportList = store.passportList.filter((x) => x.id !== row.value.id)
      }
      return
    }
    props.foreign ? store._deleteForeignPassport(row.value.id) : store._deletePassport(row.value.id)
  }

  const onCancel = () => {
    editing.value = false
    props.foreign ? store._indexForeignPassport() : store._indexPassport()
  }

  const onSave = () => {
    const { serial_number, from_date, to_date, address, given_place, file, exist, id } = row.value
    const secondField = props.foreign ? given_place : address

    if (!serial_number || !from_date || !to_date || !secondField) {
      $Toast.warning(t('message.warning-data'))
      return
    }

    const formData = new FormData()
    formData.append('worker_id', store.workerId)
    formData.append('serial_number', serial_number)
    formData.append('from_date', Utils.timeToZone(from_date))
    formData.append('to_date', Utils.timeToZone(to_date))
    formData.append(props.foreign ? 'given_place' : 'address', secondField)
    if (file?.size) formData.append('file', file)

    if (props.foreign) {
      exist ? store._updateForeignPassport(formData, id) : store._storeForeignPassport(formData)
    } else {
      exist ? store._updatePassport(formData, id) : store._storePassport(formData)
    }
    editing.value = false
  }
</script>

<template>
  <ProfileBlock
    :title="
      foreign
        ? $t('createWorkerPage.form.foreignPassportTitle')
        : $t('createWorkerPage.form.passportTitle')
    "
    :icon="icons.figIdCard"
  >
    <div class="profile-grid">
      <ProfileField
        :label="$t('createWorkerPage.form.serial_number')"
        :value="row.serial_number"
        :editing="editing"
      >
        <n-input v-model:value="row.serial_number" v-mask="`AA #######`" class="w-full" />
      </ProfileField>

      <ProfileField
        v-if="foreign"
        :label="$t('createWorkerPage.form.given_place')"
        :value="row.given_place"
        :editing="editing"
      >
        <n-input v-model:value="row.given_place" class="w-full" />
      </ProfileField>

      <ProfileField
        :label="$t('createWorkerPage.form.from_date')"
        :value="Utils.timeOnlyDate(row.from_date)"
        :editing="editing"
      >
        <n-date-picker
          v-model:value="row.from_date"
          class="w-full"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </ProfileField>

      <ProfileField
        :label="$t('createWorkerPage.form.to_date')"
        :value="Utils.timeOnlyDate(row.to_date)"
        :editing="editing"
      >
        <n-date-picker
          v-model:value="row.to_date"
          class="w-full"
          type="date"
          :format="useAppSetting.datePicketFormat"
        />
      </ProfileField>

      <ProfileField
        v-if="!foreign"
        :label="$t('createWorkerPage.form.citizenship')"
        :value="row.address"
        :editing="editing"
      >
        <n-input v-model:value="row.address" class="w-full" />
      </ProfileField>

      <!-- Maketda oxirgi katak — punktir chegarali fayl qutisi -->
      <div class="flex items-end">
        <button type="button" class="file-box" :disabled="!editing" @click="onPickFile">
          <n-icon :size="24" class="text-fig-text-tertiary">
            <component :is="icons.figImagePlus" />
          </n-icon>
          <span class="text-xs leading-4 text-fig-text-tertiary text-center truncate w-full">
            {{ fileLabel }}
          </span>
        </button>
        <input ref="fileRef" type="file" accept=".pdf" class="hidden" @change="onFileChange" />
      </div>
    </div>

    <template #actions>
      <template v-if="editing">
        <UIProfileButton variant="danger" :icon="icons.figTrash" @click="deleteVisible = true">
          {{ $t('content.delete') }}
        </UIProfileButton>
        <UIProfileButton variant="danger" @click="onCancel">
          {{ $t('content.cancel') }}
        </UIProfileButton>
        <UIProfileButton :loading="loading" @click="onSave">
          {{ $t('content.save') }}
        </UIProfileButton>
      </template>
      <template v-else>
        <UIProfileButton variant="danger" :icon="icons.figTrash" @click="deleteVisible = true">
          {{ $t('content.delete') }}
        </UIProfileButton>
        <UIProfileButton
          v-if="hasStoredFile"
          variant="success"
          :icon="icons.figDownload"
          @click="onDownload"
        >
          {{ $t('content.download') }}
        </UIProfileButton>
        <UIProfileButton @click="editing = true">{{ $t('content.edit') }}</UIProfileButton>
      </template>
    </template>
  </ProfileBlock>

  <UIDeleteConfirm v-model:visible="deleteVisible" @confirm="onDelete" />
</template>

<style lang="scss" scoped>
  .profile-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    width: 100%;
  }

  .file-box {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    width: 100%;
    height: 64px;
    padding: 8px;
    border: 1px dashed var(--fig-br-disable);
    border-radius: 16px;
    background: var(--fig-bg-disable);
    cursor: pointer;

    &:disabled {
      cursor: default;
    }
  }

  @media (max-width: 976px) {
    .profile-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 480px) {
    .profile-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
