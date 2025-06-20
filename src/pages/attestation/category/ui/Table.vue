<script setup>
import {NoDataPicture, UIMenuButton, UIPagination} from "@/components/index.js"
import {useCategoryStore} from "@/store/modules/index.js"
import {useRouter} from "vue-router"
import {AppPaths} from "@/utils/index.js"
import Utils from "@/utils/Utils.js";
import UIHelper from "@/utils/UIHelper.js";
import {Delete20Regular, Eye16Regular} from "@vicons/fluent";
import {useAccountStore} from "@/store/modules/index.js"
const accStore = useAccountStore()

const store = useCategoryStore()
const router = useRouter()

const changePage = (v) => {
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v) => {
  if(!accStore.checkAction(accStore.pn.examCategoriesRead)) return
  if (v.key === 'view') {
    router.push(`${AppPaths.Attestation}${AppPaths.Category}/${v.data.id}${AppPaths.Questions}`)
  } else if (v.key === 'delete') {
    if(!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.elementId = v.data.id
    store._delete()
  } else if (v.key === 'edit') {
    if(!accStore.checkAction(accStore.pn.examCategoriesWrite)) return
    store.elementId = v.data.id
    store.payload.name = v.data.name
    store.visibleType = false
    store.visible = true
  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto" v-if="store.list.length>0">
      <n-table
          class="mt-3 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! w-[30px] min-w-[30px] grow-0">{{ $t('content.number') }}</th>
          <th class="text-center! min-w-[500px]">{{ $t('categoryPage.name') }}</th>
          <th class="text-center! w-[140px] min-w-[120px]">{{ $t('categoryPage.questionCount') }}</th>
          <th class="max-w-[60px] w-[60px]">{{ $t('content.action') }}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{
              (store.params.page - 1) * store.params.per_page + idx + 1
            }}</span></td>
          <td>{{ item.name }}</td>
          <td class="text-center!">{{ item.questions_count }}</td>
          <td>
            <UIMenuButton
                :show-view="false"
                :show-edit="true"
                :data="item"
                :extra-options="[ {
                  label: $t('questionPage.title'),
                  key: Utils.ActionTypes.view,
                  icon: Eye16Regular
                }]"
                @select-ev="onSelect"
            />
          </td>
        </tr>
        </tbody>
      </n-table>
      <UIPagination
          v-if="store.totalItems>store.params.per_page"
          :page="store.params.page"
          :per_page="store.params.size"
          :total="store.totalItems"
          @change-page="changePage"
      />
    </div>
    <NoDataPicture v-if="store.list.length===0 && !store.loading"/>
  </n-spin>
</template>
