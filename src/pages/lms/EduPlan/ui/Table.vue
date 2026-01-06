<script setup>
  import { NoDataPicture, UIPagination, UIUser, UIMore, UIBadge } from '@/components/index.js'
  import { useAccountStore, useEduPlanStore } from '@/store/modules/index.js'
  import Utils from '@/utils/Utils.js'
  import MenuButton from '@/components/buttons/MenuButton.vue'
  import { AppPaths } from '@/utils/index.js'
  import { ChannelAdd24Regular, People28Regular, TextBulletListAdd20Regular } from '@vicons/fluent'
  import UIHelper from '@/utils/UIHelper.js'

  const store = useEduPlanStore()
  const accStore = useAccountStore()
  const router = useRouter()

  const onEdit = (v) => {
    store.elementId = v.id
    store.payload.subjects = v.subjects.map((i) => i.id)
    store.payload.specialization_id = v.specialization.id
    store.payload.hours = v.hours
    store.payload.start_date = new Date(v.start_date).getTime()
    store.subjects = v.subjects
    store.specializations = [v.specialization]
    store.payload.count_groups = v?.count_groups
    store.payload.count_workers = v?.count_workers
    store.payload.learning_center_id = v.learning_center?.id
    store.payload.type = v.type?.id
    store.payload.name = v.name

    store.visibleType = false
    store.visible = true
  }

  const onDelete = (v) => {
    store.elementId = v.id
    store._delete()
  }

  const onSelectEv = (v) => {
    store.elementId = v.data.id
    if (!accStore.checkAction(accStore.pn.lmsEduPlanWrite)) return
    if (v.key === Utils.ActionTypes.edit) {
      onEdit(v.data)
    } else if (v.key === Utils.ActionTypes.delete) {
      onDelete(v.data)
    } else if (v.key === Utils.ActionTypes.attachment) {
      store.groupVisible = true
    } else if (v.key === Utils.ActionTypes.finish) {
      onAttach()
    } else if (v.key === Utils.ActionTypes.open) {
      onAttachExam()
    }
  }

  const onAttach = () => {
    store.workerList = []
    store.workerVisible = true
    store._attachedWorkers()
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onViewGroup = (v) => {
    if (!accStore.checkAction(accStore.pn.lmsEduPlanRead)) return
    router.push(Utils.routeLmsPathMaker(AppPaths.Group) + `/${v.id}`)
  }

  const onAttachExam = () => {
    store.examVisible = true
  }
</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div v-if="store.list.length > 0">
      <div class="w-full overflow-x-auto">
        <n-table class="mt-5" :single-line="false" size="small">
          <thead>
            <tr>
              <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
              <th class="min-w-[200px]">{{ $t('content.name') }}</th>
              <th class="min-w-[100px]">{{ $t('content.type') }}</th>
              <th class="min-w-[120px]">{{ $t('eduPlanPage.form.learning_center') }}</th>
              <th class="min-w-[200px]">{{ $t('eduPlanPage.form.specialization') }}</th>
              <th class="max-w-[50px] w-[50px]">{{ $t('eduPlanPage.form.hours') }}</th>
              <th class="w-[100px]">{{ $t('eduPlanPage.form.groupWorker') }}</th>
              <th class="w-[100px]">{{ $t('eduPlanPage.form.short_count_workers') }}</th>
              <th class="min-w-[100px] text-center!">{{ $t('eduPlanPage.form.subjects') }}</th>
              <th class="!text-center max-w-[130px] w-[130px]">
                {{ $t('eduPlanPage.form.start_date') }}
              </th>
              <th class="min-w-[40px] w-[40px]"></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(item, idx) in store.list" :key="idx">
              <td>
                <span class="text-center text-[12px] text-gray-600 block">{{
                  (store.params.page - 1) * store.params.per_page + idx + 1
                }}</span>
              </td>
              <td>{{ item.name }}</td>
              <td>{{ item?.type?.name }}</td>
              <td>{{ item.learning_center.name }}</td>
              <td>{{ item.specialization?.name }}</td>

              <td class="!text-center">
                <n-button circle size="tiny">
                  {{ item.hours }}
                </n-button>
              </td>
              <td class="!text-center">
                <n-button @click="onViewGroup(item)" round size="tiny">
                  {{ item.count_groups }} - {{ item.count_workers }}
                </n-button>
              </td>
              <td class="!text-center">
                <n-button circle size="tiny">
                  {{ item.workers_count }}
                </n-button>
              </td>
              <td class="text-center!">
                <UIMore :height="100" :width="200" :data="item.subjects">
                  <template #content="{ data }">
                    <p>{{ data.name }}</p>
                  </template>
                </UIMore>
              </td>
              <td>
                <UIBadge :show-icon="false" :label="Utils.timeOnlyDate(item.start_date)" />
              </td>
              <td>
                <MenuButton
                  :data="item"
                  :show-edit="true"
                  :loading="item.id === store.elementId && store.deleteLoading"
                  @selectEv="onSelectEv"
                  :extra-options="[
                    {
                      label: $t('eduPlanPage.attachmentGroup'),
                      key: Utils.ActionTypes.attachment,
                      icon: UIHelper.renderIcon(ChannelAdd24Regular),
                      visible: true
                    },
                    {
                      label: $t('eduPlanPage.workers'),
                      key: Utils.ActionTypes.finish,
                      icon: UIHelper.renderIcon(People28Regular),
                      visible: true
                    },
                    {
                      label: $t('content.exam'),
                      key: Utils.ActionTypes.open,
                      icon: UIHelper.renderIcon(TextBulletListAdd20Regular),
                      visible: true
                    }
                  ]"
                />
              </td>
            </tr>
          </tbody>
        </n-table>
      </div>

      <UIPagination
        :page="store.params.page"
        :per_page="store.params.per_page"
        :total="store.totalItems"
        @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length === 0 && !store.loading" />
  </n-spin>
</template>
