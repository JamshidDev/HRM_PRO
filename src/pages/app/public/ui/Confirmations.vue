<script setup>
  // Kelishuvchilar — har biri: rasm, F.I.Sh, lavozim; o'ngda roli (xodim / kelishuvchi / rahbar) va holati
  // (backend yuborgan status, o'zimiz hech narsa «tasdiqlamaymiz»). Tartib — `order` bo'yicha.
  import { usePublicStore } from '@stores'
  import { UIUser, UIStatus } from '@components'

  // bare — kartasiz va sarlavhasiz (telefondagi o'ng oyna ichida, sarlavha oynaning o'zida)
  defineProps({ bare: { type: Boolean, default: false } })

  const store = usePublicStore()

  const ROLES = ['w', 's', 'd', 'hr']
  const items = computed(() =>
    [...store.confirmations].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  )
</script>

<template>
  <div v-if="items.length && store.existFile" :class="{ 'public-card p-5': !bare }">
    <div v-if="!bare" class="mb-3 flex items-center justify-between gap-2">
      <h3 class="text-base font-semibold text-textColor0">{{ $t('timesheetPage.verifiers') }}</h3>
      <span
        class="rounded-full bg-surface-ground px-2.5 py-0.5 text-xs font-semibold text-textColor2"
      >
        {{ items.length }}
      </span>
    </div>
    <div class="flex flex-col">
      <div
        v-for="item in items"
        :key="item.id"
        class="flex items-center gap-3 border-t border-surface-line py-3 first:border-t-0 first:pt-0 last:pb-0"
      >
        <UIUser
          class="min-w-0 flex-1 !items-start"
          :hide-tooltip="true"
          :short="false"
          :data="{
            photo: item.worker?.photo,
            lastName: item.worker?.last_name ?? '',
            firstName: item.worker?.first_name ?? '',
            middleName: item.worker?.middle_name ?? '',
            position: item.position
          }"
        >
          <!-- Ism va lavozim to'liq ko'rinadi (kesilmaydi, kerak bo'lsa keyingi qatorga o'tadi) — telefonda hover yo'q -->
          <template #name="{ title }">
            <span class="text-sm leading-[1.25] text-textColor2 [overflow-wrap:anywhere]">{{ title }}</span>
          </template>
          <template #position>
            <span class="mt-0.5 text-xs leading-snug text-textColor3 [overflow-wrap:anywhere]">
              {{ item.position }}
            </span>
          </template>
        </UIUser>
        <div class="flex shrink-0 flex-col items-end gap-1">
          <span v-if="ROLES.includes(item.type)" class="text-xs text-textColor3">
            {{ $t(`documentPage.signature.approval.roles.${item.type}`) }}
          </span>
          <UIStatus v-if="item.status" :status="item.status" fig :tooltip="false" />
        </div>
      </div>
    </div>
  </div>
</template>
