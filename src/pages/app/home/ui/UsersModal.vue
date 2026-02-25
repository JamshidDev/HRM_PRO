<script setup>
  import { useSocketStore } from '@/store/modules/index.js'
  import { UIDrawer, UIUser } from '@/components/index.js'
  import ReactionButton from './ReactionButton.vue'
  import { CheckmarkStarburst16Regular, Phone24Regular, Globe24Regular } from '@vicons/fluent'

  const store = useSocketStore()

  const onReactionEv = (emoji, v) => {
    store.sendNotification({
      emoji,
      toUserId: v.id
    })
  }
</script>

<template>
  <UIDrawer
    :title="$t('content.onlineUsers')"
    :width="320"
    v-model:visible="store.userVisible"
    :disable-body-padding="true"
  >
    <template #content>
      <div class="w-full h-[calc(100vh-80px)] overflow-y-auto pt-4 overflow-x-hidden">
        <template v-for="user in store.allOnlineUsers">
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

              <!-- Device badge -->
              <div
                class="p-1 absolute bottom-0 left-[28px] w-5 h-5 rounded-full border-2  flex items-center justify-center"
                :class="user.type === 'mobile' ? 'bg-success border-[#2ca361]' : 'bg-primary border-[#6f99ff]'"
              >
                <div v-if="user.type === 'mobile'" class="text-white text-[10px]">M</div>
                <div v-else class="text-white text-[10px]">W</div>

<!--                <n-icon size="8" class="text-white">-->
<!--                  <Phone24Regular v-if="user.type === 'mobile'" />-->
<!--                  <Globe24Regular v-else />-->
<!--                </n-icon>-->
              </div>
            </div>
            <div
              class="group-hover:opacity-100 group-hover:right-[-80px] hover:right-[0px] absolute right-[-120px] top-[3px] opacity-0 transition-all duration-300"
            >
              <ReactionButton @onReaction="onReactionEv($event, user)" />
            </div>
          </div>
        </template>
      </div>
    </template>
  </UIDrawer>
</template>
