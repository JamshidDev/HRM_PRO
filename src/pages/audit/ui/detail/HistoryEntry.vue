<script setup>
  /**
   * Tarix vaqt chizig'idagi bitta hodisa: chapda bajaruvchi avatari va chiziq,
   * o'ngda "kim · lavozim · soat", bir jumlalik xulosa va o'zgargan yozuvlar.
   * Kontekst (korxona / kanal / IP / qurilma) yig'ilgan turadi.
   */
  import { ChevronDown16Regular, Clock16Regular, Warning20Filled } from '@vicons/fluent'
  import i18n from '@/i18n/index.js'
  import Utils from '@/utils/Utils.js'
  import ChangeRow from './ChangeRow.vue'
  import { summaryOf } from './auditValues.js'

  const props = defineProps({
    event: {
      type: Object,
      required: true
    },
    // Ro'yxatdagi tartib raqami — qator kalitlari shu bilan yasaladi.
    index: {
      type: Number,
      required: true
    },
    focused: Boolean,
    metaOpen: Boolean,
    // "Oldin / Keyin" kartochkalari ochiq.
    cardsOpen: Boolean
  })

  defineEmits(['toggle-meta'])

  const { t } = i18n.global

  const user = computed(() => props.event.user)

  // Rasm UIUser'dagi kabi: bosilganda kattalashtiriladi.
  const openPhoto = () => {
    if (user.value?.photo) window.$openViewer(user.value.photo)
  }

  const fullName = computed(() =>
    user.value
      ? [user.value.last_name, user.value.first_name, user.value.middle_name].filter(Boolean).join(' ') ||
        user.value.full_name
      : t('audit.detail.system')
  )

  const time = computed(() => (String(props.event.created_at || '').split(' ')[1] || '').slice(0, 5))
  const summary = computed(() => summaryOf(props.event))

  const meta = computed(() =>
    [
      { label: t('audit.detail.organization'), value: props.event.organization?.name },
      { label: t('audit.detail.channel'), value: t(`audit.channel.${props.event.auth_channel}`) },
      { label: t('audit.detail.ip'), value: props.event.ip, mono: true },
      { label: t('audit.detail.userAgent'), value: props.event.user_agent, mono: true, wrap: true }
    ].filter((r) => r.value)
  )
</script>

<template>
  <article class="entry" :class="{ 'entry--focused': focused }">
    <div class="entry__rail">
      <!-- Rasm yo'q yoki ochilmasa — UIUser'dagi kabi umumiy "rasm yo'q" surati. -->
      <n-avatar
        round
        :size="32"
        :src="user?.photo || Utils.noAvailableImage"
        :fallback-src="Utils.noAvailableImage"
        class="entry__avatar"
        :class="{ 'cursor-pointer': user?.photo }"
        @click="openPhoto"
      />
      <span class="entry__line" aria-hidden="true"></span>
    </div>

    <div class="entry__body">
      <div class="entry__head">
        <div class="entry__who">
          <span class="entry__name">{{ fullName }}</span>
          <span v-if="event.role?.name" class="entry__muted">· {{ event.role.name }}</span>
        </div>
        <!-- Soat — och ko'k chip, hodisa qachon bo'lgani bir qarashda ko'rinadi. -->
        <span v-if="time" class="entry__time">
          <n-icon :size="13"><Clock16Regular /></n-icon>
          {{ time }}
        </span>
        <n-button
          v-if="meta.length"
          quaternary
          circle
          size="tiny"
          class="entry__toggle"
          :class="{ 'is-open': metaOpen }"
          :aria-label="$t('audit.detail.moreInfo')"
          @click="$emit('toggle-meta')"
        >
          <template #icon>
            <n-icon><ChevronDown16Regular /></n-icon>
          </template>
        </n-button>
      </div>
      <div v-if="summary" class="entry__summary">{{ summary }}</div>

      <!-- O'ram div SHART: `n-collapse-transition` balandlikni o'lchaydi,
           to'g'ridan-to'g'ri margin li bola bilan kartochka "sakrab" ochilardi. -->
      <n-collapse-transition :show="metaOpen">
        <div class="entry__meta-wrap">
          <dl class="entry__meta">
            <template v-for="m in meta" :key="m.label">
              <dt>{{ m.label }}</dt>
              <dd :class="[m.mono && 'font-mono', m.wrap && 'entry__meta-wrap-text']">{{ m.value }}</dd>
            </template>
          </dl>
        </div>
      </n-collapse-transition>

      <!-- Sudo ogohlantirishi — shu hodisaga tegishli -->
      <n-alert v-if="event.impersonator" type="warning" class="mt-2" :bordered="false">
        <template #icon>
          <n-icon><Warning20Filled /></n-icon>
        </template>
        {{
          $t('audit.detail.impersonated', {
            admin: event.impersonator.full_name,
            user: event.user?.full_name
          })
        }}
      </n-alert>

      <div v-if="event.changes?.length" class="entry__changes">
        <ChangeRow
          v-for="(ch, ci) in event.changes"
          :key="ci"
          :change="ch"
          :open="cardsOpen"
        />
      </div>
    </div>
  </article>
</template>

<style scoped>
  .entry {
    display: flex;
    gap: 12px;
  }

  .entry__rail {
    display: flex;
    flex-direction: column;
    align-items: center;
    flex-shrink: 0;
  }

  .entry__avatar {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
  }

  /* Vaqt chizig'i — keyingi hodisagacha davom etadi. */
  .entry__line {
    flex: 1;
    width: 2px;
    margin-top: 4px;
    border-radius: 2px;
    background: var(--color-surface-line, #e2e8f0);
  }

  .entry:last-child .entry__line {
    display: none;
  }

  .entry__body {
    flex: 1;
    min-width: 0;
    padding-bottom: 18px;
  }

  .entry__head {
    display: flex;
    align-items: center;
    gap: 6px;
    min-height: 32px;
  }

  .entry__who {
    flex: 1;
    min-width: 0;
    font-size: 13px;
    line-height: 1.35;
  }

  .entry__name {
    font-weight: 600;
  }

  .entry__muted {
    margin-left: 4px;
    color: var(--color-fig-text-secondary, #475467);
  }

  .entry__time {
    display: inline-flex;
    flex-shrink: 0;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    background: var(--color-fig-blue-100, #d1e9ff);
    color: var(--color-fig-brand, #2e90fa);
  }

  .entry__toggle {
    flex-shrink: 0;
    transition: transform 0.2s ease;
  }

  .entry__toggle.is-open {
    transform: rotate(180deg);
  }

  .entry__summary {
    margin-top: -4px;
    font-size: 12px;
    color: var(--color-fig-text-secondary, #475467);
  }

  .entry__meta-wrap {
    padding-top: 8px;
  }

  .entry__meta {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 4px 16px;
    margin: 0;
    padding: 8px 10px;
    border-radius: 8px;
    font-size: 12px;
    background: var(--color-surface-ground, #f8fafc);
  }

  .entry__meta dt {
    color: var(--color-fig-text-secondary, #475467);
    white-space: nowrap;
  }

  .entry__meta dd {
    margin: 0;
    word-break: break-word;
  }

  .entry__meta-wrap-text {
    max-height: 44px;
    overflow: auto;
  }

  .entry__changes {
    margin-top: 8px;
    border: 1px solid var(--color-surface-line, #e2e8f0);
    border-radius: 10px;
    background: var(--color-surface-section, #ffffff);
    overflow: hidden;
  }

  /* Ro'yxatdan bosilgan hodisa — brend ramkasi bilan ajratiladi. */
  .entry--focused .entry__changes {
    border-color: var(--color-fig-blue-300, #84caff);
    box-shadow: 0 0 0 2px var(--color-fig-bg-brand-surface, #eff8ff);
  }
</style>
