<script setup>
  import { UIBadge, UIModal } from '@/components/index.js'
  import { ArrowCircleDown24Regular } from '@vicons/fluent'
  import { useWorkerCertificateStore } from '@stores'
  import { Utils } from '@utils'

  const store = useWorkerCertificateStore()

  const fullName = computed(() => {
    const w = store.showWorker
    if (!w) return ''
    return [w.last_name, w.first_name, w.middle_name].filter(Boolean).join(' ')
  })

  const onDownload = (item) => {
    window.open(item.file, '_blank')
  }
</script>

<template>
  <UIModal
    v-model:visible="store.showVisible"
    :title="fullName"
    width="1000px"
    :persistent="false"
  >
    <n-spin :show="store.showLoading">
      <!-- Ro'yxat sahifasida faqat OXIRGI guvohnoma ko'rinadi — bu yerda hammasi,
           eskidan yangiga (backend `id` bo'yicha qaytaradi). -->
      <div class="w-full overflow-x-auto min-h-[120px]">
        <n-table :single-line="false" size="small" v-if="store.showList.length > 0">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="min-w-[220px]">
                {{ $t('workerPositionCertificatePage.form.postName') }}
              </th>
              <th class="min-w-[110px]">
                {{ $t('workerPositionCertificatePage.form.number') }}
              </th>
              <th class="min-w-[110px]">
                {{ $t('workerPositionCertificatePage.form.issueDate') }}
              </th>
              <th class="min-w-[110px]">
                {{ $t('workerPositionCertificatePage.form.expiryDate') }}
              </th>
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
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in store.showList" :key="item.id ?? idx">
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
                <!-- Qiymat yo'q bo'lsa katak BO'SH qoladi (to'ldiruvchi belgi yo'q). -->
                <span v-if="item.extended_date" class="text-sm">
                  {{ Utils.timeOnlyDate(item.extended_date) }}
                </span>
              </td>
              <td>
                <UIBadge
                  class="justify-center"
                  :label="item.verify ? $t('content.yes') : $t('content.no')"
                  :type="item.verify ? Utils.colorTypes.success : Utils.colorTypes.dark"
                />
              </td>
              <td>
                <UIBadge
                  class="justify-center"
                  :label="item.returned ? $t('content.yes') : $t('content.no')"
                  :type="item.returned ? Utils.colorTypes.warning : Utils.colorTypes.dark"
                />
              </td>
              <td>
                <n-button v-if="item.file" size="small" @click="onDownload(item)">
                  <template #icon>
                    <ArrowCircleDown24Regular />
                  </template>
                  {{ $t('content.download') }}
                </n-button>
              </td>
            </tr>
          </tbody>
        </n-table>

        <div
          v-else-if="!store.showLoading"
          class="w-full py-10 text-center text-sm text-gray-400"
        >
          {{ $t('workerPositionCertificatePage.no-data') }}
        </div>
      </div>
    </n-spin>
  </UIModal>
</template>
