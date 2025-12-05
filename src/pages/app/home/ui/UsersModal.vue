<script setup>
import {useSocketStore} from "@/store/modules/index.js"
import {UIDrawer, UIOnlineOffline, UIUser} from "@/components/index.js"
import ReactionButton from "./ReactionButton.vue"
import {useAppSetting} from "@/utils/index.js"
import {CheckmarkStarburst16Regular} from "@vicons/fluent"

const store = useSocketStore()

const onReactionEv = (emoji, v) => {
  store.sendNotification({
    emoji,
    toUserId:v.id
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
            <UIUser
                :show-online-badge="true"
                :hide-tooltip="true"
                :short="false"
                class="font-medium !text-secondary"
                :data="{
                  photo:user.photo,
                  lastName:user.short_name,
                  firstName:'',
                  middleName:'',
                  position:user.role
                }"
            >
              <template #position>
                <div class="leading-[1] text-xs flex gap-1 items-center">

                  <div class="bg-primary/5 text-primary/80 px-1 rounded-lg py-[1px] border-primary/20 uppercase font-semibold text-[10px] flex items-center gap-1">
                    <n-icon size="14">
                      <CheckmarkStarburst16Regular/>
                    </n-icon>
                   <p class="line-clamp-1"> {{user.organization}}</p>
                  </div>
                </div>
              </template>
            </UIUser>
            <div class="group-hover:opacity-100 group-hover:right-[-80px] hover:right-[0px] absolute right-[-120px] top-[3px] opacity-0 transition-all duration-300">
              <ReactionButton @onReaction="onReactionEv($event,user)" />
            </div>
          </div>
        </template>

      </div>
    </template>

  </UIDrawer>
</template>

