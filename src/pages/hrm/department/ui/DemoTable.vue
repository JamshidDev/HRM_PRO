<script setup>
  import { ref } from 'vue'
  import { VTable } from '@components'

  // 10,000 ta test data
  const data = ref(
    Array.from({ length: 100 }, (_, i) => ({
      id: i + 1,
      name: `Foydalanuvchi ${i + 1}`,
      email: `user${i + 1}@example.com`,
      role: ['Admin', 'User', 'Manager'][i % 3],
      status: i % 2 === 0 ? 'Faol' : 'Nofaol',
      createdAt: new Date(Date.now() - i * 86400000).toLocaleDateString('uz'),
      createdAt2: new Date(Date.now() - i * 86400000).toLocaleDateString('uz')
    }))
  )

  // Columns config
  const columns = [
    { key: 'id', title: 'ID', width: 80, align: 'center' },
    { key: 'name', title: 'Ism', minWidth: 150, width: 300 },
    { key: 'email', title: 'Email', minWidth: 200 },
    { key: 'role', title: 'Rol', width: 120 },
    { key: 'status', title: 'Status', width: 100, align: 'center' },
    { key: 'createdAt', title: 'Yaratilgan', width: 120 },
    { key: 'name2', title: 'Ism', minWidth: 150 },
    { key: 'email3', title: 'Email', minWidth: 600 },
    { key: 'role5', title: 'Rol', width: 120 },
    { key: 'createdAt2', title: 'Yaratilgan', width: 120 },
    { key: 'role5', title: 'Act', width: 60, fixed: 'right', stickyOffset: 0 }
  ]

  // Row click handler
  const onRowClick = (row, index) => {
    console.log('Row clicked:', row, index)
  }
</script>

<template>
  <div class="demo">
    <h2>VTable Demo - {{ data.length.toLocaleString() }} ta qator</h2>
    <VTable
      :columns="columns"
      :bordered="true"
      :column-border="true"
      :row-border="true"
      :data="data"
      :max-height="'calc(100vh - 260px)'"
      row-key="id"
      striped
      @row-click="onRowClick"
    >
      <!-- Custom cell slot misoli -->
      <template #cell-status="{ value }">
        <span
          class="status-badge"
          :class="value === 'Faol' ? 'status-badge--active' : 'status-badge--inactive'"
        >
          {{ value }}
        </span>
      </template>

      <!-- Custom header slot -->
      <template #header-name="{ column }">
        <strong>👤 {{ column.title }}</strong>
      </template>
    </VTable>
  </div>
</template>

<style>
  .demo {
    padding: 24px;
    width: 100%;
    margin: 0 auto;
  }

  .demo h2 {
    margin-bottom: 16px;
    color: #1f2937;
  }

  .status-badge {
    display: inline-block;
    padding: 4px 12px;
    border-radius: 12px;
    font-size: 12px;
    font-weight: 500;
  }

  .status-badge--active {
    background: #d1fae5;
    color: #065f46;
  }

  .status-badge--inactive {
    background: #fee2e2;
    color: #991b1b;
  }
</style>
