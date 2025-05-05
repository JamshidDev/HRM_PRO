<script setup>
import {ChevronDown28Regular} from '@vicons/fluent'

defineProps({
  tree: Object,
  collapsable: {
    type: Boolean,
    default: true
  }
})

const collapsed = shallowRef(false)

const toggleCollapse = () => {
  collapsed.value = !collapsed.value
}

</script>

<template>
  <table>
    <tbody>
    <tr>
      <td :colspan="(tree?.children?.length || 1)" class="relative px-2!">
        <div class="flex justify-center">
          <slot :data="tree">
            <p class="text-center bg-surface-section rounded-md border border-surface-line p-2 ">{{ tree?.name }}</p>
          </slot>
        </div>
        <slot name="collapse" :toggleCollapse="toggleCollapse" :collapsed="collapsed">
          <div v-if="tree?.children?.length" class="absolute bottom-0 left-[50%] translate-x-[-50%] translate-y-[50%]">
            <div @click="toggleCollapse"
                 class="shadow-sm border border-surface-line rounded-full w-[20px] h-[20px] flex justify-center items-center bg-surface-section cursor-pointer">
              <n-icon :component="ChevronDown28Regular"
                      :style="{transform: collapsed ? 'rotate(180deg)' : 'rotate(0deg)'}"/>
            </div>
          </div>
        </slot>
      </td>
    </tr>
    <template v-if="tree?.children?.length">
      <tr class="connector_top" :style="{visibility: collapsed ? 'hidden' : 'inherit'}">
        <td :colspan="(tree?.children?.length || 1)">
          <div class="flex">
            <div class="border-r border-black basis-auto grow">
              &nbsp;
            </div>
            <div class="basis-auto grow">
              &nbsp;
            </div>
          </div>
        </td>
      </tr>
      <tr class="connector" :style="{visibility: collapsed ? 'hidden' : 'inherit'}">
        <template v-for="(child, idx) in tree.children" :key="idx">
          <td>
            <div class="flex">
              <div class="border-r border-t border-black basis-auto grow">
                &nbsp;
              </div>
              <div class="basis-auto border-t grow">
                &nbsp;
              </div>
            </div>
          </td>
        </template>
      </tr>
      <tr :style="{visibility: collapsed ? 'hidden' : 'inherit'}">
        <td v-for="(child, idx) in tree.children" :key="idx" class="align-top">
          <HierarchyNode :tree="child">
            <template #default="{ data }" v-if="$slots.default">
              <slot :data="data" />
            </template>

            <template #collapse="{ toggleCollapse, collapsed }" v-if="$slots.collapse">
              <slot name="collapse" :toggleCollapse="toggleCollapse" :collapsed="collapsed" />
            </template>
          </HierarchyNode>
        </td>
      </tr>
    </template>
    </tbody>
  </table>
</template>

<style scoped>
table {
  td {
    padding: 0;
  }
}

.connector, .connector_top {
  div {
    user-select: none;
  }
}

.connector {
  td:first-child {
    div:first-child {
      border: none;
    }

    div:nth-child(2) {
      border-left: 1px solid black;
      border-top-left-radius: 10px;
    }
  }

  td:last-child {
    div:last-child {
      border-top: none;
    }

    div:nth-last-child(2) {
      border-top-right-radius: 10px;
    }
  }

  td:first-child:last-child {
    div:nth-child(2) {
      border-radius: 0;
    }
  }
}
</style>