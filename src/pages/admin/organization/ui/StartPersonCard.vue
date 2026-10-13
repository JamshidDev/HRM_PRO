<script setup>
  import { useOrganizationStore } from '@/store/modules/index.js'
  import { Person16Regular, Warning16Regular, ArrowRight16Regular } from '@vicons/fluent'

  const props = defineProps({
    pin: { type: String, default: null }
  })

  const store = useOrganizationStore()
  const loading = ref(false)
  const person = ref(undefined) // undefined — so'ralmagan, null — topilmadi.
  let requestId = 0

  // To'liq 14 raqam kiritilgandagina so'raladi; eski javob yangisini bosib ketmasin.
  watch(
    () => props.pin,
    (pin) => {
      const id = ++requestId
      if (!pin || !/^\d{14}$/.test(pin)) {
        person.value = undefined
        loading.value = false
        return
      }
      loading.value = true
      store
        ._startPerson(pin)
        .then((data) => {
          if (id === requestId) person.value = data
        })
        .catch(() => {
          if (id === requestId) person.value = undefined
        })
        .finally(() => {
          if (id === requestId) loading.value = false
        })
    },
    { immediate: true }
  )

  const rateText = (v) => String(v).replace('.', ',')
</script>

<template>
  <div v-if="loading" class="-mt-3 mb-4 flex items-center gap-2 rounded-xl border border-surface-line px-3 py-2">
    <n-spin size="small" />
    <span class="text-xs text-textColor2">{{ $t('organizationPage.startPerson.loading') }}</span>
  </div>

  <div
    v-else-if="person === null"
    class="-mt-3 mb-4 flex items-center gap-1.5 rounded-xl bg-fig-red-50 px-3 py-2 text-xs text-fig-text-red"
  >
    <n-icon size="14" class="shrink-0"><Warning16Regular /></n-icon>
    <span>{{ $t('organizationPage.startPerson.notFound') }}</span>
  </div>

  <div v-else-if="person" class="-mt-3 mb-4 flex flex-col gap-2 rounded-xl border border-surface-line px-3 py-2.5">
    <div class="flex items-center gap-2">
      <n-icon size="16" class="shrink-0 text-primary"><Person16Regular /></n-icon>
      <span class="text-sm font-semibold text-textColor0">{{ person.worker.full_name }}</span>
    </div>

    <div
      v-if="!person.has_account"
      class="flex items-center gap-1.5 rounded-lg bg-fig-red-50 px-2 py-1 text-xs text-fig-text-red"
    >
      <n-icon size="14" class="shrink-0"><Warning16Regular /></n-icon>
      <span>{{ $t('organizationPage.startPerson.noAccount') }}</span>
    </div>

    <div class="flex flex-col gap-1.5">
      <span class="text-[11px] font-medium uppercase text-textColor2">
        {{ $t('organizationPage.startPerson.positions') }}
      </span>
      <span v-if="!person.positions.length" class="text-xs text-textColor2">
        {{ $t('organizationPage.startPerson.noPositions') }}
      </span>
      <div
        v-for="p in person.positions"
        :key="p.id"
        class="flex flex-col gap-0.5 rounded-lg bg-surface-ground px-2 py-1.5"
      >
        <span class="text-xs font-medium text-textColor1">{{ p.organization?.name }}</span>
        <span class="text-xs text-textColor2 line-clamp-2">{{ p.position }}</span>
        <div class="mt-0.5 flex flex-wrap items-center gap-1">
          <span class="rounded-full bg-fig-chip-indigo px-2 py-0.5 text-[11px] font-medium text-fig-chip-indigo-text">
            {{ p.contract_type?.name }}
          </span>
          <span class="rounded-full bg-fig-chip-brand px-2 py-0.5 text-[11px] font-medium text-fig-chip-brand-text">
            {{ $t('organizationPage.startPerson.rate', { n: rateText(p.rate) }) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Yangi korxonada qanday yozilishi — createStartStaff qoidasi bilan bir xil. -->
    <div class="flex items-center gap-1.5 rounded-lg bg-fig-chip-green px-2 py-1.5 text-xs text-fig-chip-green-text">
      <n-icon size="14" class="shrink-0"><ArrowRight16Regular /></n-icon>
      <span>
        {{
          $t('organizationPage.startPerson.willBe', {
            type: person.new_position.contract_type.name,
            n: rateText(person.new_position.rate)
          })
        }}
      </span>
    </div>
  </div>
</template>
