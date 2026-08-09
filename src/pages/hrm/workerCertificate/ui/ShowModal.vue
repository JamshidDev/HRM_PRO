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
    width="900px"
    :persistent="false"
  >
    <n-spin :show="store.showLoading">
      <!-- Ro'yxat sahifasida faqat OXIRGI guvohnoma ko'rinadi — bu yerda hammasi.
           Jadval o'rniga kartalar: lavozim nomi uzun, jadval kataklarida qisilib
           o'qilmay qolardi. Keng ekranda 2 ustun, telefonda 1 ustun. -->
      <div
        v-if="store.showList.length > 0"
        class="grid grid-cols-1 md:grid-cols-2 gap-4 min-h-[120px]"
      >
        <div
          v-for="(item, idx) in store.showList"
          :key="item.id ?? idx"
          class="certificate-card"
        >
          <div class="certificate-card__head">
            <span class="certificate-card__number">{{ item.number }}</span>
            <div class="flex flex-wrap items-center gap-1">
              <UIBadge
                :show-icon="false"
                :label="
                  item.verify
                    ? $t('workerPositionCertificatePage.form.verify')
                    : $t('workerCertificatePage.modal.notVerified')
                "
                :type="item.verify ? Utils.colorTypes.success : Utils.colorTypes.dark"
              />
              <!-- «Qaytarib olingan» faqat HA bo'lganda — bu istisno holat, yo'qligi
                   normal, shu bois "yo'q" tegi qo'yilmaydi. -->
              <UIBadge
                v-if="item.returned"
                :show-icon="false"
                :label="$t('workerPositionCertificatePage.form.returned')"
                :type="Utils.colorTypes.warning"
              />
            </div>
          </div>

          <div class="certificate-card__section">
            <div class="certificate-card__label">
              {{ $t('workerPositionCertificatePage.form.postName') }}
            </div>
            <div class="certificate-card__post">{{ item.post_name }}</div>
          </div>

          <div class="certificate-card__section">
            <div class="certificate-card__row">
              <span class="certificate-card__label">
                {{ $t('workerPositionCertificatePage.form.issueDate') }}
              </span>
              <span class="certificate-card__value">
                {{ Utils.timeOnlyDate(item.issue_date) }}
              </span>
            </div>
            <div class="certificate-card__row">
              <span class="certificate-card__label">
                {{ $t('workerPositionCertificatePage.form.expiryDate') }}
              </span>
              <span class="certificate-card__value">
                {{ Utils.timeOnlyDate(item.expiry_date) }}
              </span>
            </div>
            <div class="certificate-card__row">
              <span class="certificate-card__label">
                {{ $t('workerPositionCertificatePage.form.extendedDate') }}
              </span>
              <!-- Qiymat yo'q bo'lsa BO'SH qoladi (to'ldiruvchi belgi yo'q). -->
              <span class="certificate-card__value">
                {{ item.extended_date ? Utils.timeOnlyDate(item.extended_date) : '' }}
              </span>
            </div>
          </div>

          <div v-if="item.file" class="certificate-card__footer">
            <n-button size="small" round @click="onDownload(item)">
              <template #icon>
                <ArrowCircleDown24Regular />
              </template>
              {{ $t('content.download') }}
            </n-button>
          </div>
        </div>
      </div>

      <div
        v-else-if="!store.showLoading"
        class="w-full py-10 text-center text-sm text-gray-400"
      >
        {{ $t('workerPositionCertificatePage.no-data') }}
      </div>
    </n-spin>
  </UIModal>
</template>

<style scoped>
  .certificate-card {
    display: flex;
    flex-direction: column;
    border: 1px solid var(--surface-line, #e5e7eb);
    border-radius: 16px;
    overflow: hidden;
  }

  /* Bo'limlar ustma-ust, chegara bilan ajratilgan — jadval qatorlari kabi. */
  .certificate-card__head,
  .certificate-card__section {
    padding: 10px 14px;
    border-bottom: 1px solid var(--surface-line, #e5e7eb);
  }

  .certificate-card__head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    background-color: var(--surface-ground, #f7f8fa);
  }

  .certificate-card__number {
    font-size: 15px;
    font-weight: 600;
    color: var(--textColor1);
  }

  .certificate-card__label {
    font-size: 12px;
    color: var(--textColor2);
  }

  .certificate-card__post {
    margin-top: 2px;
    font-size: 13px;
    line-height: 1.35;
    color: var(--textColor1);
  }

  .certificate-card__row {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    min-height: 22px;
  }

  .certificate-card__value {
    font-size: 13px;
    font-weight: 500;
    color: var(--textColor1);
  }

  .certificate-card__footer {
    padding: 10px 14px;
    display: flex;
    justify-content: flex-end;
  }

  /* Oxirgi bo'lim ostidagi ortiqcha chiziq — fayl tugmasi bo'lmasa. */
  .certificate-card > *:last-child {
    border-bottom: none;
  }
</style>
