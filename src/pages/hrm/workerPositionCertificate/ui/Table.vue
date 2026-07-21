<script setup>
  import { UIMenuButton } from '@/components/index.js'
  import { ArrowCircleDown24Regular, AddCircle28Regular } from '@vicons/fluent'
  import { useWorkerPositionCertificateStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'

  const store = useWorkerPositionCertificateStore()

  const onAdd = () => {
    store.visibleType = true
    store.resetForm()
    store.visible = true
  }

  const onEdit = (v) => {
    store.visibleType = false
    store.elementId = v.id
    // post_name muzlagan — tahrirda faqat ko'rsatiladi (read-only), yuborilmaydi.
    store.payload.post_name = v.post_name
    store.payload.number = v.number
    store.payload.issue_date = v.issue_date
    store.payload.expiry_date = v.expiry_date
    store.payload.extended_date = v.extended_date
    // verify/returned formada YO'Q — jadvalda ko'rsatiladi, tahrirda o'zgartirilmaydi.
    store.payload.file = v.file ? { name: v.file } : null
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
        {{ $t('workerPositionCertificatePage.title') }}
      </span>
      <span v-else class="text-sm text-gray-300">
        {{ $t('workerPositionCertificatePage.no-data') }}
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
            <th class="min-w-[220px]">{{ $t('workerPositionCertificatePage.form.postName') }}</th>
            <th class="min-w-[110px]">{{ $t('workerPositionCertificatePage.form.number') }}</th>
            <th class="min-w-[110px]">{{ $t('workerPositionCertificatePage.form.issueDate') }}</th>
            <th class="min-w-[110px]">{{ $t('workerPositionCertificatePage.form.expiryDate') }}</th>
            <th class="min-w-[110px]">
              {{ $t('workerPositionCertificatePage.form.extendedDate') }}
            </th>
            <th class="min-w-[90px] w-[90px] text-center!">
              {{ $t('workerPositionCertificatePage.form.verify') }}
            </th>
            <th class="min-w-[90px] w-[90px] text-center!">
              {{ $t('workerPositionCertificatePage.form.returned') }}
            </th>
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
              <span class="text-sm">{{ item.post_name }}</span>
            </td>
            <td>
              <span class="text-sm">{{ item.number }}</span>
            </td>
            <td>
              <span class="text-sm">{{ Utils.timeOnlyDate(item.issue_date) }}</span>
            </td>
            <td>
              <span class="text-sm">{{ Utils.timeOnlyDate(item.expiry_date) }}</span>
            </td>
            <td>
              <span v-if="item.extended_date" class="text-sm">
                {{ Utils.timeOnlyDate(item.extended_date) }}
              </span>
              <span v-else class="text-xs text-gray-400">—</span>
            </td>
            <td class="text-center">
              <n-tag :type="item.verify ? 'success' : 'default'" size="small" round>
                {{ item.verify ? $t('content.yes') : $t('content.no') }}
              </n-tag>
            </td>
            <td class="text-center">
              <n-tag :type="item.returned ? 'warning' : 'default'" size="small" round>
                {{ item.returned ? $t('content.yes') : $t('content.no') }}
              </n-tag>
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
              <!-- Faqat o'z korxonasi guvohnomasi tahrirlanadi (backend `editable`).
                   Boshqa korxonaniki — read-only (tugma yashiriladi). -->
              <UIMenuButton
                v-if="item.editable"
                :data="item"
                :show-edit="true"
                @selectEv="onSelect"
              />
            </td>
          </tr>
        </tbody>
      </n-table>
    </div>
  </n-spin>
</template>

<style scoped></style>
