<script setup>
import { useExamAttemptStore } from '@/store/modules';
import { useRoute } from 'vue-router';
import {Warning20Filled} from "@vicons/fluent";
const store = useExamAttemptStore()
const route = useRoute()

</script>

<template>
    <div>
        <n-alert type="warning">
            {{$t('solveExamPage.alreadyStarted')}}
            </n-alert>
        <div>
            <n-button>{{$t('content.continue')}}</n-button>
            <n-popover trigger="hover">
            {{$t('solveExamPage.restartWarning')}}
            <template #trigger>
                <n-button>
                {{$t('content.restart')}}
                <template #icon>
                    <n-icon :component="Warning20Filled" />
                </template>
                </n-button>
            </template>
            </n-popover>
        </div>
    </div>
</template>