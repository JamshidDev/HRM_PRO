<script setup>
  import {
    CalendarClock16Regular,
    Document24Regular,
    ArrowLeft24Regular,
    Image24Regular,
    Video24Regular,
    ArrowDownload24Regular,
    Eye24Regular,
    Tag24Regular,
    Play24Regular
  } from '@vicons/fluent'

  const news = ref({
    id: 1,
    slug: 'company-expansion-2025',
    status: 1,
    is_pinned: true,
    published_at: 1739523000000,
    author: {
      id: 5,
      name: 'Sarah Johnson',
      avatar: 'https://i.pravatar.cc/150?img=47'
    },
    categories: [
      { id: 1, name: { uz: 'Kompaniya yangiliklari', ru: 'Новости компании', en: 'Company News' } },
      { id: 2, name: { uz: 'HR yangiliklari', ru: 'HR Обновления', en: 'HR Updates' } },
      { id: 3, name: { uz: 'Kengayish', ru: 'Расширение', en: 'Expansion' } }
    ],
    translations: [
      {
        locale: 'uz',
        title: "Kompaniya 2025 yilda katta kengayish rejalarini e'lon qildi",
        short_description:
          "Kompaniyamiz uchta yangi shaharda ofislar ochish va 2025 yil oxirigacha xodimlar sonini ikki baravar oshirish rejalarini e'lon qildi.",
        content: `<h2>Yangi bob boshlanmoqda</h2><p>Kompaniyamiz yangi o'sish bosqichiga kirayotganini mamnuniyat bilan e'lon qilamiz.</p>`
      },
      {
        locale: 'ru',
        title: 'Компания объявляет о планах крупного расширения на 2025 год',
        short_description:
          'Наша компания объявила о планах открытия офисов в трёх новых городах и удвоения штата к концу 2025 года.',
        content: `<h2>Начинается новая глава</h2><p>Мы рады объявить, что наша компания вступает в новую фазу роста.</p>`
      },
      {
        locale: 'en',
        title: 'Company Announces Major Expansion Plans for 2025: New Offices, Teams & Benefits',
        short_description:
          'Our company has announced plans to open offices in three new cities and double our workforce by the end of 2025.',
        content: `
          <h2>A New Chapter Begins</h2>
          <p>We are thrilled to announce that our company is entering an exciting new phase of growth. After years of steady progress and incredible team effort, we are ready to expand our operations across three new cities and double our workforce by the end of 2025.</p>
          <p>This milestone reflects the dedication of every single team member who has contributed to our success. The journey has not been without its challenges, but we have emerged stronger and more unified than ever before.</p>
          <h2>What This Means for You</h2>
          <p>As part of this expansion, we are rolling out a comprehensive new benefits package that includes:</p>
          <ul>
            <li>Flexible remote and hybrid work arrangements</li>
            <li>Enhanced health and wellness coverage</li>
            <li>Expanded parental leave policies</li>
            <li>Professional development stipends of up to $2,000 per year</li>
            <li>Stock option plans for all full-time employees</li>
          </ul>
          <p>We believe that investing in our people is the most important investment we can make.</p>
          <h2>New Office Locations</h2>
          <p>Our new offices will open in <strong>Tashkent</strong>, <strong>Dubai</strong>, and <strong>Berlin</strong> — carefully chosen to support our growing international client base.</p>
          <blockquote>"Growth is never by mere chance; it is the result of forces working together." — CEO, Mark Reynolds</blockquote>
          <h2>Next Steps</h2>
          <p>Town hall meetings will be held across all existing offices during the week of February 24th.</p>
        `
      }
    ],
    media: [
      {
        id: 1,
        type: 'image',
        order: 0,
        url: 'https://picsum.photos/seed/news1/1600/700',
        name: 'hero-image.jpg',
        size: '2.1 MB'
      },
      {
        id: 2,
        type: 'video',
        order: 1,
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        name: 'expansion-overview.mp4',
        size: '8.4 MB'
      },
      {
        id: 3,
        type: 'image',
        order: 2,
        url: 'https://picsum.photos/seed/news3/800/500',
        name: 'office-dubai.jpg',
        size: '1.3 MB'
      },
      {
        id: 4,
        type: 'image',
        order: 3,
        url: 'https://picsum.photos/seed/news4/800/500',
        name: 'team-photo.jpg',
        size: '1.7 MB'
      }
    ]
  })

  const translation = computed(
    () => news.value.translations.find((t) => t.locale === 'en') ?? news.value.translations[0]
  )

  const formattedDate = computed(() =>
    new Date(news.value.published_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  )

  const sortedMedia = computed(() => [...news.value.media].sort((a, b) => a.order - b.order))

  const activeMediaIndex = ref(0)
  const showGallery = ref(false)
  const activeMedia = computed(() => sortedMedia.value[activeMediaIndex.value])

  const mediaIcon = (type) => (type === 'video' ? Video24Regular : Image24Regular)
  const mediaColor = (type) => (type === 'video' ? '#E7000A' : '#74788d')
</script>

<template>
  <div class="min-h-screen bg-surface-ground">
    <!-- Back Button -->
    <div class="max-w-6xl mx-auto px-6 pt-6">
      <button
        class="inline-flex items-center gap-2 text-sm text-textColor3 hover:text-primary transition-colors group"
      >
        <n-icon size="18" class="group-hover:-translate-x-1 transition-transform">
          <ArrowLeft24Regular />
        </n-icon>
        Back to News
      </button>
    </div>

    <!-- ── Hero Media ───────────────────────────────────────────────────────── -->
    <div v-if="sortedMedia.length" class="max-w-6xl mx-auto px-6 mt-4">
      <div class="relative rounded-2xl overflow-hidden shadow-xl">
        <!-- Main display -->
        <div class="relative h-[480px] bg-surface-section overflow-hidden">
          <img
            v-if="activeMedia.type === 'image'"
            :src="activeMedia.url"
            :alt="activeMedia.name"
            class="w-full h-full object-cover transition-all duration-500"
          />
          <video
            v-else
            :src="activeMedia.url"
            :key="activeMedia.id"
            class="w-full h-full object-cover"
            controls
            preload="metadata"
          />

          <!-- Gradient overlay (only for images) -->
          <div
            v-if="activeMedia.type === 'image'"
            class="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/15 to-transparent pointer-events-none"
          />

          <!-- Counter -->
          <div
            class="absolute top-4 right-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5"
          >
            <n-icon size="13">
              <component :is="mediaIcon(activeMedia.type)" />
            </n-icon>
            {{ activeMediaIndex + 1 }} / {{ sortedMedia.length }}
          </div>

          <!-- Gallery button -->
          <button
            @click="showGallery = true"
            class="absolute top-4 left-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5 hover:bg-dark/80 transition-colors"
          >
            <n-icon size="13"><Eye24Regular /></n-icon>
            View all
          </button>
        </div>

        <!-- Thumbnail strip -->
        <div
          v-if="sortedMedia.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
        >
          <button
            v-for="(item, idx) in sortedMedia"
            :key="item.id"
            @click="activeMediaIndex = idx"
            class="h-14 w-20 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0 relative"
            :class="
              activeMediaIndex === idx
                ? 'border-primary scale-105 shadow-lg'
                : 'border-white/40 opacity-60 hover:opacity-100'
            "
          >
            <img v-if="item.type === 'image'" :src="item.url" class="w-full h-full object-cover" />
            <template v-else>
              <video :src="item.url" class="w-full h-full object-cover" preload="metadata" muted />
              <div class="absolute inset-0 flex items-center justify-center bg-dark/40">
                <n-icon size="18" color="#ffffff"><Play24Regular /></n-icon>
              </div>
            </template>
          </button>
        </div>
      </div>
    </div>

    <!-- ── Content Area ────────────────────────────────────────────────────── -->
    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8 items-start">
        <!-- ── Article ───────────────────────────────────────────────────── -->
        <article class="flex-1 min-w-0">
          <!-- Categories -->
          <div v-if="news.categories.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="cat in news.categories"
              :key="cat.id"
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
            >
              <n-icon size="11"><Tag24Regular /></n-icon>
              {{ cat.name.en }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-textColor0 leading-tight mb-5">
            {{ translation.title }}
          </h1>

          <!-- Author + Date -->
          <div class="flex flex-wrap items-center gap-5 mb-8 pb-8 border-b border-surface-line">
            <div v-if="news.author" class="flex items-center gap-2.5">
              <img
                :src="news.author.avatar"
                class="w-9 h-9 rounded-full object-cover ring-2 ring-surface-line"
              />
              <div>
                <p class="text-xs text-textColor3 leading-none mb-0.5">Author</p>
                <p class="text-sm font-semibold text-textColor0">{{ news.author.name }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-sm text-textColor3">
              <n-icon size="15"><CalendarClock16Regular /></n-icon>
              {{ formattedDate }}
            </div>
          </div>

          <!-- HTML content -->
          <div class="news-content text-textColor0">
            <span v-html="translation.content" />
          </div>
        </article>

        <!-- ── Media Sidebar ──────────────────────────────────────────────── -->
        <aside v-if="sortedMedia.length" class="w-72 shrink-0 sticky top-6">
          <div
            class="bg-surface-section border border-surface-line rounded-xl overflow-hidden shadow-sm"
          >
            <!-- Header -->
            <div
              class="px-4 py-3.5 border-b border-surface-line bg-surface-ground/60 flex items-center gap-2"
            >
              <n-icon size="16" class="text-primary"><Document24Regular /></n-icon>
              <h3 class="text-sm font-semibold text-textColor0 flex-1">Media</h3>
              <span class="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {{ sortedMedia.length }}
              </span>
            </div>

            <!-- Media list -->
            <ul class="divide-y divide-surface-line">
              <li
                v-for="(item, idx) in sortedMedia"
                :key="item.id"
                class="flex items-center gap-3 px-4 py-3 hover:bg-surface-ground/50 transition-colors group cursor-pointer"
                @click="
                  () => {
                    activeMediaIndex = idx
                    showGallery = false
                  }
                "
              >
                <span class="text-xs font-bold text-textColor3 w-4 shrink-0 tabular-nums">
                  {{ idx + 1 }}
                </span>
                <n-icon size="20" :color="mediaColor(item.type)" class="shrink-0">
                  <component :is="mediaIcon(item.type)" />
                </n-icon>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-textColor0 leading-snug line-clamp-2">
                    {{ item.name }}
                  </p>
                  <p class="text-xs text-textColor3 mt-0.5">{{ item.size }}</p>
                </div>
                <n-icon
                  size="15"
                  class="text-textColor3 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                >
                  <ArrowDownload24Regular />
                </n-icon>
              </li>
            </ul>

            <!-- Download all -->
            <div class="px-4 py-3 border-t border-surface-line">
              <n-button type="primary" ghost size="small" class="w-full">
                <template #icon><ArrowDownload24Regular /></template>
                Download All
              </n-button>
            </div>
          </div>
        </aside>
      </div>
    </div>

    <!-- ── Gallery Modal ──────────────────────────────────────────────────── -->
    <n-modal v-model:show="showGallery" :mask-closable="true">
      <div class="bg-dark rounded-2xl overflow-hidden w-[90vw] max-w-4xl mx-auto" @click.stop>
        <div class="grid grid-cols-2 gap-1 m-1 rounded-xl overflow-hidden">
          <template v-for="(item, idx) in sortedMedia" :key="item.id">
            <n-image
              v-if="item.type === 'image'"
              :src="item.url"
              object-fit="cover"
              :img-props="{
                class: 'size-full'
              }"
              class="w-full h-52"
              :class="idx === 0 && sortedMedia.length % 2 !== 0 ? 'col-span-2 h-72' : ''"
            />
            <video
              v-else
              :src="item.url"
              controls
              preload="metadata"
              class="w-full h-52 object-cover bg-black"
              :class="idx === 0 && sortedMedia.length % 2 !== 0 ? 'col-span-2 h-72' : ''"
            />
          </template>
        </div>
      </div>
    </n-modal>
  </div>
</template>

<style scoped>
  .news-content {
    line-height: 1.85;
    font-size: 0.9375rem;
  }

  .news-content :deep(h2) {
    font-size: 1.3rem;
    font-weight: 700;
    margin: 2rem 0 0.75rem;
  }

  .news-content :deep(h3) {
    font-size: 1.1rem;
    font-weight: 600;
    margin: 1.5rem 0 0.5rem;
  }

  .news-content :deep(p) {
    margin-bottom: 1rem;
    white-space: pre-wrap;
  }

  .news-content :deep(ul),
  .news-content :deep(ol) {
    padding-left: 1.5rem;
    margin-bottom: 1.25rem;
  }

  .news-content :deep(li) {
    margin-bottom: 0.4rem;
  }

  .news-content :deep(blockquote) {
    border-left: 4px solid var(--primary-color);
    padding: 0.85rem 1.25rem;
    margin: 1.75rem 0;
    background: rgba(18, 121, 240, 0.06);
    border-radius: 0 0.5rem 0.5rem 0;
    font-style: italic;
  }

  .news-content :deep(strong) {
    font-weight: 700;
  }

  .news-content :deep(img) {
    max-width: 100%;
    border-radius: 0.5rem;
    margin: 0.75rem 0;
  }
</style>
