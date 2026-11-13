<script setup>
  // O'ng panel: shablon fayli va `${...}` o'zgaruvchilar — nomi, tavsifi, namunasi; bosilsa nusxalanadi.
  import { Copy16Regular, Search20Regular } from '@vicons/fluent'
  import { VARIABLE_GROUPS, groupLabel } from '../variableMeta.js'

  const props = defineProps({
    // [{name, label, description, example, group, count}]
    variables: { type: Array, default: () => [] },
    // Tanlangan shablon kaliti — almashganda qidiruv tozalanadi.
    templateKey: { type: String, default: null },
    flash: { type: String, default: '' }
  })
  const emits = defineEmits(['copy'])

  const query = ref('')
  // Boshqa shablon tanlansa — eski qidiruv qolmasin.
  watch(
    () => props.templateKey,
    () => (query.value = '')
  )

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
    <div class="vp__vars">
      <n-input
        v-if="variables.length > 6"
        v-model:value="query"
        clearable
        size="small"
        :placeholder="$t('content.search')"
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
              <code class="vp__var-name">{{ '${' + item.name + '}' }}</code>
              <n-icon :size="14" class="vp__copy"><Copy16Regular /></n-icon>
            </span>
            <span v-if="item.description" class="vp__var-desc">{{ item.description }}</span>
            <span v-if="item.label && item.label !== item.name" class="vp__badges">
              <span class="vp__badge-chip">{{ item.label }}</span>
            </span>
          </button>
        </section>

        <n-empty v-if="!hasResults && query" size="small" :description="$t('documentTemplate.noVariables')" />
      </div>
    </div>
  </aside>
</template>

<style scoped>
  .vp {
    flex: 0 0 320px;
    display: flex;
    flex-direction: column;
    gap: 8px;
    min-height: 0;
    padding: 10px;
    background: var(--fig-block-bg);
    border: 1px solid var(--fig-br-disable);
    border-radius: 12px;
    overflow: hidden;
    box-shadow:
      0 1px 2px rgb(16 24 40 / 5%),
      0 6px 20px rgb(16 24 40 / 5%);
  }

  .vp__vars {
    display: flex;
    flex-direction: column;
    gap: 8px;
    flex: 1 1 auto;
    min-height: 0;
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
    gap: 3px;
    width: 100%;
    padding: 6px 8px;
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

  .vp__var-name {
    flex: 1 1 auto;
    min-width: 0;
    overflow-wrap: anywhere;
    color: var(--fig-text-primary);
    font-size: 13px;
    font-weight: 700;
    line-height: 18px;
  }

  .vp__var:hover .vp__var-name,
  .vp__var--flash .vp__var-name {
    color: var(--fig-text-brand);
  }

  .vp__var-desc {
    color: var(--fig-text-secondary);
    font-size: 11.5px;
    line-height: 16px;
  }

  .vp__badges {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    margin-top: 2px;
    min-width: 0;
  }

  .vp__badge-chip {
    max-width: 100%;
    overflow: hidden;
    padding: 0 6px;
    border-radius: 999px;
    background: var(--fig-bg-brand-surface);
    color: var(--fig-text-brand);
    font-size: 10.5px;
    font-weight: 600;
    line-height: 18px;
    text-overflow: ellipsis;
    white-space: nowrap;
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
