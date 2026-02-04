<script setup>
import {CheckmarkCircle24Regular, SubtractCircle16Regular, ChevronRight12Regular} from "@vicons/fluent"

const props = defineProps({
  item:{
    type: Object,
    required: true
  },
  expanded:{
    type: Boolean,
    required: true
  },
  selectedIds:{
    type: Array,
    default: ()=>[],
  }
})

const changeStatus = {
  1: 'primary',
  2: 'warning',
  3: 'error'
}

const emits = defineEmits(['toggle'])

const selectedSet = computed(()=> new Set(props.selectedIds))
</script>

<template>
  <div class="w-full flex flex-col mb-2">
    <div @click="emits('toggle', item.id)" class="flex justify-between items-center cursor-pointer px-4 py-2 border border-surface-line rounded-xl bg-surface-section drop-shadow-sm text-secondary font-medium">
      <span class="line-clamp-1">{{item.name}}</span>
      <n-button circle size="small">
        <template #icon>
          <ChevronRight12Regular :class="[expanded && 'rotate-90']"/>
        </template>
      </n-button>
    </div>
  </div>
  <n-collapse-transition :show="expanded">
    <n-timeline  v-if="expanded">
      <template v-for="position in item.positions" :key="position.id">
        <n-timeline-item
            class="ml-[10px] w-[100%-10px]"
            type="warning">
          <template #icon>
            <n-icon size="24" :class="selectedSet.has(position.id) && 'text-success'">
              <CheckmarkCircle24Regular v-if="selectedSet.has(position.id)" />
              <SubtractCircle16Regular v-else />
            </n-icon>
          </template>
          <template #header>
            <n-checkbox :value="position.id" class="flex w-full gap-2 bg-surface-section px-2 py-1 rounded-lg border border-surface-line">
              <div class="w-full font-medium">
                {{position.name}}
              </div>
              <div class="flex justify-between gap-2 w-full mt-2">
                <div class="flex gap-2">
                  <n-tag round size="tiny">{{$t('departmentPositionPage.form.rate') +' - '+ position.rate}}</n-tag>
                  <n-tag round size="tiny">{{$t('departmentPositionPage.form.group') +' - '+ position.group}}</n-tag>
                    <n-tag round size="tiny">{{$t('departmentPositionPage.form.rank') +' - '+ position.rank}}</n-tag>
                  <n-tag round size="tiny">{{$t('departmentPositionPage.form.salary') +' - '+ position.amount+ ' ' + $t('content.sum')}}</n-tag>
                </div>
                <div>
                  <n-tag round  :type="changeStatus[position?.changed_status?.id]" size="tiny">{{position?.changed_status?.name}}</n-tag>
                </div>
              </div>
            </n-checkbox>

          </template>
        </n-timeline-item>
      </template>
    </n-timeline>
  </n-collapse-transition>
</template>
