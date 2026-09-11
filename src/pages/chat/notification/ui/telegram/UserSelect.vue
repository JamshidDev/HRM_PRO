<script setup>
  // Telegram broadcast uchun user tanlash — qidiruv + cheksiz skroll.
  // FCM formasidagi `UserRoleInfiniteSelect` dan farqi: «hammasi/unCheck» va
  // korxona/rol filtrlari yo'q (bu yerda «barchaga» alohida rejim).
  import { NAvatar } from 'naive-ui'
  import { DismissCircle20Filled } from '@vicons/fluent'

  const model = defineModel({ type: Array, default: () => [] })

  const params = reactive({ page: 1, per_page: 15, search: null })
  const options = ref([])
  const total = ref(0)
  const loading = ref(false)
  // Tanlangan userni tag'da ko'rsatish uchun — ro'yxat skrollda o'zgarsa ham nom qoladi.
  const userMap = reactive({})

  const load = () => {
    loading.value = true
    $ApiService.workerService
      ._userRole({ params })
      .then((res) => {
        const rows = res.data.data.data.map((i) => ({
          id: i.id,
          fullName: [i.worker?.last_name, i.worker?.first_name, i.worker?.middle_name]
            .filter(Boolean)
            .join(' '),
          photo: i.worker?.photo,
          position: i?.current_organization?.name
        }))
        rows.forEach((r) => (userMap[r.id] = r))
        options.value.push(...rows)
        total.value = res.data.data.total
      })
      .finally(() => {
        loading.value = false
      })
  }

  const onScroll = (e) => {
    if (options.value.length >= total.value || loading.value) return
    const el = e.currentTarget
    if (el.scrollTop + el.offsetHeight >= el.scrollHeight - 40) {
      params.page += 1
      load()
    }
  }

  let searchTimer = null
  const searchModel = ref(null)
  const onSearch = () => {
    clearTimeout(searchTimer)
    searchTimer = setTimeout(() => {
      params.search = searchModel.value || null
      params.page = 1
      options.value = []
      load()
    }, 400)
  }

  // Ichki `filterable` YO'Q: qidiruv serverda (#header input) — ikkinchi, mijoz
  // tomonidagi filtr kelgan natijalarni yashirib qo'yardi.
  // `render-label` (❗`render-option` EMAS): `render-option` naive'ning o'z option
  // node'ini almashtiradi va u bilan birga click handler ham yo'qoladi —
  // ro'yxatdan user tanlab bo'lmay qoladi.
  const renderLabel = (option) => {
    return h('div', { class: 'flex items-center gap-2 py-1' }, [
      h(NAvatar, { round: true, size: 26, src: option.photo }),
      h('div', { class: 'min-w-0' }, [
        h('div', { class: 'truncate text-sm' }, option.fullName),
        option.position
          ? h('div', { class: 'truncate text-xs text-gray-400' }, option.position)
          : null
      ])
    ])
  }

  const renderTag = ({ option }) =>
    h('span', { class: 'flex items-center gap-1 px-1' }, [
      h('span', { class: 'line-clamp-1' }, userMap[option.id]?.fullName ?? option.id),
      h(
        'span',
        {
          class: 'text-danger/80 cursor-pointer flex items-center',
          onClick: (e) => {
            e.stopPropagation()
            model.value = model.value.filter((x) => x !== option.id)
          }
        },
        h(DismissCircle20Filled, { class: 'size-4' })
      )
    ])

  onMounted(load)
</script>

<template>
  <n-select
    v-model:value="model"
    multiple
    :placeholder="$t('content.choose')"
    :options="options"
    :loading="loading"
    :render-label="renderLabel"
    :render-tag="renderTag"
    label-field="fullName"
    value-field="id"
    :max-tag-count="2"
    :reset-menu-on-options-change="false"
    :virtual-scroll="true"
    :menu-props="{ class: 'p-2' }"
    @scroll="onScroll"
  >
    <template #header>
      <n-input
        v-model:value="searchModel"
        clearable
        class="w-full"
        :placeholder="$t('content.search')"
        @keyup="onSearch"
        @clear="onSearch"
        @keydown.stop
      />
    </template>
  </n-select>
</template>
