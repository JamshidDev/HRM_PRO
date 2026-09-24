<script setup>
  import { UIModal } from '@components'
  import { useLmsCertificateStore } from '@stores'
  import { CheckmarkCircle20Filled } from '@vicons/fluent'

  const store = useLmsCertificateStore()
</script>

<template>
  <UIModal
    :width="520"
    :visible="store.signConfirmVisible"
    @update:visible="(v) => (store.signConfirmVisible = v)"
    :title="$t('lmsCertificate.signAllTitle')"
  >
    <!-- Amal qaytarib bo'lmaydigan: nima bo'lishini modalда aniq yozamiz. -->
    <div class="sign-info">
      <n-icon size="18" class="sign-info__icon"><CheckmarkCircle20Filled /></n-icon>
      <div>
        <p class="sign-info__count">
          {{ $t('lmsCertificate.signAllCount', { count: store.unsignedCount }) }}
        </p>
        <ul class="sign-info__list">
          <li>{{ $t('lmsCertificate.signAllNote1') }}</li>
          <li>{{ $t('lmsCertificate.signAllNote2') }}</li>
          <li>{{ $t('lmsCertificate.signAllNote3') }}</li>
        </ul>
      </div>
    </div>

    <template #footer>
      <div class="grid grid-cols-12 gap-2">
        <div class="col-span-6">
          <n-button secondary type="error" class="!w-full" @click="store.signConfirmVisible = false">
            {{ $t('content.no') }}
          </n-button>
        </div>
        <div class="col-span-6">
          <n-button
            secondary
            type="primary"
            class="!w-full"
            :loading="store.signAllLoading"
            @click="store._signAllCertificates()"
          >
            {{ $t('content.confirm') }}
          </n-button>
        </div>
      </div>
    </template>
  </UIModal>
</template>

<style scoped>
  /* Info karta — modal ichidagi tushuntirish bloki. */
  .sign-info {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 12px 14px;
    border: 1px solid rgb(234 179 8 / 45%);
    border-radius: 12px;
    background: rgb(234 179 8 / 12%);
  }
  .sign-info__icon {
    flex-shrink: 0;
    margin-top: 1px;
    color: rgb(202 138 4);
  }
  .sign-info__count {
    font-size: 13px;
    font-weight: 600;
    line-height: 20px;
    color: rgb(113 63 18);
  }
  .sign-info__list {
    margin-top: 6px;
    padding-left: 16px;
    font-size: 12px;
    line-height: 18px;
    color: rgb(133 77 14);
    list-style: disc;
  }
</style>
