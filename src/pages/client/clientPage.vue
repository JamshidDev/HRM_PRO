<script setup>
import FilterApp from "@/components/FilterApp/FilterApp.vue";
import Utils from "@/utils/Utils.js";
import IconTextChip from "@/components/chip/IconTextChip.vue";
import avatarImg from "@/assets/images/content/avatar-1.jpg"
const clientList = [
    {
      telegramId:32423423,
      fullName:"Jamshid Raximov.Sh",
      photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
      created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
  {
    telegramId:32423423,
    fullName:"Jamshid Raximov.Sh",
    photo:'https://bsinx-dashboard-template.multipurposethemes.com/bs5/images/avatar/avatar-13.png',
    created_at:new Date(),
  },
]


const onSearch = (v)=>{
  console.log(v)
}
</script>

<template>
  <div class="mx-4 my-2 bg-surface-section rounded p-4 border border-surface-line">
    <FilterApp
        @on-search="onSearch"
    />

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
          <th class="min-w-[200px]">{{$t('content.fullName')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.platform')}}</th>
          <th class="min-w-[140px] w-[140px]">{{$t('content.date')}}</th>
          <th class="min-w-[120px] w-[120px]">{{$t('content.action')}}</th>
        </tr>
        </thead>
        <tbody>
        <tr v-for="(item, idx) in clientList" :key="idx">
          <td><span class="text-center text-[12px] text-gray-600 block">{{idx+1}}</span></td>
          <td>
            <div
                class="flex justify-center items-center"
            >
              <n-avatar
                  round
                  size="small"
                  :src="avatarImg"
              />
            </div>

          </td>
          <td>{{item.fullName}}</td>
          <td><IconTextChip/></td>
          <td>{{Utils.timeWithMonth(item.created_at)}}</td>
          <td></td>
        </tr>
        </tbody>
      </n-table>
    </div>


  </div>
</template>

<style scoped>

</style>