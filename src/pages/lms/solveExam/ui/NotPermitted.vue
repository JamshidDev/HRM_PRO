<script setup>
import { useExamAttemptStore } from '@/store/modules';
import { useRouter, useRoute } from 'vue-router';



const store = useExamAttemptStore()

</script>

<template>
    <div>
        <n-alert type="error">
            Imtihonni yechishingiz mumkin emas    
        </n-alert>
        <div>
            <!-- <n-button>{{$t('content.continue')}}</n-button>
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
            </n-popover> -->
        </div>
    </div>
</template>