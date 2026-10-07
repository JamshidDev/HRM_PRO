<script setup>
  import { Building16Regular, ChevronRight16Regular } from '@vicons/fluent'
  import { UIMenuButton } from '@/components/index.js'
  const props = defineProps({
    children: Array,
    deep: {
      type: Number,
      default: 0
    },
    id: {
      type: String,
      default: '0'
    },
    // Har bir ajdod darajasi uchun: shu darajada vertikal chiziq davom etadimi
    // (ajdod o'z ro'yxatida oxirgi bo'lmasa — davom etadi). Ilgari chiziq har
    // darajada doim chizilardi va oxirgi tugunlar ostida ham "osilib" qolardi.
    lines: {
      type: Array,
      default: () => []
    },
    elementId: {
      type: String,
      default: null
    },
    actionLoading: {
      type: Boolean,
      default: false
    },
    actionLoadingId: {
      type: [Number, String],
      default: null
    },
    expandedKeys: {
      type: Array,
      default: () => []
    }
  })

  const emits = defineEmits(['onLoad', 'onChange', 'onToggle'])

  const onLoad = (v) => {
    emits('onLoad', v)
  }

  const onChange = (v) => {
    emits('onChange', v)
  }

  const onMenuSelect = (item, idx, ev) => {
    const payload = {
      id: item.id,
      name: item.name,
      index: `${props.id}-${idx}`
    }
    if (ev.key === 'edit') {
      onChange({ ...payload, type: 'update' })
    } else if (ev.key === 'delete') {
      onChange({ ...payload, type: 'delete' })
    } else if (ev.key === 'attachment') {
      onChange({ ...payload, type: 'create' })
    }
  }

  const isExpanded = (key) => props.expandedKeys.includes(key)

  const onToggle = (v) => {
    emits('onToggle', v)
  }

  // Butun qator bosiladi (faqat kichik strelka emas). Bolalar yuklanayotganda
  // (`elementId` band) boshqa tugunlar ochilmaydi — avvalgidek.
  const handleToggle = (item, key) => {
    if (!item?.isHaveChild || props.elementId != null) return
    const opened = isExpanded(key)
    if (!opened && (!Array.isArray(item.children) || item.children.length === 0)) {
      onLoad({ index: key, id: item.id })
    }
    onToggle(key)
  }

  const isLastItem = (idx) => idx === props.children.length - 1

  // Nomdagi qo'shtirnoq va belgilarni tashlab, birinchi harf — avatar uchun.
  const initial = (name) => (name || '').replace(/[^\p{L}\p{N}]/gu, '').charAt(0).toUpperCase()

  // To'liq nom ko'pincha qisqa nom bilan bir xil — takror qatorni ko'rsatmaymiz.
  const normalize = (v) => (v || '').replace(/[^\p{L}\p{N}]/gu, '').toLowerCase()
  const showFullName = (item) => item.fullName && normalize(item.fullName) !== normalize(item.name)
</script>

<template>
  <template v-for="(item, idx) in children" :key="item.id ?? idx">
    <div class="tree-row flex items-stretch">
      <span
        v-for="(cont, i) in lines"
        :key="`guide-${i}`"
        class="tree-guide"
        :class="cont && 'tree-guide--line'"
      ></span>
      <span
        v-if="deep > 0"
        class="tree-guide tree-guide--elbow"
        :class="isLastItem(idx) && 'tree-guide--last'"
      ></span>

      <div
        class="group flex flex-1 min-w-0 items-center gap-2.5 rounded-lg pl-0.5 pr-1.5 py-1.5 transition-colors duration-150"
        :class="[
          item?.isHaveChild ? 'cursor-pointer hover:bg-surface-ground' : 'hover:bg-surface-ground/60',
          isExpanded(`${id}-${idx}`) && 'bg-primary/5'
        ]"
        @click="handleToggle(item, `${id}-${idx}`)"
      >
        <span class="w-6 h-6 flex items-center justify-center shrink-0 text-secondary">
          <n-spin v-if="elementId === `${id}-${idx}`" :size="14" />
          <n-icon v-else-if="item?.isHaveChild" size="16">
            <ChevronRight16Regular
              class="transition-transform duration-200"
              :class="isExpanded(`${id}-${idx}`) && 'rotate-90 text-primary'"
            />
          </n-icon>
        </span>

        <span
          class="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm font-semibold"
          :class="
            deep === 0
              ? 'bg-primary/15 text-primary'
              : 'border border-surface-line bg-surface-section text-secondary'
          "
        >
          <template v-if="initial(item.name)">{{ initial(item.name) }}</template>
          <n-icon v-else size="16"><Building16Regular /></n-icon>
        </span>

        <div class="min-w-0 flex-1">
          <div
            class="truncate text-sm leading-[1.3]"
            :class="deep === 0 ? 'font-semibold text-textColor0' : 'font-medium text-textColor0'"
            :title="item.name"
          >
            {{ item.name }}
          </div>
          <div
            v-if="showFullName(item)"
            class="truncate text-xs leading-[1.3] text-secondary"
            :title="item.fullName"
          >
            {{ item.fullName }}
          </div>
        </div>

        <div
          class="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity"
          :class="props.actionLoading && props.actionLoadingId === item.id && 'opacity-100'"
          @click.stop
        >
          <UIMenuButton
            :data="item"
            :show-edit="true"
            :show-delete="true"
            :show-attachment="true"
            :loading="props.actionLoading && props.actionLoadingId === item.id"
            @selectEv="(ev) => onMenuSelect(item, idx, ev)"
          />
        </div>
      </div>
    </div>

    <Transition name="tree-expand">
      <div v-if="isExpanded(`${id}-${idx}`)">
        <UITree
          :element-id="elementId"
          :action-loading="props.actionLoading"
          :action-loading-id="props.actionLoadingId"
          :expanded-keys="props.expandedKeys"
          :children="item.children"
          :lines="deep > 0 ? [...lines, !isLastItem(idx)] : []"
          @on-load="onLoad"
          @on-change="onChange"
          @on-toggle="onToggle"
          :deep="deep + 1"
          :id="`${id}-${idx}`"
        />
      </div>
    </Transition>
  </template>
</template>

<style scoped>
  /* Har bir daraja ustuni 28px: chiziq markazi (14px) ota qatordagi strelka
     markaziga to'g'ri keladi (pl-0.5 + 24px/2). */
  .tree-guide {
    position: relative;
    width: 28px;
    flex-shrink: 0;
  }

  .tree-guide--line::before,
  .tree-guide--elbow::before {
    content: '';
    position: absolute;
    left: 14px;
    top: 0;
    bottom: 0;
    width: 1px;
    background: color-mix(in srgb, var(--primary-color) 35%, transparent);
  }

  .tree-guide--last::before {
    bottom: 50%;
  }

  .tree-guide--elbow::after {
    content: '';
    position: absolute;
    left: 14px;
    right: 2px;
    top: 50%;
    height: 1px;
    background: color-mix(in srgb, var(--primary-color) 35%, transparent);
  }

  .tree-expand-enter-active,
  .tree-expand-leave-active {
    transition:
      opacity 0.18s ease,
      transform 0.18s ease;
  }

  .tree-expand-enter-from,
  .tree-expand-leave-to {
    opacity: 0;
    transform: translateY(-4px);
  }
</style>
