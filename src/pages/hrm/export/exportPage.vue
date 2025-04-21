<script setup>
import {useExportStore} from "@/store/modules/index.js"

const store = useExportStore()

onMounted(() => {

  store._tasks()
})

</script>
<template>
That is downloads
</template>