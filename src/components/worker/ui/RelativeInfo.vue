<script setup>
  import { useComponentStore } from '@/store/modules/index.js'
  import SectionHeader from './shared/SectionHeader.vue'
  import UsersIcon from '@/assets/icons/usersIcon.svg'
  import UserIcon from '@/assets/icons/userIcon.svg'
  import UserCardIcon from '@/assets/icons/userCardIcon.svg'
  import CalendarIcon from '@/assets/icons/calendarIcon.svg'
  import LocationIcon from '@/assets/icons/locationIcon.svg'
  import PositionIcon from '@/assets/icons/positionIcon.svg'
  import JshirIcon from '@/assets/icons/jshirIcon.svg'
  import Utils from '../../../utils/Utils.js'

  const store = useComponentStore()
</script>

<template>
  <div>
    <SectionHeader :title="$t('workerView.tabs.relative')" :icon="UsersIcon">
      <div v-if="store.workerPreview?.worker?.relatives?.length" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-surface-line">
              <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                <span class="flex items-center gap-1.5">
                  <n-icon size="14"><UserIcon /></n-icon>
                  {{ $t('relativePage.form.relative') }}
                </span>
              </th>
              <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                <span class="flex items-center gap-1.5">
                  <n-icon size="14"><UserCardIcon /></n-icon>
                  {{ $t('content.fullName') }}
                </span>
              </th>
              <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                <span class="flex items-center gap-1.5">
                  <n-icon size="14"><CalendarIcon /></n-icon>
                  {{ $t('relativePage.form.birthday') }}
                </span>
              </th>
              <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                <span class="flex items-center gap-1.5">
                  <n-icon size="14"><LocationIcon /></n-icon>
                  {{ $t('relativePage.form.birthdayPlace') }}
                </span>
              </th>
              <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                <span class="flex items-center gap-1.5">
                  <n-icon size="14"><PositionIcon /></n-icon>
                  {{ $t('relativePage.form.post_name') }}
                </span>
              </th>
              <th class="text-left font-semibold text-textColor0 whitespace-nowrap px-2 py-3">
                <span class="flex items-center gap-1.5">
                  <n-icon size="14"><JshirIcon /></n-icon>
                  {{ $t('workerView.general.passportJSHSHIR') }}
                </span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, idx) in store.workerPreview?.worker?.relatives"
              :key="idx"
              :class="idx !== store.workerPreview?.worker?.relatives?.length - 1 ? 'border-b border-surface-line' : ''"
            >
              <td class="align-top text-textColor2 px-2 py-4">{{ item?.relative?.name || '—' }}</td>
              <td class="align-top font-semibold text-textColor0 px-2 py-4">{{ Utils.combineFullName(item) }}</td>
              <td class="align-top text-textColor2 whitespace-nowrap px-2 py-4">
                {{ Utils.timeOnlyDate(item?.birthday) || '—' }}
              </td>
              <td class="align-top text-textColor2 px-2 py-4">{{ item?.birth_place || '—' }}</td>
              <td class="align-top text-textColor2 px-2 py-4">{{ item?.post_name || '—' }}</td>
              <!-- TODO: backend real JSHSHIR maydoni qo'shilganda ulanadi -->
              <td class="align-top text-textColor2 whitespace-nowrap px-2 py-4">000000000000</td>
            </tr>
          </tbody>
        </table>
      </div>
      <h4 v-else class="text-center text-secondary">
        {{ $t('content.no-data') }}
      </h4>
    </SectionHeader>
  </div>
</template>
