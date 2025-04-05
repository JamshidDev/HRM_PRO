<script setup>
import {UIUser, UIPagination, UIMenuButton} from "@/components/index.js";
import {useTopicExamResultStore} from "@/store/modules/index.js";
import Utils from "@/utils/Utils.js";

const store = useTopicExamResultStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

</script>
<template>
  <n-spin :show="store.loading" >
    <n-table
        size="small"
        class="w-full mt-4"
      :single-line="false"
    >
      <thead>
        <tr>
          <th class="!text-center">{{$t('content.number')}}</th>
          <th>
            {{$t('content.worker')}}
          </th>
          <th>
            {{$t('solveExamPage.exam')}}
          </th>
          <th>
            {{$t('examPage.startTime')}}
          </th>
          <th>
            {{$t('examPage.endTime')}}
          </th>
          <th>
            {{$t('examPage.result')}}
          </th>
          <th>
            {{$t('examPage.ip')}}
          </th>
          <th>
            {{$t('examPage.device')}}
          </th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(result, idx) in store.list" :key="idx">
          <td class="!text-center">{{idx+1+(store.params.page-1)*store.params.per_page}}</td>
          <td><UIUser
              :short="false"
            :data="{
              photo: result.worker.photo,
              lastName: result.worker.last_name,
              firstName: result.worker.first_name,
              middleName: result.worker.middle_name,
            }"
          /></td>
          <td>
            {{result.exam?.name}}
          </td>
          <td>
            <n-tag round size="small" type="warning">
              {{Utils.timeWithMonth(result?.created)}}
            </n-tag>

          </td>
          <td>
            <n-tag v-if="result?.ended" round size="small" type="warning">
              {{Utils.timeWithMonth(result?.ended)}}
            </n-tag>
          </td>
          <td class="text-center">
            <n-tag v-if="typeof result?.result ==='number' " round>{{result?.result}}</n-tag>
          </td>
          <td>
            {{result.ip_address}}
          </td>
          <td>
            {{result.user_agent}}
          </td>
          <td>
            <UIMenuButton
              :show-delete="false"
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
  </n-spin>

</template>