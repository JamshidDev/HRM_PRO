<script setup>
  // Push xabarining to'liq ko'rinishi: rasm + sarlavha + matn.
  // Fon uchun `n-card` — u tema ranglarini (light/dark) o'zi qo'llaydi.
  import dayjs from 'dayjs'
  import { Dismiss20Filled } from '@vicons/fluent'
  import { cn, notificationTypes } from '@utils'
  import { usePushDetail } from '@/composables/usePushDetail.js'

  const { visible, detail, close } = usePushDetail()

  const type = computed(() => detail.value?.type || 'info')
  const icon = computed(() => notificationTypes?.[type.value]?.icon)
  const typeLabel = computed(() => notificationTypes?.[type.value]?.label)

  const typeTone = computed(
    () =>
      ({
        info: 'bg-info/15 text-info',
        success: 'bg-success/15 text-success',
        warning: 'bg-warning/15 text-warning',
        error: 'bg-danger/15 text-danger'
      })[type.value] || 'bg-info/15 text-info'
  )
</script>

<template>
  <n-modal v-model:show="visible" :auto-focus="false" transform-origin="center">
    <n-card
      :bordered="false"
      size="huge"
      role="dialog"
      aria-modal="true"
      class="rounded-2xl overflow-hidden"
      :style="{ width: 'min(520px, 92vw)' }"
      content-style="padding:0;"
    >
      <div class="relative">
        <img
          v-if="detail?.image_url"
          :src="detail.image_url"
          alt=""
          class="w-full h-[220px] object-cover"
        />
        <div
          @click="close"
          class="absolute top-3 right-3 size-8 rounded-full bg-black/45 hover:bg-black/65 flex items-center justify-center cursor-pointer transition-colors"
          :class="!detail?.image_url && 'bg-surface-ground hover:bg-surface-line'"
        >
          <n-icon size="15" :class="detail?.image_url ? 'text-white' : 'text-textColor1'">
            <Dismiss20Filled />
          </n-icon>
        </div>
      </div>

      <div class="p-6">
        <div class="flex items-center gap-2">
          <span
            :class="cn('inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full', typeTone)"
          >
            <component :is="icon" class="size-4" />
            <span class="text-xs font-medium">{{ typeLabel }}</span>
          </span>
          <span v-if="detail?.created_at" class="text-xs text-textColor3 ml-auto">
            {{ dayjs(detail.created_at).format('DD MMM, HH:mm') }}
          </span>
        </div>

        <h3 class="mt-4 text-xl font-semibold text-textColor0 leading-snug">
          {{ detail?.title }}
        </h3>
        <p class="mt-2 text-sm text-textColor2 whitespace-pre-line leading-relaxed">
          {{ detail?.message }}
        </p>
      </div>
    </n-card>
  </n-modal>
</template>
