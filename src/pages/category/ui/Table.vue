<script setup>
import avatarImg from "@/assets/images/content/avatar-1.jpg";
import Utils from "@/utils/Utils.js";
import IconTextChip from "@/components/chip/IconTextChip.vue";
import {ActionButton} from "@/components/index.js";
import {useCategoriesStore} from "@/store/modules/categoriesStore.js";

const store = useCategoriesStore()
</script>

<template>
  <div class="w-full overflow-x-auto">
    <n-table
        class="mt-10"
        :single-line="false"
        size="small"
    >
      <thead>
      <tr>
        <th class="!text-center min-w-[40px] w-[40px]">{{$t('content.number')}}</th>
        <th class="min-w-[60px] w-[60px]">{{$t('content.photo')}}</th>
        <th class="min-w-[200px]">{{$t('content.name')}}</th>
        <th class="min-w-[120px] w-[300px]">{{$t('content.description')}}</th>
        <th class="min-w-[120px] w-[120px]">{{$t('content.action')}}</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="(item, idx) in store.list" :key="idx">
        <td><span class="text-center text-[12px] text-gray-600 block">{{idx+1}}</span></td>
        <td>
          <div
              class="flex justify-center items-center"
          >
            <n-avatar
                :src="item.image"
                fallback-src="/public/fail-image.png"
            />
          </div>

        </td>
        <td>{{item.name}}</td>
        <td>{{item.description}}</td>
        <td>
          <ActionButton/>
        </td>
      </tr>
      </tbody>
    </n-table>
  </div>
</template>

<style scoped>

</style>