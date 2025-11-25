<script setup>
import {useSocketStore} from "@/store/modules/index.js"
import {useAppSetting, useDebounce} from "@/utils/index.js"
import { ref, computed, watch } from 'vue'

const store = useSocketStore()

const displayUsers = ref([])
const allowedUserCount = 6

watch(()=>store.allOnlineUsers,(v)=>{
  updateUsersEv(v)
},{deep:true})

const updateUsersEv = useDebounce((users)=>{
  displayUsers.value = users
},1000)

const othersUserCount = computed(()=>(displayUsers.value.length - allowedUserCount))
const allowedShowUsers = computed(()=>displayUsers.value.slice(-allowedUserCount))

onMounted(() => {
  displayUsers.value = store.allOnlineUsers

})
</script>

<template>
  <div class="w-full">
    <div class="flex justify-center items-center w-full h-[100px] relative">
      <transition-group name="list" tag="div" class="flex justify-center items-center relative">
        <template
            v-for="(user, index) in allowedShowUsers"
            :key="user.id"
        >
          <div class="relative group">
            <div
                class="w-[80px] h-[80px] border-4 border-[#6f99ff] rounded-full
                 bg-surface-section flex justify-center items-center text-sm font-bold
                 cursor-pointer transition-all overflow-hidden relative hover:scale-[1.2]"
                :style="{
            marginLeft: index === 0 ? '0' : '-20px',
            zIndex:(50-index)
          }"
                @mouseenter="$event.target.style.zIndex = 200"
                @mouseleave="$event.target.style.zIndex = 50 - index"
                :title="user.short_name">

              <img class="w-full h-full object-cover object-top" :src="user?.photo || useAppSetting.noAvailableImage" alt="user image">
              <div class="absolute inset-0 rounded-full" :style="{ background: 'radial-gradient(circle, rgba(0, 0, 0, 0) 48%, rgb(5 9 255 / 60%) 90%)' }"></div>

            </div>
            <div class="absolute bottom-[10px] group-hover:bottom-[-50px] left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[#6f99ff] text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap transition-all duration-250 line-clamp-1">
              {{ user.short_name }}
            </div>

          </div>

        </template>

        <transition name="count-fade" :key="`count-${othersUserCount}`">
          <div v-if="othersUserCount>0" class="ml-2 text-[#6f99ff] font-bold text-lg cursor-pointer">+{{othersUserCount}}</div>
        </transition>
      </transition-group>
    </div>

    <h3 class="text-center text-lg mt-4 max-w-[400px] mx-auto font-bold"
        :style="{
      backgroundImage: 'linear-gradient(135deg, rgb(59, 130, 246) 0px, rgb(139, 92, 246) 50%, rgb(6, 182, 212) 100%)',
      backgroundClip: 'text',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      color: 'transparent'
    }">
      Hozirda tizimdagi online foydalanuvchilar
    </h3>
  </div>
</template>

<style scoped>
.list-enter-active,
.list-leave-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.list-enter-from {
  opacity: 0;
  transform: scale(0.3) translateX(-40px);
}

.list-leave-to {
  opacity: 0;
  transform: scale(0.3) translateX(40px);
}

.list-move {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.count-fade-enter-active,
.count-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.count-fade-enter-from,
.count-fade-leave-to {
  opacity: 0;
  transform: scale(0) translateY(-20px);
}
</style>