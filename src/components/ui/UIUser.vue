<script setup>
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
  import UIHighlight from './UIHighlight.vue'
  const props = defineProps({
    short: {
      type: Boolean,
      default: true
    },
    data: {
      photo: {
        type: String,
        default: null
      },
      lastName: String,
      firstName: String,
      middleName: String,
      position: {
        type: String,
        default: null
      }
    },
    roundAvatar: {
      type: Boolean,
      default: true
    },
    avatarClickable: {
      type: Boolean,
      default: true
    },
    hideTooltip: {
      type: Boolean,
      default: false
    },
    overLine: {
      type: Boolean,
      default: false
    },
    showOnlineBadge: {
      type: Boolean,
      default: false
    },
    // Qidiruv so'zi — ism ichida sariq bilan belgilanadi (bo'sh bo'lsa hech narsa o'zgarmaydi)
    highlight: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['onClickFullName'])

  // Bo'sh qismlar tashlab yuboriladi — aks holda ism o'rnida «undefined» chiqardi
  // (masalan, otasining ismi yo'q xodim yoki backend tuzgan eski forma).
  const fullName = computed(() =>
    [props.data?.lastName, props.data?.firstName, props.data?.middleName].filter(Boolean).join(' ')
  )

  // «Familiya I.O.» — Raximov J.Sh.
  const shortName = computed(() =>
    Utils.shortFio(props.data?.lastName, props.data?.firstName, props.data?.middleName)
  )

  // Rasm yo'q bo'lsa (placeholder ko'rinadi) yoki `avatarClickable` o'chiq bo'lsa — ko'ruvchi ochilmaydi,
  // aks holda bo'sh rasm bilan ochilardi.
  const onOpen = () => {
    if (!props.avatarClickable || !props.data?.photo) return
    window.$openViewer(props.data.photo)
  }
</script>

<template>
  <div v-bind="$attrs" class="ui__user-component flex items-center gap-x-2 cursor-pointer relative">
    <n-avatar
      size="large"
      :round="roundAvatar"
      :src="data?.photo || useAppSetting.noAvailableImage"
      :fallback-src="Utils.noAvailableImage"
      @click.stop="onOpen"
    />
    <span v-if="showOnlineBadge" class="absolute bottom-[0px] left-[32px] flex size-2">
      <span
        class="absolute inline-flex h-full w-full animate-ping rounded-full bg-success/90 opacity-75"
      ></span>
      <span class="relative inline-flex size-2 rounded-full bg-success"></span>
    </span>

    <div @click="emits('onClickFullName')" class="flex flex-col" style="width: calc(100% - 50px)">
      <slot name="name" :title="short ? shortName : fullName">
        <n-tooltip v-if="short" :disabled="hideTooltip" trigger="hover">
          <template #trigger>
            <span
              :class="[overLine && 'line-through']"
              class="text-sm text-textColor2 leading-[1.2] w-full truncate"
            >
              <UIHighlight :text="shortName" :query="highlight" />
            </span>
          </template>
          <span>{{ fullName }}</span>
        </n-tooltip>

        <n-ellipsis
          v-else
          :tooltip="!hideTooltip"
          :class="[overLine && 'line-through']"
          class="w-full text-sm text-textColor2 leading-[1.2]"
        >
          <UIHighlight :text="fullName" :query="highlight" />
        </n-ellipsis>
      </slot>

      <slot name="position">
        <n-ellipsis :tooltip="!hideTooltip" class="w-full text-xs text-textColor3">
          {{ data?.position }}
        </n-ellipsis>
      </slot>
    </div>
  </div>
</template>
