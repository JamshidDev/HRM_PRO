<script setup>
// Ko'p 1C kod boshqaruvi — bitta korxonaga biriktirilgan 1C kodlarini ko'rish,
// qo'shish va o'chirish. Korxona 1C'da bir nechta kodga bo'lingan bo'lsa (aslida bitta
// korxona), shu yerda kodlar ro'yxati yuritiladi. Birinchi kod — primary (backward compat).
// Umumiy komponent: "Oylik hisobot (1C)" sahifasida ham, korxona (admin) formasida ham.
import { ref, watch } from 'vue'
import UIModal from '@/components/ui/UIModal.vue'
import salary1cService from '@/service/v1/accountant/salary1cService.js'
import i18n from '@/i18n/index.js'

const { t } = i18n.global

const props = defineProps({
  visible: { type: Boolean, default: false },
  organizationId: { type: [Number, null], default: null },
  organizationName: { type: String, default: '' }
})
const emit = defineEmits(['update:visible', 'changed'])

const codes = ref([])
const loading = ref(false)
const saving = ref(false)
const deletingId = ref(null)
const form = ref({ ones_org_code: '', label: '' })

const load = async () => {
  if (!props.organizationId) return
  loading.value = true
  try {
    const res = await salary1cService._getOrgCodes({ params: { organization_id: props.organizationId } })
    codes.value = res?.data?.data ?? []
  } catch (e) {
    window.$Toast?.error(e?.response?.data?.message ?? t('content.error'))
  } finally {
    loading.value = false
  }
}

watch(
  () => [props.visible, props.organizationId],
  ([v]) => {
    if (v) {
      form.value = { ones_org_code: '', label: '' }
      load()
    }
  },
  { immediate: true }
)

const onAdd = async () => {
  const code = (form.value.ones_org_code || '').trim()
  if (!code) {
    window.$Toast?.error(t('salary1c.onesCode.codeRequired'))
    return
  }
  saving.value = true
  try {
    await salary1cService._createOrgCode({
      data: {
        organization_id: props.organizationId,
        ones_org_code: code,
        label: (form.value.label || '').trim() || undefined
      }
    })
    window.$Toast?.success(t('salary1c.onesCode.addSuccess'))
    form.value = { ones_org_code: '', label: '' }
    await load()
    emit('changed')
  } catch (e) {
    window.$Toast?.error(e?.response?.data?.message ?? t('content.error'))
  } finally {
    saving.value = false
  }
}

const onDelete = async (row) => {
  deletingId.value = row.id
  try {
    await salary1cService._deleteOrgCode({ id: row.id })
    window.$Toast?.success(t('salary1c.onesCode.deleteSuccess'))
    await load()
    emit('changed')
  } catch (e) {
    window.$Toast?.error(e?.response?.data?.message ?? t('content.error'))
  } finally {
    deletingId.value = null
  }
}

const close = () => emit('update:visible', false)
</script>

<template>
  <UIModal
    :visible="visible"
    @update:visible="emit('update:visible', $event)"
    :title="$t('salary1c.onesCode.manageTitle')"
    width="560"
  >
    <div class="flex flex-col gap-3">
      <div class="text-sm text-textColor2">
        {{ $t('salary1c.organization') }}:
        <span class="font-medium text-textColor1">{{ organizationName || '—' }}</span>
      </div>

      <!-- Yangi kod qo'shish -->
      <div class="flex items-end gap-2">
        <div class="flex-1">
          <label class="text-xs text-textColor3 mb-1 font-medium block">{{ $t('salary1c.onesCode.code') }}</label>
          <n-input
            v-model:value="form.ones_org_code"
            class="skip-format"
            :placeholder="$t('salary1c.orgCodePh')"
          />
        </div>
        <div class="flex-1">
          <label class="text-xs text-textColor3 mb-1 font-medium block">{{ $t('salary1c.onesCode.label') }}</label>
          <n-input v-model:value="form.label" :placeholder="$t('salary1c.onesCode.labelPh')" />
        </div>
        <n-button type="primary" :loading="saving" @click="onAdd">{{ $t('salary1c.onesCode.add') }}</n-button>
      </div>

      <!-- Kodlar ro'yxati -->
      <n-spin :show="loading">
        <div v-if="codes.length" class="flex flex-col gap-2 mt-1">
          <div
            v-for="(row, i) in codes"
            :key="row.id"
            class="flex items-center justify-between border border-borderColor rounded-md px-3 py-2"
          >
            <div class="flex items-center gap-2">
              <span class="font-medium">{{ row.ones_org_code }}</span>
              <span v-if="i === 0" class="text-[10px] text-primary">({{ $t('salary1c.onesCode.primary') }})</span>
              <span v-if="row.label" class="text-xs text-textColor3">— {{ row.label }}</span>
            </div>
            <n-popconfirm @positive-click="onDelete(row)">
              <template #trigger>
                <n-button text type="error" :loading="deletingId === row.id">
                  {{ $t('salary1c.onesCode.delete') }}
                </n-button>
              </template>
              {{ $t('salary1c.onesCode.deleteConfirm') }}
            </n-popconfirm>
          </div>
        </div>
        <div v-else class="text-sm text-textColor3 py-3 text-center">
          {{ $t('salary1c.onesCode.empty') }}
        </div>
      </n-spin>
    </div>

    <template #footer>
      <div class="flex justify-end">
        <n-button @click="close">{{ $t('content.close') }}</n-button>
      </div>
    </template>
  </UIModal>
</template>

<style scoped></style>
