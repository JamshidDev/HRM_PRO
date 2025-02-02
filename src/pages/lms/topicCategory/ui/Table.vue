<script setup>
import {AddCircle32Regular} from "@vicons/fluent"
</script>

<template>
<div class="grid grid-cols-12">
  <div class="col-span-12">
    <n-button type="primary" dashed style="width: 100%">
      <template #icon>
        <AddCircle32Regular/>
      </template>
    {{$t('topicDetailsPage.categories.form.attach')}}
    </n-button>
  </div>
</div>
</template>
