<script setup>

import Utils from "@/utils/Utils.js"
import {Drag24Regular} from "@vicons/fluent"
import {UIMenuButton, UIUser} from "@/components/index.js"
import {useDashboardStore} from "@/store/modules/index.js"

const store = useDashboardStore()

onMounted(()=>{
  store._birthdayDetail()
})

</script>

<template>
  <n-spin :show="store.detail.birthdaysLoading">
    <n-table
        :single-line="false"
        size="small"
    >
      <thead>
      <tr>
        <th class="text-center! min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
        <th class="text-center!">{{$t('content.worker')}}</th>
        <th class="min-w-[100px]">{{$t('content.organization')}}</th>
        <th class="min-w-[100px]">{{$t('content.department')}}</th>
<!--        <th class="w-[100px]">{{$t('relativePage.form.relative')}}</th>-->
<!--        <th class="min-w-[100px] w-[200px]">{{$t('relativePage.form.post_name')}}</th>-->
<!--        <th class="min-w-[120px] w-[120px]">{{$t('relativePage.form.birthday')}}</th>-->
<!--        <th class="min-w-[150px] w-[200px]">{{$t('relativePage.form.birthdayPlace')}}</th>-->
<!--        <th class="min-w-[150px] w-[300px]">{{$t('createWorkerPage.form.address')}}</th>-->
<!--        <th class="min-w-[40px] w-[40px]"></th>-->
      </tr>
      </thead>
      <tbody class="sort-target">
      <tr v-for="(item, idx) in store.detail.birthdays" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{ (store.detail.birthdayParams.page - 1) * store.detail.birthdayParams.per_page + idx + 1 }}</span></td>
        <td>
          <UIUser
              :data="{
                photo:item?.user?.photo,
                lastName:item?.user?.last_name,
                firstName:item?.user?.first_name,
                middleName:item?.user?.middle_name,
                position:item?.position?.name
              }"
          />
        </td>
        <td>{{item.organization.name}}</td>
        <td>{{item.department.name}}</td>
<!--        <td>-->
<!--          <n-button secondary type="primary" size="small" class="handle">-->
<!--            <template #icon>-->
<!--              <n-icon>-->
<!--                <Drag24Regular/>-->
<!--              </n-icon>-->
<!--            </template>-->
<!--          </n-button>-->
<!--        </td>-->
<!--        <td><span class="text-sm">{{item.relative.name}}</span></td>-->
<!--        <td>{{item.last_name+' '+item.first_name+' '+item.middle_name}}</td>-->
<!--        <td>{{item.post_name}}</td>-->
<!--        <td>{{Utils.timeOnlyDate(item.birthday)}}</td>-->
<!--        <td>{{item.birth_place}}</td>-->
<!--        <td>{{item.address}}</td>-->
<!--        <td>-->
<!--          <UIMenuButton-->
<!--              :data="item"-->
<!--              :show-edit="true"-->
<!--              @selectEv="onSelectEv"-->
<!--          />-->
<!--        </td>-->
      </tr>
      </tbody>
    </n-table>
  </n-spin>
</template>