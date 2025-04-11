<script setup>
import {BaseTree, OpenIcon} from '@he-tree/vue'
import {useTurnstileOrganizationStore} from "@/store/modules/index.js";
import {ChevronDown12Filled} from '@vicons/fluent'
const store = useTurnstileOrganizationStore()

const onClickNode = (v) => {
  if (store.payload.organization_id !== v.data.id) {
    store.payload.organization_id = v.data.id
    store._show()
  }
}

</script>
<template>
  <div class="organization-turnstile">
    <BaseTree style="max-height: calc(100vh - 140px);" virtualization class="relative mtl-tree"

              @click:node="onClickNode"  :model-value="store.tree" tree-line>
      <template #prepend="{ tree }">
        <div class="sticky top-0 bg-surface-section flex justify-between z-10 font-bold">
          <div class="!text-start">{{ $t('turnstile.organization.title') }}</div>
          <div class="min-w-[80px]">{{ $t('turnstile.terminalPage.title') }}</div>
        </div>
      </template>
      <template #default="{ node, stat, indentStyle, tree }">
        <div class="flex justify-between w-full cursor-pointer" :class="{'active': store.payload.organization_id === node.id}">
          <div class="flex gap-1 items-center">
            <div class="flex">
              <OpenIcon
                  v-if="stat.children.length"
                  :open="stat.open"
                  class="mtl-mr"
                  @click.stop="stat.open = !stat.open"
              />
              <n-checkbox
                  :checked="store.payload.organization_id === node.id"
              ></n-checkbox>
            </div>

            <p>{{ node.name }}</p>
          </div>
          <div class="!text-center min-w-[80px]">
            <n-button size="tiny" v-if="node?.terminals_count" circle>{{node?.terminals_count}}</n-button>
          </div>
        </div>
      </template>
    </BaseTree>
  </div>
</template>
<style lang="scss">
.organization-turnstile {
  tr {
    cursor: pointer;
  }

  .active {
    background: #ddeff9 !important;
  }

}
</style>