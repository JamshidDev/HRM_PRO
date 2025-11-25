<script setup>
import {useSocketStore} from "@/store/modules/index.js"
import {UIModal, UIOnlineOffline, UIUser} from "@/components/index.js"
import {useAppSetting} from "@/utils/index.js"

const store = useSocketStore()
</script>

<template>
  <UIModal
      :title="$t('socketPage.usersMOdalTitle')"
      :width="1200"
      v-model:visible="store.userVisible"
  >
    <div class="w-full h-[calc(100vh-300px)] overflow-y-scroll px-2">
      <div class="grid grid-cols-12 gap-4">
        <template v-for="user in 30">
          <div class="col-span-3 bg-surface-ground rounded-lg p-4">
            <UIUser
                :short="false"
                :data="{
                  photo:useAppSetting.noAvailableImage,
                  lastName:'Raximov',
                  firstName:'Jamshid',
                  middleName:'Shuxrat ogli',
                  position:''
                }"
            >
              <template #position>
                <UIOnlineOffline :is-button-text="true" class="!w-[60px] leading-[1]" :status="true" :text="$t('content.online')" />
              </template>
            </UIUser>
            <div class="border border-secondary h-[60px]">
              "O‘zbekiston temir yo‘llari" AJ
            </div>
          </div>
        </template>
      </div>

    </div>
  </UIModal>
</template>

