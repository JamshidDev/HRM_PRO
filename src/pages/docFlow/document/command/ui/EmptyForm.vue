<script setup>
import {Warning24Filled} from "@vicons/fluent"
</script>

<template>
<div class="grid grid-cols-12 w-full justify-center border border-warning border-dashed bg-surface-ground rounded-md p-10">
      <div class="col-span-12 flex items-center gap-4 mx-auto">
        <n-icon size="30" class="text-warning">
          <Warning24Filled/>
        </n-icon>
        <span class="font-semibold text-warning">{{$t(`documentPage.command.form.notSelectCommand`)}}</span>
      </div>
</div>
</template>

<style scoped>

</style>