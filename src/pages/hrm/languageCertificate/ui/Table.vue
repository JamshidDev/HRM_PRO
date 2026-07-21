<script setup>
  import { UIMenuButton } from '@/components/index.js'
  import { ArrowCircleDown24Regular, AddCircle28Regular } from '@vicons/fluent'
  import { useLanguageCertificateStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useLanguageCertificateStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    store.payload.language_id = v.language?.id ?? null
    store.payload.certificate_type = v.certificate_type?.id ?? null
    store.payload.cefr_level = v.cefr_level
    store.payload.score = v.score
    store.payload.certificate_number = v.certificate_number
    store.payload.issue_date = v.issue_date
    store.payload.expiry_date = v.expiry_date
    store.payload.file = { name: v.file }
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onSelect = (v) => {
    if (v.key === Utils.ActionTypes.edit) {
      onEdit(v.data)
    } else if (v.key === Utils.ActionTypes.delete) {
      onDelete(v.data)
    }
  }

  const onDownload = (v) => {
    window.open(v.file, '_blank')
  }
</script>

<template>
  <n-spin :show="store.loading">
    <div
      class="w-full flex justify-between items-end border-surface-line border-dashed pb-2 mt-16"
      :class="store.list.length === 0 && 'border-b'"
    >
      <span class="text-lg font-medium" v-if="store.list.length > 0">
        {{ $t('languageCertificatePage.title') }}
      </span>
      <span v-else class="text-sm text-gray-300">
        {{ $t('languageCertificatePage.no-data') }}
      </span>

      <n-button round @click="onAdd">
        <template #icon>
          <AddCircle28Regular />
        </template>
        {{ $t(`content.add`) }}
      </n-button>
    </div>

    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
          <tr>
            <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
            <th class="min-w-[90px]">{{ $t('languageCertificatePage.form.language') }}</th>
            <th class="min-w-[160px]">{{ $t('languageCertificatePage.form.type') }}</th>
            <th class="min-w-[70px] w-[70px]">{{ $t('languageCertificatePage.form.cefr') }}</th>
            <th class="min-w-[70px] w-[70px]">{{ $t('languageCertificatePage.form.score') }}</th>
            <th class="min-w-[110px]">{{ $t('languageCertificatePage.form.issueDate') }}</th>
            <th class="min-w-[110px]">{{ $t('languageCertificatePage.form.expiryDate') }}</th>
            <th class="min-w-[80px] w-[80px]">{{ $t('content.file') }}</th>
            <th class="min-w-[40px] w-[40px]"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(item, idx) in store.list" :key="idx">
            <td>
              <span class="text-center text-[12px] text-gray-600 block">{{ idx + 1 }}</span>
            </td>
            <td>
              <span class="text-sm">{{ item.language?.name }}</span>
            </td>
            <td>
              <span class="text-sm">{{ item.certificate_type?.name }}</span>
            </td>
            <td>
              <n-tag v-if="item.cefr_level" size="small" type="info" round>
                {{ item.cefr_level }}
              </n-tag>
            </td>
            <td>
              <span class="text-sm">{{ item.score }}</span>
            </td>
            <td>
              <span class="text-sm">{{ Utils.timeOnlyDate(item.issue_date) }}</span>
            </td>
            <td>
              <!-- Muddati tugaganini server hisoblaydi (is_expired). Bo'sh = muddatsiz. -->
              <n-tag v-if="item.is_expired" size="small" type="error" round>
                {{ Utils.timeOnlyDate(item.expiry_date) }}
              </n-tag>
              <span v-else-if="item.expiry_date" class="text-sm">{{
                Utils.timeOnlyDate(item.expiry_date)
              }}</span>
              <span v-else class="text-xs text-gray-400">
                {{ $t('languageCertificatePage.unlimited') }}
              </span>
            </td>
            <td>
              <n-button v-if="item.file" @click="onDownload(item)">
                <template #icon>
                  <ArrowCircleDown24Regular />
                </template>
                {{ $t('content.download') }}
              </n-button>
            </td>
            <td>
              <UIMenuButton :data="item" :show-edit="true" @selectEv="onSelect" />
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>

<style scoped></style>
