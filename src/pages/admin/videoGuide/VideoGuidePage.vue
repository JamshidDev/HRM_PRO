<script setup>
  /**
   * Video qo'llanmalarni boshqarish: video va muqova MinIO'ga to'g'ridan-to'g'ri yuklanadi (backend orqali o'tmaydi).
   */
  import { NButton, NImage, NPopconfirm, NTag } from 'naive-ui'
  import { UIModal, UIPageContent } from '@/components/index.js'
  import { useAccountStore } from '@/store/modules/index.js'
  import { GUIDE_CATEGORIES, formatDuration } from '@/pages/app/guides/categories.js'
  import i18n from '@/i18n/index.js'

  const { t } = i18n.global
  const acc = useAccountStore()
  const api = () => $ApiService.videoGuideService
  const canDelete = computed(() => acc.checkPermission(acc.pn.videoGuidesDelete))

  const rows = ref([])
  const loading = ref(false)
  const load = () => {
    loading.value = true
    api()._adminIndex().then((r) => (rows.value = r.data.data || [])).finally(() => (loading.value = false))
  }

  const emptyForm = () => ({
    id: null,
    title: { uz: '', ru: '', en: '' },
    description: { uz: '', ru: '', en: '' },
    platform: 'all',
    category: 'general',
    sort: 1,
    status: 1,
    video_path: null,
    poster_path: null,
    duration: null,
    size: null,
    poster_preview: null
  })
  const form = ref(emptyForm())
  const visible = ref(false)
  const saving = ref(false)
  const upload = ref({ busy: false, label: '', progress: 0 })

  const platformOptions = computed(() => ['all', 'web', 'mobile'].map((v) => ({ value: v, label: t(`videoGuidePage.platform.${v}`) })))
  const categoryOptions = computed(() => GUIDE_CATEGORIES.map((v) => ({ value: v, label: t(`guidesPage.categories.${v}`) })))

  const openCreate = () => {
    // Yangi video ketma-ketlikning oxiriga qo'shiladi.
    form.value = { ...emptyForm(), sort: Math.max(0, ...rows.value.map((r) => r.sort || 0)) + 1 }
    visible.value = true
  }
  const openEdit = (row) => {
    form.value = {
      ...emptyForm(),
      ...row,
      title: { uz: '', ru: '', en: '', ...(row.title || {}) },
      description: { uz: '', ru: '', en: '', ...(row.description || {}) },
      poster_preview: row.poster_url
    }
    visible.value = true
  }

  // Fayl → imzolangan havola → MinIO; qaytaradi saqlangan yo'lni.
  const putFile = async (file, kind, label) => {
    const ext = (file.name?.split('.').pop() || (kind === 'poster' ? 'jpg' : 'mp4')).toLowerCase()
    upload.value = { busy: true, label, progress: 0 }
    try {
      const res = await api()._uploadUrl({ data: { kind, extension: ext, size: file.size, content_type: file.type || 'application/octet-stream' } })
      const { path, upload_url } = res.data.data
      await api()._putToStorage(upload_url, file, (p) => (upload.value.progress = Math.round(p * 100)))
      return path
    } finally {
      upload.value.busy = false
    }
  }

  // Videoning davomiyligi va 1-soniyadagi kadri (muqova) brauzerda olinadi.
  const probeVideo = (file) =>
    new Promise((resolve) => {
      const v = document.createElement('video')
      v.preload = 'metadata'
      v.muted = true
      v.src = URL.createObjectURL(file)
      v.onloadedmetadata = () => (v.currentTime = Math.min(1, (v.duration || 2) / 2))
      v.onseeked = () => {
        const c = document.createElement('canvas')
        c.width = v.videoWidth
        c.height = v.videoHeight
        c.getContext('2d').drawImage(v, 0, 0)
        c.toBlob((blob) => {
          URL.revokeObjectURL(v.src)
          resolve({ duration: Math.round(v.duration), poster: blob })
        }, 'image/jpeg', 0.86)
      }
      v.onerror = () => resolve({ duration: null, poster: null })
    })

  const onVideo = async ({ file }) => {
    const f = file.file
    if (!f) return
    const { duration, poster } = await probeVideo(f)
    form.value.video_path = await putFile(f, 'video', t('videoGuidePage.uploadingVideo'))
    form.value.size = f.size
    form.value.duration = duration
    if (poster && !form.value.poster_path) {
      const pf = new File([poster], 'poster.jpg', { type: 'image/jpeg' })
      form.value.poster_path = await putFile(pf, 'poster', t('videoGuidePage.uploadingPoster'))
      form.value.poster_preview = URL.createObjectURL(poster)
    }
    window.$Toast?.success(t('videoGuidePage.uploaded'))
  }
  const onPoster = async ({ file }) => {
    const f = file.file
    if (!f) return
    form.value.poster_path = await putFile(f, 'poster', t('videoGuidePage.uploadingPoster'))
    form.value.poster_preview = URL.createObjectURL(f)
  }

  const save = async () => {
    if (!form.value.title.uz?.trim() || !form.value.video_path) {
      $Alert.validation(t('videoGuidePage.required'))
      return
    }
    saving.value = true
    const f = form.value
    const data = {
      title: f.title,
      description: f.description,
      platform: f.platform,
      category: f.category,
      sort: f.sort,
      status: f.status,
      video_path: f.video_path,
      poster_path: f.poster_path,
      duration: f.duration ?? undefined,
      size: f.size ?? undefined
    }
    try {
      if (f.id) await api()._adminUpdate({ id: f.id, data })
      else await api()._adminCreate({ data })
      visible.value = false
      load()
    } finally {
      saving.value = false
    }
  }

  const remove = (row) => api()._adminDelete({ id: row.id }).then(load)

  const columns = computed(() => [
    { title: '№', key: 'sort', width: 60 },
    {
      title: '',
      key: 'poster',
      width: 120,
      render: (r) => (r.poster_url ? h(NImage, { src: r.poster_url, width: 104, height: 58, objectFit: 'cover', style: 'border-radius:8px' }) : '—')
    },
    { title: t('videoGuidePage.form.title'), key: 'title', render: (r) => r.title?.uz },
    { title: t('videoGuidePage.form.platform'), key: 'platform', width: 120, render: (r) => t(`videoGuidePage.platform.${r.platform}`) },
    { title: t('videoGuidePage.form.category'), key: 'category', width: 150, render: (r) => t(`guidesPage.categories.${r.category}`) },
    { title: t('videoGuidePage.duration'), key: 'duration', width: 110, render: (r) => formatDuration(r.duration) },
    {
      title: t('videoGuidePage.form.status'),
      key: 'status',
      width: 130,
      render: (r) => h(NTag, { type: r.status === 2 ? 'success' : 'default', size: 'small', round: true }, () => t(r.status === 2 ? 'videoGuidePage.published' : 'videoGuidePage.draft'))
    },
    { title: t('videoGuidePage.views'), key: 'views_count', width: 90 },
    {
      title: '',
      key: 'actions',
      width: 170,
      render: (r) =>
        h('div', { class: 'flex gap-2' }, [
          h(NButton, { size: 'small', onClick: () => openEdit(r) }, () => t('content.edit')),
          canDelete.value
            ? h(NPopconfirm, { onPositiveClick: () => remove(r) }, { trigger: () => h(NButton, { size: 'small', type: 'error', ghost: true }, () => t('content.delete')), default: () => t('videoGuidePage.confirmDelete') })
            : null
        ])
    }
  ])

  onMounted(load)
</script>

<template>
  <UIPageContent class="!gap-4">
    <div class="flex w-full items-center justify-between gap-4">
      <h1 class="text-[22px] font-semibold text-fig-text-primary">{{ $t('videoGuidePage.name') }}</h1>
      <n-button type="primary" @click="openCreate">{{ $t('content.add') }}</n-button>
    </div>
    <n-data-table :columns="columns" :data="rows" :loading="loading" :row-key="(r) => r.id" />

    <UIModal v-model:visible="visible" :width="720" :title="$t(form.id ? 'videoGuidePage.edit' : 'videoGuidePage.create')">
      <n-form label-placement="top">
        <div class="grid grid-cols-1 gap-x-3 sm:grid-cols-3">
          <n-form-item :label="`${$t('videoGuidePage.form.title')} (UZ)`" required><n-input v-model:value="form.title.uz" maxlength="255" /></n-form-item>
          <n-form-item :label="`${$t('videoGuidePage.form.title')} (RU)`"><n-input v-model:value="form.title.ru" maxlength="255" /></n-form-item>
          <n-form-item :label="`${$t('videoGuidePage.form.title')} (EN)`"><n-input v-model:value="form.title.en" maxlength="255" /></n-form-item>
        </div>
        <n-form-item :label="`${$t('videoGuidePage.form.description')} (UZ)`">
          <n-input v-model:value="form.description.uz" type="textarea" :autosize="{ minRows: 2, maxRows: 4 }" maxlength="2000" />
        </n-form-item>
        <div class="grid grid-cols-1 gap-x-3 sm:grid-cols-4">
          <n-form-item :label="$t('videoGuidePage.form.platform')"><n-select v-model:value="form.platform" :options="platformOptions" /></n-form-item>
          <n-form-item :label="$t('videoGuidePage.form.category')"><n-select v-model:value="form.category" :options="categoryOptions" /></n-form-item>
          <n-form-item :label="$t('videoGuidePage.form.sort')"><n-input-number v-model:value="form.sort" :min="0" class="w-full" /></n-form-item>
          <n-form-item :label="$t('videoGuidePage.form.status')">
            <n-switch :value="form.status === 2" @update:value="(v) => (form.status = v ? 2 : 1)">
              <template #checked>{{ $t('videoGuidePage.published') }}</template>
              <template #unchecked>{{ $t('videoGuidePage.draft') }}</template>
            </n-switch>
          </n-form-item>
        </div>
        <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <n-form-item :label="$t('videoGuidePage.form.video')" required>
            <div class="flex w-full flex-col gap-2">
              <n-upload :default-upload="false" :show-file-list="false" accept="video/mp4,video/webm,video/quicktime" @change="onVideo">
                <n-button :disabled="upload.busy">{{ $t(form.video_path ? 'videoGuidePage.replaceVideo' : 'videoGuidePage.chooseVideo') }}</n-button>
              </n-upload>
              <span v-if="form.video_path" class="text-[13px] text-fig-text-secondary">
                ✓ {{ formatDuration(form.duration) }} · {{ form.size ? (form.size / 1048576).toFixed(1) + ' MB' : '' }}
              </span>
            </div>
          </n-form-item>
          <n-form-item :label="$t('videoGuidePage.form.poster')">
            <div class="flex w-full items-center gap-3">
              <img v-if="form.poster_preview" :src="form.poster_preview" class="h-14 w-24 rounded-lg object-cover" alt="" />
              <n-upload :default-upload="false" :show-file-list="false" accept="image/jpeg,image/png,image/webp" @change="onPoster">
                <n-button size="small" :disabled="upload.busy">{{ $t('videoGuidePage.changePoster') }}</n-button>
              </n-upload>
            </div>
          </n-form-item>
        </div>
        <div v-if="upload.busy" class="flex flex-col gap-1">
          <span class="text-[13px] text-fig-text-secondary">{{ upload.label }}</span>
          <n-progress type="line" :percentage="upload.progress" :show-indicator="true" />
        </div>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="visible = false">{{ $t('content.cancel') }}</n-button>
          <n-button type="primary" :loading="saving" :disabled="upload.busy" @click="save">{{ $t('content.save') }}</n-button>
        </div>
      </template>
    </UIModal>
  </UIPageContent>
</template>
