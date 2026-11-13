<script setup>
  // O'ng panel: shablon fayli va `${...}` o'zgaruvchilar — nomi, tavsifi, namunasi; bosilsa nusxalanadi.
  import { Copy16Regular, Search20Regular } from '@vicons/fluent'
  import { VARIABLE_GROUPS, groupLabel } from '../variableMeta.js'

  const props = defineProps({
    selected: { type: Object, default: null },
    // [{name, label, description, example, group, count}]
    variables: { type: Array, default: () => [] },
    flash: { type: String, default: '' }
  })
  const emits = defineEmits(['copy'])

  const query = ref('')

  const groups = computed(() => {
    const q = query.value.trim().toLocaleLowerCase()
    const filtered = q
      ? props.variables.filter((i) =>
          [i.name, i.label, i.description].some((v) => v?.toLocaleLowerCase().includes(q))
        )
      : props.variables
    return VARIABLE_GROUPS.map((key) => ({
      key,
      label: groupLabel(key),
      items: filtered.filter((i) => (i.group ?? 'other') === key)
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
        <p class="vp__hint">{{ $t('documentTemplate.variablesHint') }}</p>
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
          <button
            v-for="item in group.items"
            :key="item.name"
            type="button"
            class="vp__var"
            :class="{ 'vp__var--flash': flash === item.name }"
            :title="$t('content.copy')"
            @click="emits('copy', item.name)"
          >
            <span class="vp__var-top">
              <span class="vp__var-label">{{ item.label || item.name }}</span>
              <span
                class="vp__usage"
                :title="$t('documentTemplate.usedTimes', { n: item.count })"
              >×{{ item.count }}</span>
              <n-icon :size="14" class="vp__copy"><Copy16Regular /></n-icon>
            </span>
            <code class="vp__var-name">{{ '${' + item.name + '}' }}</code>
            <span v-if="item.description" class="vp__var-desc">{{ item.description }}</span>
            <span v-if="item.example" class="vp__var-example">
              {{ $t('documentTemplate.example') }}: {{ item.example }}
            </span>
          </button>
        </section>

        <n-empty v-if="!hasResults" size="small" :description="$t('documentTemplate.noVariables')" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
  .vp {
    flex: 0 0 320px;
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

  /* Har bir o'zgaruvchi — alohida quti: nom, kod, tavsif, namuna. */
  .vp__var {
    display: flex;
    flex-direction: column;
    gap: 2px;
    width: 100%;
    padding: 8px 10px;
    border: 1px solid var(--fig-br-disable);
    border-radius: 8px;
    background: var(--fig-bg-secondary);
    text-align: left;
    cursor: copy;
    transition: border-color 0.16s ease, background-color 0.16s ease;
  }

  .vp__var:hover,
  .vp__var--flash {
    border-color: var(--fig-bg-brand-fill);
    background: var(--fig-bg-brand-surface);
  }

  .vp__var:focus-visible {
    outline: 2px solid var(--fig-bg-brand-fill);
    outline-offset: -2px;
  }

  .vp__var-top {
    display: flex;
    align-items: center;
    gap: 6px;
    min-width: 0;
  }

  .vp__var-label {
    flex: 1 1 auto;
    min-width: 0;
    color: var(--fig-text-primary);
    font-size: 12.5px;
    font-weight: 600;
    line-height: 17px;
  }

  .vp__var-name {
    overflow-wrap: anywhere;
    color: var(--fig-text-brand);
    font-size: 11px;
    line-height: 15px;
  }

  .vp__var-desc {
    color: var(--fig-text-secondary);
    font-size: 11.5px;
    line-height: 16px;
  }

  .vp__var-example {
    color: var(--fig-text-secondary);
    font-size: 11px;
    font-style: italic;
    line-height: 15px;
    overflow-wrap: anywhere;
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

  .vp__copy {
    flex: none;
    color: var(--fig-text-secondary);
  }

  .vp__var:hover .vp__copy {
    color: var(--fig-text-brand);
  }

  @media (max-width: 1024px) {
    .vp {
      flex-basis: auto;
      max-height: 480px;
    }
  }
</style>
