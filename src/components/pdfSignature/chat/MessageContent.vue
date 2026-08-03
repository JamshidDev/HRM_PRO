<script setup>
  import i18n from '@/i18n/index.js'
  import { useAppSetting } from '@/utils/index.js'
  import { NIcon } from 'naive-ui'
  import { Delete16Regular, Edit16Regular } from '@vicons/fluent'
  const { t } = i18n.global
  const props = defineProps({
    message: {
      type: String,
      default: ''
    },
    author: {
      type: Boolean,
      default: false
    },
    fullName: {
      type: String,
      default: ''
    },
    avatar: {
      type: String,
      default: ''
    },
    time: {
      type: String,
      default: ''
    }
  })

  const emits = defineEmits(['onDelete'])

  const showDropdown = ref(false)
  const x = ref(0)
  const y = ref(0)
  const options = [
    {
      icon: renderIcon(Delete16Regular),
      label: t('content.delete'),
      key: 'delete'
    }
  ]

  function renderIcon(icon) {
    return () => {
      return h(NIcon, null, {
        default: () => h(icon)
      })
    }
  }

  const handleContextMenu = (e) => {
    e.preventDefault()
    showDropdown.value = false
    nextTick().then(() => {
      showDropdown.value = true
      x.value = e.clientX
      y.value = e.clientY
    })
  }
  const onClickOutside = () => {
    showDropdown.value = false
  }

  const handleSelect = (key) => {
    showDropdown.value = false
    if (options[0].key === key) {
      emits('onDelete')
    }
  }
</script>

<template>
  <div class="flex w-full my-2" :class="[author && 'justify-end']">
    <template v-if="author">
      <div class="flex gap-x-2 justify-end">
        <div>
          <div class="text-xs font-medium text-textColor1 flex justify-end">
            <span class="text-[12px] font-normal text-textColor3 mr-1"> {{ time }} </span>
            {{ fullName }}
          </div>
          <div class="w-full flex justify-end">
            <div
              @contextmenu="handleContextMenu($event)"
              class="max-w-[280px] text-textColor1 rounded-lg text-sm px-2 py-1 inline-block bg-primary/10"
            >
              <pre class="font-poppins text-wrap">{{ message }}</pre>
            </div>
          </div>
        </div>
        <div class="w-[40px] ui__avatar-border">
          <n-avatar class="mr-2 mt-4" circle :src="avatar || useAppSetting.noAvailableImage" :fallback-src="useAppSetting.noAvailableImage" />
        </div>
      </div>
    </template>

    <template v-else>
      <div class="flex gap-x-2">
        <div class="w-[40px] ui__avatar-border">
          <n-avatar class="ml-2 mt-4" circle :src="avatar || useAppSetting.noAvailableImage" :fallback-src="useAppSetting.noAvailableImage" />
        </div>
        <div>
          <div class="text-xs font-medium text-textColor1">
            {{ fullName }} <span class="text-[12px] font-normal text-textColor3">{{ time }}</span>
          </div>
          <div
            class="max-w-[280px] text-textColor1 rounded-lg text-sm px-2 py-1 inline-block bg-surface-ground"
          >
            <pre class="font-poppins text-wrap">{{ message }}</pre>
          </div>
        </div>
      </div>
    </template>
    <n-dropdown
      placement="bottom-start"
      trigger="manual"
      :x="x"
      :y="y"
      :options="options"
      :show="showDropdown"
      :on-clickoutside="onClickOutside"
      @select="handleSelect"
    />
  </div>
</template>

<style scoped></style>
