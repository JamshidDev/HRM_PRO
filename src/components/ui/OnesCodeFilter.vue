<script setup>
// Ko'p 1C kod filtri — korxona 1C'da bir nechta kodga bo'lingan bo'lsa (aslida bitta
// korxona), aynan tanlangan kod bo'yicha ko'rish. FAQAT bitta korxona tanlanган va u
// >1 kodga ega bo'lganda ko'rinadi (aks holda yashirin — oddiy holatda UI o'zgarmaydi).
// `ones_code` (bitta kod) param backendga yuboriladi; bo'sh → hamma kod (birlashган).
import { computed, ref, watch } from 'vue'
import salary1cService from '@/service/v1/accountant/salary1cService.js'

const props = defineProps({
  // Tanlangan korxona id'lari (massiv). Bitta bo'lsa — kodlar yuklanadi.
  orgIds: { type: Array, default: () => [] },
  // Tanlangan 1C kod (ones_org_code string) yoki null.
  modelValue: { type: [String, null], default: null }
})
const emit = defineEmits(['update:modelValue', 'change'])

const codes = ref([])
const loading = ref(false)

const loadCodes = async (orgId) => {
  loading.value = true
  try {
    const res = await salary1cService._getOrgCodes({ params: { organization_id: orgId } })
    codes.value = res?.data?.data ?? []
  } catch {
    codes.value = []
  } finally {
    loading.value = false
  }
}

// orgIds o'zgarsa: aynan bitta korxona → kodlarini yukla; aks holda tozalab, tanlovni
// bekor qilamiz (filtr yashirinadi, ones_code yuborilmaydi).
watch(
  () => props.orgIds,
  (ids) => {
    const list = Array.isArray(ids) ? ids.filter((v) => v != null) : []
    if (list.length === 1) {
      loadCodes(list[0])
    } else {
      codes.value = []
      if (props.modelValue != null) {
        emit('update:modelValue', null)
        emit('change', null)
      }
    }
  },
  { immediate: true, deep: true }
)

// Kod + (bo'lsa) label → ko'rsatiladigan matn; qiymat = ones_org_code (backend param).
const options = computed(() =>
  codes.value.map((c) => ({
    value: c.ones_org_code,
    label: c.label ? `${c.ones_org_code} — ${c.label}` : c.ones_org_code
  }))
)

const onChange = (v) => {
  emit('update:modelValue', v ?? null)
  emit('change', v ?? null)
}
</script>

<template>
  <!-- Faqat ko'p kodli (>1) korxona uchun — yakka kodli korxonada ko'rinmaydi. -->
  <template v-if="codes.length > 1">
    <label class="text-xs mt-3 text-textColor3 mb-1 font-medium">{{ $t('salary1c.onesCode.filterLabel') }}</label>
    <n-select
      class="w-full"
      clearable
      :value="modelValue"
      :loading="loading"
      :options="options"
      :placeholder="$t('salary1c.onesCode.filterPh')"
      @update:value="onChange"
    />
  </template>
</template>

<style scoped></style>
