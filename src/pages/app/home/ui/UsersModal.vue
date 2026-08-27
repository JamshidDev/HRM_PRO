<script setup>
import {useSocketStore} from '@/store/modules/index.js'
import {UIDrawer, UIUser} from '@/components/index.js'
import ReactionButton from './ReactionButton.vue'
import {CheckmarkStarburst16Regular, Laptop20Regular, Phone20Regular, Search48Filled} from '@vicons/fluent'
import MobileIcon from '@/assets/icons/home/mobile.svg'
import LaptopIcon from '@/assets/icons/home/laptop.svg'

const store = useSocketStore()

const searchQuery = ref(null)
const loginType = ref(null)
const onReactionEv = (emoji, v) => {
  store.sendNotification({
    emoji,
    toUserId: v.id
  })
}


const onSelectType = (v)=> {
  loginType.value = loginType.value === v ? null : v
}

const filteredUsers = computed(()=>{
  let options = store.allOnlineUsers

  if (loginType.value === 'w') {
    options = options.filter(item => item.type === 'sanctum')
  } else if (loginType.value === 'm') {
    options = options.filter(item => item.type !== 'sanctum')
  }

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    options = options.filter(item =>
        item.short_name.toLowerCase().includes(query)
    )
  }

  return options
})


</script>

<template>
  <UIDrawer
    :title="$t('content.onlineUsers')"
    :width="320"
    v-model:visible="store.userVisible"
    :disable-body-padding="true"
  >
    <template #content>
      <div class="px-2 pt-4 pb-1 flex gap-2">
        <n-input
          clearable
          class="w-full md:max-w-[200px]! md:w-full!"
          v-model:value="searchQuery"
          type="text"
          :placeholder="$t('content.search')"
        >
          <template #suffix>
            <n-icon :component="Search48Filled" />
          </template>
        </n-input>
        <!-- Filtr tugmalari: "W"/"M" harflari o'rniga qurilma ikonkalari
             (veb — laptop, mobil — telefon). Tanlanganda yonida topilganlar
             soni chiqadi. -->
        <n-button-group>
          <n-button
            :type="loginType === 'w' ? 'primary' : 'default'"
            round
            :title="$t('homePage.deviceWeb')"
            @click="onSelectType('w')"
          >
            <template #icon>
              <n-icon :component="Laptop20Regular" />
            </template>
            <span v-if="loginType === 'w'">{{ filteredUsers.length }}</span>
          </n-button>
          <n-button
            :type="loginType === 'm' ? 'success' : 'default'"
            round
            :title="$t('homePage.deviceMobile')"
            @click="onSelectType('m')"
          >
            <template #icon>
              <n-icon :component="Phone20Regular" />
            </template>
            <span v-if="loginType === 'm'">{{ filteredUsers.length }}</span>
          </n-button>
        </n-button-group>
      </div>
      <div class="w-full h-[calc(100vh-120px)] overflow-y-auto overflow-x-hidden">
        <template v-for="user in filteredUsers" :key="user.id">
          <div class="pl-3 mb-1 py-1 group relative hover:bg-surface-ground">
            <div class="relative">
              <UIUser
                :hide-tooltip="true"
                :short="false"
                class="font-medium !text-secondary"
                :data="{
                  photo: user.photo,
                  lastName: user.short_name,
                  firstName: '',
                  middleName: '',
                  position: user.role
                }"
              >
                <template #position>
                  <div class="leading-[1] text-xs flex gap-1 items-center">
                    <div
                      class="bg-primary/5 text-primary/80 px-1 rounded-lg py-[1px] border-primary/20 uppercase font-semibold text-[10px] flex items-center gap-1"
                    >
                      <n-icon size="14">
                        <CheckmarkStarburst16Regular />
                      </n-icon>
                      <p class="line-clamp-1">{{ user.organization }}</p>
                    </div>
                  </div>
                </template>
              </UIUser>

              <!-- Qurilma belgisi — bosh sahifadagi karta (`OnlineUsersCard.vue`)
                   bilan bir xil ikonkalar: mobil uchun `mobile-alt`, veb uchun
                   `laptop-alt`. SVG'lar oq rangda chizilgan, belgi foni esa
                   qurilma turiga qarab yashil/ko'k. -->
              <div
                class="users-modal__badge absolute bottom-0 left-[28px] w-5 h-5 rounded-full border-2 flex items-center justify-center"
                :class="user.type === 'mobile' ? 'bg-success border-[#2ca361]' : 'bg-primary border-[#6f99ff]'"
                :title="user.type === 'mobile' ? $t('homePage.deviceMobile') : $t('homePage.deviceWeb')"
              >
                <MobileIcon v-if="user.type === 'mobile'" />
                <LaptopIcon v-else />
              </div>
            </div>
            <div
              class="group-hover:opacity-100 group-hover:right-[-80px] hover:right-[0px] absolute right-[-120px] top-[3px] opacity-0 transition-all duration-300"
            >
              <ReactionButton @onReaction="onReactionEv($event, user)" />
            </div>
          </div>
        </template>
        <div v-if="!filteredUsers?.length" class="w-full text-secondary text-center mt-10">{{ $t('content.no-data') }}</div>
      </div>
    </template>
  </UIDrawer>
</template>

<style scoped>
  /* SVG'larda o'lcham atributi 12px — 20px belgi ichida (2px hoshiya bilan)
     u kattalik qiladi, shuning uchun kartadagi nisbatga moslab kichraytiriladi. */
  .users-modal__badge :deep(svg) {
    width: 11px;
    height: 11px;
  }
</style>
