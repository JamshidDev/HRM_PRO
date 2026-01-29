<script setup>
  import { NoDataPicture, UIPagination, UIUser} from '@/components/index.js'
  import { useAccountStore, useLmsWorkerStore } from '@/store/modules/index.js'
  import { ArrowCircleDown16Filled} from "@vicons/fluent"
  import Utils from '@/utils/Utils.js'
  import MenuButton from '@/components/buttons/MenuButton.vue'

  const store = useLmsWorkerStore()
  const accStore = useAccountStore()

  const onDelete = (v) => {
    store.selectedWorkers = [v.id]
    store._delete()
  }

  const onSelectEv = (v) => {
    if (!accStore.checkAction(accStore.pn.lmsWorkerWrite)) return
    if (v.key === Utils.ActionTypes.delete) {
      onDelete(v.data)
    }
  }

  const changePage = (v) => {
    store.params.page = v.page
    store.params.per_page = v.per_page
    store._index()
  }

  const onDownload = (url) => {
    window.open(url, '_blank')
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
              <th class="min-w-[200px]">{{ $t('content.worker') }}</th>
              <th class="w-[300px]">{{ $t('eduPlanPage.form.learning_center') }}</th>
              <th class="w-[160px]">{{ $t('content.type') }}</th>
              <th class="w-[300px]">{{ $t('lmsWorkerPage.form.eduPlan') }}</th>
              <th class="w-[220px]">{{ $t('content.group')}}</th>
              <th class="w-[120px]">{{ $t('lmsWorkerPage.form.certificate')}}</th>
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
              <td>
                <UIUser
                    :short="false"
                  :data="{
                    photo: item?.worker_position.worker.photo,
                    firstName: item?.worker_position.worker.first_name,
                    middleName: item?.worker_position.worker.middle_name,
                    lastName: item?.worker_position.worker.last_name,
                    position: item?.worker_position?.post_short_name
                  }"
                />
              </td>
              <td>
                <n-tooltip placement="bottom" :delay="1000" trigger="hover">
                  <template #trigger>
                    <p class="leading-[1.2]">
                      {{ item?.learning_center?.name }}
                    </p>
                  </template>
                  <span> {{ item?.learning_center?.name }} </span>
                </n-tooltip>
              </td>
              <td>
                <div class="flex flex-col">
                  <p class="leading-[1.2]">{{ item?.edu_plan?.type?.name }}</p>
                  <p class="text-secondary text-xs leading-[1.2]">
                    {{ item?.edu_plan?.start_date }}
                  </p>
                </div>
              </td>
              <td>
                <n-tooltip placement="left" :delay="1000" trigger="hover">
                  <template #trigger>
                    <div class="text-xs text-secondary leading-[1.2] line-clamp-1">
                      {{ item.edu_plan?.specialization?.name }}
                    </div>
                  </template>
                  <span> {{ item.edu_plan?.specialization?.name }} </span>
                </n-tooltip>
                <n-tooltip placement="left" :delay="1000" trigger="hover">
                  <template #trigger>
                    <div class="leading-[1.2] line-clamp-1">
                      {{ item.edu_plan?.name }}
                    </div>
                  </template>
                  <span> {{ item.edu_plan?.name }} </span>
                </n-tooltip>
              </td>
              <td>
                <div class="flex flex-col lowercase">
                  <p class="leading-[1.2]">{{ item?.edu_plan?.hours }} {{ $t('content.hour') }}</p>
                  <p class="text-secondary text-xs leading-[1.2]">
                    {{
                      item?.edu_plan?.count_groups +
                      ' ' +
                      $t('content.piece') +
                      ' ' +
                      $t('content.group')
                    }}
                    {{
                      item?.edu_plan?.count_workers +
                      ' ' +
                      $t('content.person') +
                      ' ' +
                      $t('content.worker')
                    }}
                  </p>
                </div>
              </td>
              <td>
                <n-button v-if="item?.certificate?.confirmation_file" @click="onDownload(item?.certificate?.confirmation_file)" type="success" secondary>
                  <template #icon>
                    <ArrowCircleDown16Filled/>
                  </template>
                  {{$t('content.download')}}
                </n-button>

              </td>

              <td>
                <MenuButton
                  :data="item"
                  :loading="item.id === store.elementId && store.deleteLoading"
                  @selectEv="onSelectEv"
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
