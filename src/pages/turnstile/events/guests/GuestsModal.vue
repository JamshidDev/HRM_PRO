<script setup>
  import {
    Delete16Regular,
    Edit16Regular,
    History16Regular,
    PeopleTeam20Regular,
    Search16Regular
  } from '@vicons/fluent'
  import { UIModal, UITablePagination } from '@/components/index.js'
  import { confirmDialog } from '@/components/notify/alertDialog.js'
  import i18n from '@/i18n/index.js'
  import { useAccountStore, useGuestStore } from '@/store/modules/index.js'
  import GuestLookup from './GuestLookup.vue'
  import GuestForm from './GuestForm.vue'
  import GuestEvents from './GuestEvents.vue'

  // «Biriktirilgan mehmonlar» modali: chapda JSHSHIR bo'yicha qo'shish, o'ngda qo'shilganlar ro'yxati.
  const { t } = i18n.global
  const store = useGuestStore()
  const accStore = useAccountStore()
  const canWrite = computed(() =>
    accStore.checkPermission(accStore.pn.turnstileHikCentralEventsWrite)
  )

  let timer = null
  const onSearch = () => {
    clearTimeout(timer)
    timer = setTimeout(() => {
      store.params.page = 1
      store._index()
    }, 400)
  }
  const onDate = (v) => {
    store.params.date = v
    store.params.page = 1
    store._index()
  }
  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const maskPin = (p) => (p ? `${p.slice(0, 4)}******${p.slice(-4)}` : '')
  const fullName = (g) => [g.last_name, g.first_name, g.middle_name].filter(Boolean).join(' ')
  const initials = (g) =>
    [g.last_name, g.first_name]
      .filter(Boolean)
      .map((s) => s[0])
      .join('')
      .toUpperCase()

  // Bugungi holat chipi: kelmagan / kech / o'z vaqtida.
  const dayChip = (g) => {
    if (!g.day.first_in) {
      return { text: t('guestPage.notCame'), cls: 'bg-fig-red-50 text-fig-text-red' }
    }
    if (g.day.late_minutes) {
      return {
        text: `${g.day.first_in} · ${t('guestPage.lateMin', { n: g.day.late_minutes })}`,
        cls: 'bg-fig-chip-amber text-fig-chip-amber-text'
      }
    }
    return { text: g.day.first_in, cls: 'bg-fig-chip-green text-fig-chip-green-text' }
  }

  const onDetach = async (g) => {
    const ok = await confirmDialog({
      message: t('guestPage.detachConfirm', { name: fullName(g) }),
      confirmText: t('guestPage.detach'),
      danger: true
    })
    if (ok) store._delete(g.id)
  }

  watch(
    () => store.listVisible,
    (v) => {
      if (v) store._index()
    },
    { immediate: true }
  )
</script>

<template>
  <div class="grid grid-cols-1 lg:grid-cols-[360px_1fr] gap-4 h-[70vh] min-h-0">
    <!-- Qo'shish -->
    <aside v-if="canWrite" class="min-h-0 overflow-y-auto rounded-2xl bg-surface-ground-soft p-4">
      <GuestLookup />
    </aside>

    <!-- Qo'shilganlar -->
    <section
      class="min-h-0 flex flex-col rounded-2xl border border-surface-line overflow-hidden"
      :class="!canWrite && 'lg:col-span-2'"
    >
      <div class="shrink-0 flex flex-wrap items-center gap-2 border-b border-surface-line p-3">
        <p class="text-sm font-semibold text-textColor0">{{ $t('guestPage.attachedTitle') }}</p>
        <span
          class="rounded-full bg-fig-chip-brand px-2 py-0.5 text-xs font-semibold text-fig-chip-brand-text"
        >
          {{ store.total }}
        </span>
        <div class="flex-1"></div>
        <n-input
          v-model:value="store.params.search"
          clearable
          size="small"
          class="w-[220px]!"
          :placeholder="$t('guestPage.searchPlaceholder')"
          @update:value="onSearch"
        >
          <template #prefix>
            <n-icon :component="Search16Regular" />
          </template>
        </n-input>
        <n-date-picker
          size="small"
          class="w-[140px]"
          type="date"
          format="dd.MM.yyyy"
          value-format="yyyy-MM-dd"
          :formatted-value="store.params.date"
          @update:formatted-value="onDate"
        />
      </div>

      <n-spin :show="store.loading" class="flex-1 min-h-0" content-class="h-full">
        <div class="h-full overflow-y-auto p-2 flex flex-col gap-1.5">
          <div
            v-for="g in store.list"
            :key="g.id"
            class="group flex items-center gap-3 rounded-xl border border-surface-line px-3 py-2.5 hover:bg-surface-ground-soft"
          >
            <span
              class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fig-chip-brand text-xs font-semibold text-fig-chip-brand-text"
            >
              {{ initials(g) || '?' }}
            </span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-textColor0">{{ fullName(g) || '—' }}</p>
              <p class="truncate text-xs text-fig-text-tertiary">
                {{ maskPin(g.pin) }} · {{ g.work_start }}–{{ g.work_end }}
                <template v-if="g.note"> · {{ g.note }}</template>
              </p>
            </div>
            <span
              class="hidden sm:inline-flex shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium"
              :class="dayChip(g).cls"
            >
              {{ dayChip(g).text }}
            </span>
            <span
              v-if="g.day.last_out"
              class="hidden md:inline shrink-0 text-xs text-fig-text-tertiary"
            >
              {{ $t('guestPage.out') }} {{ g.day.last_out }}
            </span>
            <div class="flex shrink-0 items-center gap-0.5">
              <n-button quaternary circle size="small" @click="store.openEvents(g)">
                <template #icon><n-icon :component="History16Regular" /></template>
              </n-button>
              <template v-if="canWrite">
                <n-button quaternary circle size="small" @click="store.openEdit(g)">
                  <template #icon><n-icon :component="Edit16Regular" /></template>
                </n-button>
                <n-button quaternary circle size="small" type="error" @click="onDetach(g)">
                  <template #icon><n-icon :component="Delete16Regular" /></template>
                </n-button>
              </template>
            </div>
          </div>

          <div
            v-if="!store.loading && !store.list.length"
            class="flex flex-1 flex-col items-center justify-center gap-2 py-10 text-center"
          >
            <span
              class="flex h-12 w-12 items-center justify-center rounded-2xl bg-surface-ground-soft text-fig-text-tertiary"
            >
              <n-icon size="24" :component="PeopleTeam20Regular" />
            </span>
            <p class="text-sm font-medium text-textColor0">{{ $t('guestPage.emptyTitle') }}</p>
            <p class="max-w-[300px] text-xs text-fig-text-tertiary">
              {{ $t('guestPage.emptyHint') }}
            </p>
          </div>
        </div>
      </n-spin>

      <div v-if="store.total > store.params.per_page" class="shrink-0 border-t border-surface-line">
        <UITablePagination
          :page="store.params.page"
          :per-page="store.params.per_page"
          :total="store.total"
          @change-page="changePage"
        />
      </div>
    </section>

    <UIModal v-model:visible="store.visible" :width="440" :title="$t('guestPage.editTitle')">
      <GuestForm />
    </UIModal>
    <UIModal
      v-model:visible="store.eventsVisible"
      :width="640"
      :title="$t('guestPage.eventsTitle')"
    >
      <GuestEvents />
    </UIModal>
  </div>
</template>
