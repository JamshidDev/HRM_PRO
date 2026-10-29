<script setup>
  import { useRoute } from 'vue-router'
  import { usePdfViewerStore, useSignatureStore } from '@/store/modules/index.js'
  import SignatureBox from '@/pages/app/documentSignature/ui/SignatureBox.vue'
  import MobileEimzo from '@/pages/app/documentSignature/ui/MobileEimzo.vue'
  import LinkReject from '@/pages/app/documentSignature/ui/LinkReject.vue'
  import { Key24Regular } from '@vicons/fluent'

  const store = usePdfViewerStore()
  const signStore = useSignatureStore()
  const route = useRoute()
  const isPhone = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
  // Telefonda odatda E-IMZO ilovasi, kompyuterda — chizish.
  const tab = ref(isPhone ? 'mobile' : 'draw')

  const onEimzo = () => {
    signStore._signatureLink(route.query.token, () => store.markLinkSigned())
  }
</script>

<template>
  <div id="draw-signature" class="w-full max-w-[800px] mx-auto px-4 pt-10 mb-[160px]">
    <h3 class="text-2xl font-semibold">{{ $t('signature.signatureTitle') }}</h3>
    <p class="text-textColor3 mt-1">
      {{ $t('signature.signatureWorker', { name: store.signatureWorker }) }}
    </p>
    <n-tabs v-model:value="tab" type="segment" animated class="mt-5">
      <n-tab-pane name="draw" :tab="$t('signature.methodDraw')">
        <SignatureBox />
      </n-tab-pane>
      <n-tab-pane name="eimzo" :tab="$t('signature.methodEimzo')">
        <div class="rounded-xl border border-surface-line bg-surface-section p-6 mt-2 text-center">
          <n-icon size="40" class="text-primary"><Key24Regular /></n-icon>
          <p class="text-textColor2 mt-2 mb-5">{{ $t('signature.eimzoHint') }}</p>
          <n-button type="primary" :loading="signStore.loading" @click="onEimzo">
            {{ $t('signature.eimzoSign') }}
          </n-button>
        </div>
      </n-tab-pane>
      <n-tab-pane name="mobile" :tab="$t('signature.methodMobile')">
        <MobileEimzo :is-phone="isPhone" />
      </n-tab-pane>
    </n-tabs>
    <LinkReject />
  </div>
</template>
