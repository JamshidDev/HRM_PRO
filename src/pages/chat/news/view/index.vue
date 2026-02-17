<script setup>
  import {
    CalendarClock16Regular,
    Document24Regular,
    ArrowLeft24Regular,
    DocumentPdf24Regular,
    TableSimple24Regular,
    DocumentText24Regular,
    Archive24Regular,
    Image24Regular,
    ArrowDownload24Regular,
    Eye24Regular,
    Tag24Regular
  } from '@vicons/fluent'

  const news = ref({
    id: 1,
    title: 'Company Announces Major Expansion Plans for 2025: New Offices, Teams & Benefits',
    date: 'February 14, 2025 · 10:30 AM',
    author: 'Sarah Johnson',
    authorAvatar: 'https://i.pravatar.cc/150?img=47',
    tags: ['Company News', 'HR Updates', 'Expansion'],
    images: [
      'https://picsum.photos/seed/news1/1600/700',
      'https://picsum.photos/seed/news2/800/500',
      'https://picsum.photos/seed/news3/800/500',
      'https://picsum.photos/seed/news4/800/500'
    ],
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
      <p>We believe that investing in our people is the most important investment we can make. These benefits are designed to support your wellbeing, growth, and long-term financial security.</p>
      <h2>New Office Locations</h2>
      <p>Our new offices will open in <strong>Tashkent</strong>, <strong>Dubai</strong>, and <strong>Berlin</strong> — carefully chosen to support our growing international client base and attract world-class talent from diverse regions.</p>
      <blockquote>
        "Growth is never by mere chance; it is the result of forces working together. We are proud of what we have built and even more excited about what comes next." — CEO, Mark Reynolds
      </blockquote>
      <h2>Next Steps</h2>
      <p>Town hall meetings will be held across all existing offices during the week of February 24th. These sessions will cover the full expansion roadmap, Q&amp;A with leadership, and detailed information on the new benefits rollout timeline.</p>
      <p>Stay tuned for more updates through the internal communications portal. We are so grateful to have each of you on this journey with us.</p>
    `,
    attachments: [
      { id: 1, name: 'Expansion_Roadmap_2025.pdf', type: 'pdf', size: '2.4 MB' },
      { id: 2, name: 'New_Benefits_Package_Overview.docx', type: 'doc', size: '1.1 MB' },
      { id: 3, name: 'Office_Locations_Details.xlsx', type: 'xls', size: '540 KB' },
      { id: 4, name: 'Org_Structure_Update.pdf', type: 'pdf', size: '3.2 MB' },
      { id: 5, name: 'Employee_FAQ.docx', type: 'doc', size: '820 KB' },
      { id: 6, name: 'Brand_Assets_Pack.zip', type: 'zip', size: '18.7 MB' },
      { id: 7, name: 'HQ_Photos.jpg', type: 'image', size: '4.5 MB' }
    ]
  })

  const activeImage = ref(0)
  const showGallery = ref(false)

  const fileIcon = (type) => {
    const map = {
      pdf: DocumentPdf24Regular,
      doc: DocumentText24Regular,
      docx: DocumentText24Regular,
      xls: TableSimple24Regular,
      xlsx: TableSimple24Regular,
      zip: Archive24Regular,
      rar: Archive24Regular,
      image: Image24Regular
    }
    return map[type] ?? Document24Regular
  }

  const fileColor = (type) => {
    const map = {
      pdf: 'text-red-500',
      doc: 'text-blue-500',
      docx: 'text-blue-500',
      xls: 'text-green-600',
      xlsx: 'text-green-600',
      zip: 'text-amber-500',
      rar: 'text-amber-500',
      image: 'text-purple-500'
    }
    return map[type] ?? 'text-textColor3'
  }
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

    <!-- ── Hero Images ─────────────────────────────────────────────────────── -->
    <div v-if="news.images.length" class="max-w-6xl mx-auto px-6 mt-4">
      <div class="relative rounded-2xl overflow-hidden shadow-xl">
        <!-- Main image -->
        <div class="relative h-[480px] bg-surface-section overflow-hidden">
          <img
            :src="news.images[activeImage]"
            :alt="news.title"
            class="w-full h-full object-cover transition-all duration-500"
          />
          <!-- Gradient overlay -->
          <div class="absolute inset-0 bg-gradient-to-t from-dark/70 via-dark/15 to-transparent" />

          <!-- Image counter -->
          <div
            class="absolute top-4 right-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5"
          >
            <n-icon size="13"><Image24Regular /></n-icon>
            {{ activeImage + 1 }} / {{ news.images.length }}
          </div>

          <!-- Gallery button -->
          <button
            @click="showGallery = true"
            class="absolute top-4 left-4 px-3 py-1.5 bg-dark/60 backdrop-blur-sm rounded-full text-white text-xs font-medium flex items-center gap-1.5 hover:bg-dark/80 transition-colors"
          >
            <n-icon size="13"><Eye24Regular /></n-icon>
            View gallery
          </button>
        </div>

        <!-- Thumbnail strip -->
        <div
          v-if="news.images.length > 1"
          class="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2"
        >
          <button
            v-for="(img, idx) in news.images"
            :key="idx"
            @click="activeImage = idx"
            class="h-14 w-20 rounded-lg overflow-hidden border-2 transition-all duration-200 shrink-0"
            :class="
              activeImage === idx
                ? 'border-primary scale-105 shadow-lg'
                : 'border-white/40 opacity-60 hover:opacity-100'
            "
          >
            <img :src="img" class="w-full h-full object-cover" />
          </button>
        </div>
      </div>
    </div>

    <!-- ── Content Area ────────────────────────────────────────────────────── -->
    <div class="max-w-6xl mx-auto px-6 py-8">
      <div class="flex gap-8 items-start">
        <!-- ── Article ───────────────────────────────────────────────────── -->
        <article class="flex-1 min-w-0">
          <!-- Tags -->
          <div v-if="news.tags.length" class="flex flex-wrap gap-2 mb-4">
            <span
              v-for="tag in news.tags"
              :key="tag"
              class="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full"
            >
              <n-icon size="11"><Tag24Regular /></n-icon>
              {{ tag }}
            </span>
          </div>

          <!-- Title -->
          <h1 class="text-3xl font-bold text-textColor0 leading-tight mb-5">
            {{ news.title }}
          </h1>

          <!-- Author + Date -->
          <div class="flex flex-wrap items-center gap-5 mb-8 pb-8 border-b border-surface-line">
            <div class="flex items-center gap-2.5">
              <img
                :src="news.authorAvatar"
                class="w-9 h-9 rounded-full object-cover ring-2 ring-surface-line"
              />
              <div>
                <p class="text-xs text-textColor3 leading-none mb-0.5">Author</p>
                <p class="text-sm font-semibold text-textColor0">{{ news.author }}</p>
              </div>
            </div>
            <div class="flex items-center gap-1.5 text-sm text-textColor3">
              <n-icon size="15"><CalendarClock16Regular /></n-icon>
              {{ news.date }}
            </div>
          </div>

          <!-- HTML content via Viewer pattern -->
          <div class="news-content text-textColor0">
            <span v-html="news.content" />
          </div>
        </article>

        <!-- ── Attachments Sidebar ────────────────────────────────────────── -->
        <aside v-if="news.attachments.length" class="w-72 shrink-0 sticky top-6">
          <div
            class="bg-surface-section border border-surface-line rounded-xl overflow-hidden shadow-sm"
          >
            <!-- Header -->
            <div
              class="px-4 py-3.5 border-b border-surface-line bg-surface-ground/60 flex items-center gap-2"
            >
              <n-icon size="16" class="text-primary"><Document24Regular /></n-icon>
              <h3 class="text-sm font-semibold text-textColor0 flex-1">Attachments</h3>
              <span class="bg-primary/10 text-primary text-xs font-bold px-2 py-0.5 rounded-full">
                {{ news.attachments.length }}
              </span>
            </div>

            <!-- File list -->
            <ul class="divide-y divide-surface-line">
              <li
                v-for="(file, idx) in news.attachments"
                :key="file.id"
                class="flex items-center gap-3 px-4 py-3 hover:bg-surface-ground/50 transition-colors group cursor-pointer"
              >
                <span class="text-xs font-bold text-textColor3 w-4 shrink-0 tabular-nums">
                  {{ idx + 1 }}
                </span>
                <n-icon size="20" :class="fileColor(file.type)" class="shrink-0">
                  <component :is="fileIcon(file.type)" class="dark:text-white" />
                </n-icon>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-textColor0 leading-snug line-clamp-2">
                    {{ file.name }}
                  </p>
                  <p class="text-xs text-textColor3 mt-0.5">{{ file.size }}</p>
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
        <n-image-group show-toolbar>
          <div class="grid grid-cols-2 gap-1 p-1">
            <n-image
              v-for="(img, idx) in news.images"
              :key="idx"
              :src="img"
              object-fit="cover"
              class="w-full h-52"
              :class="idx === 0 && news.images.length % 2 !== 0 ? 'col-span-2 h-72' : ''"
            />
          </div>
        </n-image-group>
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
    border-left: 4px solid var(--primary-color, #6366f1);
    padding: 0.85rem 1.25rem;
    margin: 1.75rem 0;
    background: rgba(99, 102, 241, 0.06);
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
