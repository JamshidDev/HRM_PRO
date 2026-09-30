<script setup>
  /**
   * O'ng panel: tanlangan shablon haqida ma'lumot + `${...}` o'zgaruvchilar.
   *
   * - Bosish — o'zgaruvchi muharrirdagi kursor joyiga qo'yiladi (`insert`).
   *   `mousedown.prevent` ATAYLAB: tugma fokusni o'g'irlasa muharrir
   *   kursorini yo'qotadi va qo'yish joyi qolmaydi.
   * - Nusxa belgisi — eski usul, clipboard'ga (`copy`).
   * - Har bir o'zgaruvchi yonida hujjatda necha marta uchragani; 0 bo'lsa —
   *   o'chib ketgan (backend bunday shablonni rad etadi).
   * - `unknown` — hujjatda bor, lekin ro'yxatda yo'q (xato yozilgan) —
   *   ular hujjatga to'ldirilmaydi.
   */
  import { Copy16Regular, ErrorCircle16Regular, Search20Regular, Warning16Regular } from '@vicons/fluent'
  import { VARIABLE_GROUPS, groupLabel, variableGroup, variableLabel } from '../variableMeta.js'

  const props = defineProps({
    selected: { type: Object, default: null },
    variables: { type: Array, default: () => [] },
    // Map<name, count> yoki `null` (muharrir hali tahlil qilinmagan).
    usage: { type: Map, default: null },
    unknown: { type: Array, default: () => [] },
    canInsert: { type: Boolean, default: false },
    flash: { type: String, default: '' }
  })
  const emits = defineEmits(['insert', 'copy'])

  const query = ref('')

  const items = computed(() =>
    props.variables.map((name) => ({
      name,
      label: variableLabel(name),
      group: variableGroup(name),
      count: props.usage ? (props.usage.get(name) ?? 0) : null
    }))
  )

  const missingCount = computed(() => items.value.filter((i) => i.count === 0).length)

  const groups = computed(() => {
    const q = query.value.trim().toLocaleLowerCase()
    const filtered = q
      ? items.value.filter(
          (i) => i.name.toLocaleLowerCase().includes(q) || i.label?.toLocaleLowerCase().includes(q)
        )
      : items.value
    return VARIABLE_GROUPS.map((key) => ({
      key,
      label: groupLabel(key),
      items: filtered.filter((i) => i.group === key)
    })).filter((g) => g.items.length)
  })

  const hasResults = computed(() => groups.value.length > 0)
</script>

<template>
  <aside class="vp">
    <div v-if="selected" class="vp__header">
      <div class="vp__file-row">
        <span class="vp__label">{{ $t('documentTemplate.fileLabel') }}</span>
        <n-tag :bordered="false" size="small" :type="selected.edited ? 'warning' : 'success'">
          {{ selected.edited ? $t('documentTemplate.sourceGlobal') : $t('documentTemplate.sourceDefault') }}
        </n-tag>
      </div>
      <span class="vp__file">{{ selected.file_name }}</span>
      <span v-if="selected.updated_at" class="vp__date">
        {{ $t('documentTemplate.updatedAt') }}: {{ selected.updated_at }}
      </span>
    </div>

    <div class="vp__vars">
      <div class="vp__vars-head">
        <h3 class="vp__title">
          {{ $t('documentTemplate.variables') }}
          <span class="vp__badge">{{ variables.length }}</span>
        </h3>
        <p class="vp__hint">
          {{ canInsert ? $t('documentTemplate.variablesHintInsert') : $t('documentTemplate.variablesHint') }}
        </p>
      </div>

      <!-- Hujjatda bor, lekin ro'yxatda yo'q — ko'pincha xato yozilgan nom. -->
      <div v-if="unknown.length" class="vp__alert vp__alert--error">
        <div class="vp__alert-title">
          <n-icon :size="16"><ErrorCircle16Regular /></n-icon>
          {{ $t('documentTemplate.unknownVariables') }}
        </div>
        <p>{{ $t('documentTemplate.unknownHint') }}</p>
        <div class="vp__alert-list">
          <code v-for="name in unknown" :key="name">{{ '${' + name + '}' }}</code>
        </div>
      </div>

      <div v-if="missingCount" class="vp__alert vp__alert--warning">
        <div class="vp__alert-title">
          <n-icon :size="16"><Warning16Regular /></n-icon>
          {{ $t('documentTemplate.missingCount', { n: missingCount }) }}
        </div>
        <p>{{ $t('documentTemplate.missingHint') }}</p>
      </div>

      <n-input
        v-if="variables.length > 6"
        v-model:value="query"
        clearable
        size="small"
        :placeholder="$t('documentTemplate.searchVariables')"
      >
        <template #prefix>
          <n-icon><Search20Regular /></n-icon>
        </template>
      </n-input>

      <div class="vp__list">
        <section v-for="group in groups" :key="group.key" class="vp__group">
          <div class="vp__group-label">{{ group.label }}</div>
          <div
            v-for="item in group.items"
            :key="item.name"
            class="vp__var"
            :class="{
              'vp__var--missing': item.count === 0,
              'vp__var--flash': flash === item.name,
              'vp__var--static': !canInsert
            }"
          >
            <button
              type="button"
              class="vp__var-main"
              :title="canInsert ? $t('documentTemplate.insertTitle') : $t('content.copy')"
              @mousedown.prevent
              @click="canInsert ? emits('insert', item.name) : emits('copy', item.name)"
            >
              <span class="vp__var-label">{{ item.label ?? item.name }}</span>
              <code>{{ '${' + item.name + '}' }}</code>
            </button>
            <span
              v-if="item.count !== null"
              class="vp__usage"
              :class="{ 'vp__usage--zero': item.count === 0 }"
              :title="item.count ? $t('documentTemplate.usedTimes', { n: item.count }) : $t('documentTemplate.notInDocument')"
            >
              {{ item.count ? `×${item.count}` : '0' }}
            </span>
            <button
              type="button"
              class="vp__copy"
              :title="$t('content.copy')"
              @mousedown.prevent
              @click="emits('copy', item.name)"
            >
              <n-icon :size="14"><Copy16Regular /></n-icon>
            </button>
          </div>
        </section>

        <n-empty v-if="!hasResults" size="small" :description="$t('documentTemplate.noVariables')" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
  .vp {
    flex: 0 0 288px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-height: 0;
    padding: 12px;
    background: var(--fig-block-bg);
    border: 1px solid var(--fig-br-disable);
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 1px 2px rgb(16 24 40 / 5%),
      0 6px 20px rgb(16 24 40 / 5%);
  }

  .vp__header {
    display: flex;
    flex-direction: column;
    gap: 2px;
    flex: none;
    padding: 0 2px 8px;
    border-bottom: 1px solid var(--fig-br-disable);
  }

  .vp__file-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
  }

  .vp__label,
  .vp__date {
    color: var(--fig-text-secondary);
    font-size: 12px;
  }

  .vp__file {
    color: var(--fig-text-primary);
    font-family: ui-monospace, SFMono-Regular, monospace;
    font-size: 13px;
    font-weight: 600;
  }

  .vp__vars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1 1 auto;
    min-height: 0;
  }

  .vp__vars-head {
    flex: none;
    padding: 0 2px;
  }

  .vp__title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: var(--fig-text-primary);
    font-size: 13px;
    font-weight: 600;
    line-height: 18px;
  }

  .vp__badge {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: 18px;
    height: 16px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--fig-bg-brand-surface);
    color: var(--fig-text-brand);
    font-size: 10.5px;
  }

  .vp__hint {
    margin-top: 2px;
    color: var(--fig-text-secondary);
    font-size: 11px;
    line-height: 16px;
  }

  .vp__alert {
    flex: none;
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 6px 8px;
    border-radius: 6px;
    font-size: 11px;
    line-height: 16px;
  }

  .vp__alert p {
    color: var(--fig-text-secondary);
  }

  .vp__alert-title {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
  }

  .vp__alert--error {
    background: var(--fig-red-50);
    border: 1px solid var(--fig-br-error);
  }

  .vp__alert--error .vp__alert-title {
    color: var(--fig-text-red);
  }

  .vp__alert--warning {
    background: var(--fig-yellow-100);
    border: 1px solid var(--fig-orange-300);
  }

  .vp__alert-list {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  .vp__alert-list code {
    padding: 1px 6px;
    border-radius: 4px;
    background: var(--fig-block-bg);
    color: var(--fig-text-red);
    font-size: 11px;
  }

  .vp__list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
    padding-right: 4px;
    scrollbar-gutter: stable;
  }

  .vp__group {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .vp__group-label {
    color: var(--fig-text-secondary);
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  /* Har bir o'zgaruvchi — alohida quti. */
  .vp__var {
    display: flex;
    align-items: center;
    gap: 4px;
    padding: 2px 4px 2px 2px;
    border: 1px solid var(--fig-br-disable);
    border-radius: 8px;
    background: var(--fig-bg-secondary);
    transition: border-color 0.16s ease, background-color 0.16s ease;
  }

  .vp__var:hover,
  .vp__var--flash {
    border-color: var(--fig-bg-brand-fill);
    background: var(--fig-bg-brand-surface);
  }

  .vp__var--missing {
    border-style: dashed;
    border-color: var(--fig-orange-300);
  }

  .vp__var-main {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex: 1 1 auto;
    min-width: 0;
    padding: 5px 6px;
    border-radius: 6px;
    text-align: left;
    cursor: copy;
  }

  .vp__var--static .vp__var-main {
    cursor: pointer;
  }

  .vp__var-main:focus-visible,
  .vp__copy:focus-visible {
    outline: 2px solid var(--fig-bg-brand-fill);
    outline-offset: -2px;
  }

  .vp__var-label {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--fig-text-primary);
    font-size: 12px;
    line-height: 16px;
  }

  .vp__var-main code {
    max-width: 100%;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: var(--fig-text-secondary);
    font-size: 10.5px;
    line-height: 14px;
  }

  .vp__var:hover .vp__var-main code,
  .vp__var--flash .vp__var-main code {
    color: var(--fig-text-brand);
  }

  .vp__usage {
    flex: none;
    min-width: 24px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--fig-bg-disable);
    color: var(--fig-text-secondary);
    font-size: 10.5px;
    font-weight: 600;
    line-height: 18px;
    text-align: center;
  }

  .vp__usage--zero {
    background: var(--fig-yellow-100);
    color: var(--fig-text-red);
  }

  .vp__copy {
    flex: none;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border-radius: 6px;
    color: var(--fig-text-secondary);
  }

  .vp__copy:hover {
    background: var(--fig-block-bg);
    color: var(--fig-text-brand);
  }

  @media (max-width: 1024px) {
    .vp {
      flex-basis: auto;
      max-height: 480px;
    }
  }
</style>
