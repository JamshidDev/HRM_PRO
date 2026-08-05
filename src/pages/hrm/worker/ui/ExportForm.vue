<script setup>
  import { useExportStore } from '@/store/modules'
  import { onMounted } from 'vue'
  import { VueDraggable } from 'vue-draggable-plus'
  import { ReOrderDotsVertical16Regular } from '@vicons/fluent'

  const store = useExportStore()

  const toggleItem = (v) => {
    if (store.payload.columns.find((i) => i.column == v.column)) {
      store.payload.columns = store.payload.columns.filter((i) => i.column != v.column)
    } else {
      store.payload.columns.push(v)
    }
  }

  const toggleAll = () => {
    if (!(store.payload.columns?.length === store.columns.length)) {
      store.columns.forEach((i) => {
        if (!store.payload.columns.find((j) => j.column === i.column)) {
          store.payload.columns.push(i)
        }
      })
    } else {
      store.payload.columns = []
    }
  }

  onMounted(() => {
    store.resetPayload()
    store._columns()
  })
</script>
<template>
  <n-spin :content-style="{ width: '100%' }" :show="store.loading">
    <div class="export-form">
      <div class="export-section">
        <p class="export-section__title">{{ $t('exportPage.selectColumns') }}</p>
        <div class="export-columns-grid">
          <label class="export-checkbox-item">
            <n-checkbox
              :checked="store.payload.columns?.length === store.columns.length"
              @update:checked="toggleAll"
            />
            <span>{{ $t('exportPage.checkAll') }}</span>
          </label>
          <label
            v-for="item in store.columns"
            :key="item.column"
            class="export-checkbox-item"
            @click.prevent="toggleItem(item)"
          >
            <n-checkbox :checked="!!store.payload.columns.find((i) => i.column == item.column)" />
            <span>{{ item.label }}</span>
          </label>
        </div>
      </div>

      <n-divider class="export-divider" />

      <div class="export-section">
        <p class="export-section__title">{{ $t('exportPage.columnOrder') }}</p>
        <VueDraggable
          class="export-order-list"
          v-model="store.payload.columns"
          :animation="150"
          handle=".export-order-handle"
        >
          <div v-for="header in store.payload.columns" :key="header.column" class="export-order-chip">
            <span>{{ header.label }}</span>
            <n-icon class="export-order-handle" size="16">
              <ReOrderDotsVertical16Regular />
            </n-icon>
          </div>
        </VueDraggable>
      </div>
    </div>
  </n-spin>
</template>

<style scoped>
  .export-form {
    max-height: calc(100vh - 200px);
    overflow-y: auto;
  }

  .export-section__title {
    margin: 0 0 16px;
    color: var(--textColor0);
    font-size: 16px;
    font-weight: 700;
  }

  .export-columns-grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 16px;
  }

  .export-checkbox-item {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    color: var(--textColor1);
    font-size: 14px;
  }

  .export-checkbox-item :deep(.n-checkbox-box) {
    border-radius: 999px;
  }

  .export-divider {
    margin: 24px 0 !important;
  }

  .export-order-list {
    display: flex;
    align-items: center;
    gap: 12px;
    min-height: 40px;
    overflow-x: auto;
    padding-bottom: 8px;
  }

  .export-order-chip {
    display: flex;
    align-items: center;
    flex-shrink: 0;
    gap: 8px;
    height: 40px;
    padding: 0 14px;
    border-radius: 10px;
    background: var(--surface-ground);
    color: var(--textColor1);
    font-size: 14px;
    white-space: nowrap;
  }

  .export-order-handle {
    color: var(--textColor2);
    cursor: grab;
  }

  @media (max-width: 1023px) {
    .export-columns-grid {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
  }

  @media (max-width: 767px) {
    .export-columns-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 479px) {
    .export-columns-grid {
      grid-template-columns: minmax(0, 1fr);
    }
  }
</style>
