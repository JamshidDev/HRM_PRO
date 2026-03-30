<script setup>
  const STORAGE_KEY = 'structure_report_alert_closed'

  const visible = ref(false)

  const onClose = () => {
    visible.value = false
    sessionStorage.setItem(STORAGE_KEY, 'true')
  }

  onMounted(() => {
    const isClosed = sessionStorage.getItem(STORAGE_KEY)
    if (!isClosed) {
      visible.value = true
    }
  })
</script>

<template>
  <n-modal v-model:show="visible" class="ui__modal-element" :mask-closable="false">
    <n-card :bordered="false" size="huge" role="dialog" aria-modal="true" style="width: 520px">
      <div class="flex flex-col text-center px-4 py-2">
        <h3 class="text-lg font-semibold text-textColor0 mb-4">
          {{ $t('structureReport.alertTitle') }}
        </h3>

        <div class="text-sm text-textColor2 leading-relaxed space-y-3 mb-6">
          <p>{{ $t('structureReport.alertText1') }}</p>
          <ul class="text-left list-none space-y-2 bg-warning/5 rounded-lg p-4 border border-warning text-warning">
            <li class="flex items-start gap-2">
              <span class="text-success mt-0.5">&#10003;</span>
              <span>{{ $t('structureReport.alertText2') }}</span>
            </li>
            <li class="flex items-start gap-2">
              <span class="text-warning mt-0.5">&#10071;</span>
              <span>{{ $t('structureReport.alertText3') }}</span>
            </li>
          </ul>
          <p class="text-xs text-textColor3 italic">
            {{ $t('structureReport.alertNote') }}
          </p>
        </div>

        <n-button type="primary" @click="onClose" block>
          {{ $t('content.understood') }}
        </n-button>
      </div>
    </n-card>
  </n-modal>
</template>
