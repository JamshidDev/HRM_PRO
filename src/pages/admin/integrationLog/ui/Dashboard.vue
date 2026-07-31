<script setup>
  import { useIntegrationLogStore } from '@/store/modules/index.js'
  import StatCards from './cards/StatCards.vue'
  import TimelineCard from './cards/TimelineCard.vue'
  import MethodsCard from './cards/MethodsCard.vue'
  import TopClientsCard from './cards/TopClientsCard.vue'
  import TopEndpointsCard from './cards/TopEndpointsCard.vue'
  import DashboardSkeleton from './cards/DashboardSkeleton.vue'

  const store = useIntegrationLogStore()
</script>

<template>
  <!-- Skeleton -->
  <DashboardSkeleton v-if="store.dashboardLoading" />

  <!-- Content -->
  <div v-else class="grid grid-cols-12 gap-4 mt-4">

    <!-- ── Stat cards ─────────────────────────────────────────────────────── -->
    <StatCards />

    <!-- ── Timeline chart ─────────────────────────────────────────────────── -->
    <TimelineCard />

    <!-- ── Methods + Statuses ─────────────────────────────────────────────── -->
    <MethodsCard />

    <!-- ── Top Clients ─────────────────────────────────────────────────────── -->
    <TopClientsCard />

    <!-- ── Top Endpoints ───────────────────────────────────────────────────── -->
    <TopEndpointsCard />

  </div>
</template>
