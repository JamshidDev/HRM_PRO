<script setup>
import {
  NoDataPicture,
  UIMenuButton,
  UIPagination,
  UIStatus,
  UIUser,
} from '@/components/index.js'
import { useAccountStore,useConfCertificateStore } from '@/store/modules/index.js'
import Utils from '@/utils/Utils.js'

const store = useConfCertificateStore()
const accStore = useAccountStore()
const emits = defineEmits(['openOffice'])

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onOpen =  (documentId, signatureId) => {
  if (!accStore.checkAction(accStore.pn.confirmationLmsCertificateRead)) return
  emits('openOffice', {documentId, signatureId })
}

const onSelect = (v) => {
  store.elementId = v.data.id
  if (!accStore.checkAction(accStore.pn.confirmationLmsCertificateRead)) return
  if (v.key === 'view') {
    onOpen(v.data?.certificate?.id, v.data.id)
  }
}
</script>
<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length > 0">
      <n-table class="mt-4" :single-line="false" size="small">
        <thead>
        <tr>
          <th class="text-center! min-w-[40px] w-[40px]">{{ $t('content.number') }}</th>
          <th class="min-w-[200px]">{{ $t('content.worker') }}</th>
          <th class="min-w-[60px] w-[60px]">{{ $t('confirmation.contract.form.number') }}</th>
          <th class="min-w-[60px] w-[120px]">{{ $t('lmsCertificate.form.start_exam_result') }}</th>
          <th class="min-w-[60px] w-[120px]">{{ $t('lmsCertificate.form.end_exam_result') }}</th>
          <th class="min-w-[100px] w-[300px]">
            {{ $t('confirmation.contract.form.organization') }}
          </th>
          <th class="min-w-[100px] w-[100px]">{{ $t('content.status') }}</th>
          <th class="min-w-[100px] w-[100px]">{{ $t('content.document') }}</th>
          <th class="min-w-[100px] w-[100px]">{{ $t('content.from') }}</th>
          <th class="min-w-[100px] w-[100px]">{{ $t('content.to') }}</th>
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
                :hide-tooltip="true"
                :data="{
                      photo: item?.certificate?.worker_position?.worker?.photo,
                      lastName: item?.certificate?.worker_position?.worker?.last_name,
                      firstName: item?.certificate?.worker_position?.worker?.first_name,
                      middleName: item?.certificate?.worker_position?.worker?.middle_name,
                      position:item?.certificate?.worker_position?.post_short_name,
                    }"
            />
          </td>
          <td @click="onOpen(item?.certificate?.id, item.id)">
            <div class="flex justify-center">
              <n-button type="primary" class="font-medium" round dashed size="tiny">{{
                  item?.certificate?.serial+ '-' +item?.certificate?.number
                }}</n-button>
            </div>
          </td>
          <td>
            <n-button class="!mx-auto !w-fit !block" size="tiny">{{item?.certificate?.start_exam_result}}</n-button>
          </td>
          <td>
            <n-button class="!mx-auto !w-fit !block" size="tiny">{{item?.certificate?.end_exam_result}}</n-button>
          </td>

          <td>{{ item?.certificate?.organization?.name }}</td>
          <td><UIStatus :status="item?.status" /></td>
          <td><UIStatus :status="Utils.documentStatus[item?.generate]" /></td>
          <td>{{ Utils.timeOnlyDate(item?.certificate?.cert_from) }}</td>
          <td>{{ Utils.timeOnlyDate(item?.certificate?.cert_to) }}</td>
          <td>
            <UIMenuButton
                :show-view="true"
                :data="item"
                @selectEv="onSelect"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
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

