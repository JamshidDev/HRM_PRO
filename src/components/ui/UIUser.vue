<script setup>
  import Utils from '@/utils/Utils.js'
  import { useAppSetting } from '@/utils/index.js'
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
    }
  })

  const emits = defineEmits(['onClickFullName'])

  const fullName = computed(
    () => `${props.data?.lastName} ${props.data?.firstName} ${props.data?.middleName} `
  )

  const shortName = computed(
    () => `${props.data?.lastName}.${props.data?.firstName?.[0]}.${props.data?.middleName?.[0]} `
  )

  const onOpen = () => {
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
              {{ shortName }}
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
          {{ fullName }}
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
