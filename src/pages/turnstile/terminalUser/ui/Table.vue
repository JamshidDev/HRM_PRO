<script setup>
import {NoDataPicture, UIBadge, UIMenuButton, UIPagination, UIUser} from "@/components/index.js"
import { useTurnstileTerminalUserStore} from "@/store/modules/index.js"
import {Eye12Filled} from '@vicons/fluent'

const store = useTurnstileTerminalUserStore()

const changePage = (v)=>{
  store.params.page = v.page
  store.params.per_page = v.per_page
  store._index()
}

const onSelect = (v)=>{
  if(v.key === 'delete'){
    store.elementId = v.data.worker.id
    store._delete()
  }
}

const onShow = (v)=>{
  store.instanceData = null
  store.elementId = v
  store._show()
}

const toggleDetachTerminals = (v)=>{
  if(store.payload.detachTerminals.includes(v)){
    store.payload.detachTerminals = store.payload.detachTerminals.filter(i=>i!==v)
  }else{
    store.payload.detachTerminals.push(v)
  }
}

</script>

<template>
  <n-spin :show="store.loading" style="min-height: 200px">
    <div class="w-full overflow-x-auto"  v-if="store.list.length>0">
      <n-table
          class="mt-5 w-full table-fixed"
          :single-line="false"
          size="small"
      >
        <thead>
        <tr>
          <th class="text-center! w-[30px] min-w-[30px] grow-0">{{$t('content.number')}}</th>
          <th class="min-w-[200px]">{{$t('content.staff')}}</th>
          <th class="text-center! max-w-[200px] w-[200px]">{{$t('turnstile.terminalUser.terminals')}}</th>
          <th class="max-w-[65px] w-[65px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in store.list" :key="idx">
          <td class="w-[20px] max-w-[20px]"><span class="text-center text-[12px] text-gray-600 block">{{ (store.params.page - 1) * store.params.per_page + idx + 1 }}</span></td>
          <td>
            <UIUser
                :short="false"
              :data="{
                photo: item.worker.photo,
                lastName: item.worker.last_name,
                firstName: item.worker.first_name,
                middleName: item.worker.middle_name,
                position: item.post_name
              }"
            />
          </td>
          <td class="text-center!">
            <n-popover v-if="item.terminals_count" :show="!!(store.instanceData && item.worker.id === store.elementId)" @clickoutside="store.elementId=null" trigger="click">
              <div>
                <div class="h-[150px] max-h-[150px] overflow-y-auto">
                  <div v-for="(option, idx) in store.instanceData?.terminals" :key="option.id">
                    <n-divider v-if="idx" class="my-1!" />
                    <n-checkbox @click="()=>toggleDetachTerminals(option.id)" :checked="!store.payload.detachTerminals.includes(option.id)">
                      <div class="flex flex-col">
                        <div class="text-xs font-medium text-gray-500">{{option.terminal.name}}</div>
                        <div class="text-xs text-primary">{{option.terminal.building.name}}</div>
                      </div>
                    </n-checkbox>
                  </div>
                </div>
                <n-button
                  block
                  :loading="store.saveLoading && store.elementId===item.worker.id"
                  :disabled="!store.payload.detachTerminals.length"
                  type="primary"
                  @click="store._detach()"
                >
                  {{$t('content.save')}}
                </n-button>
              </div>
              <template #trigger>
                <div class="group relative inline-block">
                  <n-spin :show="store.instanceDataLoading">
                    <n-button class="group-hover:opacity-0" circle ghost>
                      {{item.terminals_count}}
                    </n-button>
                    <div class="opacity-0 group-hover:opacity-100 transition-all absolute left-0 top-0 right-0 bottom-0">
                      <n-button @click="()=>onShow(item.worker.id)" circle ghost>
                        <template #icon>
                          <n-icon>
                            <Eye12Filled />
                          </n-icon>
                        </template>
                      </n-button>
                    </div>
                  </n-spin>
                </div>
              </template>
            </n-popover>
          </td>
          <td>
            <UIMenuButton
                :data="item"
                @select-ev="onSelect"
                :loading="store.elementId === item.worker.id && store.deleteLoading"
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
    <NoDataPicture v-if="store.list.length===0 && !store.loading" />
  </n-spin>
</template>
