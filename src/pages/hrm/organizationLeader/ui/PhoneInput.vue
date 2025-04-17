// PhoneInput.vue
<script setup>
import { Delete28Regular, AddCircle28Regular } from "@vicons/fluent";
import { ref } from 'vue';
import { vMaska } from 'maska/vue';

const props = defineProps({
  removable: Boolean,
  addable: Boolean,
  phone: String
});
const emit = defineEmits(['add', 'remove', 'update:value']);

const masked = ref('')
const unmasked = ref('');
defineExpose({ unmasked });

const onBlur = () => {
  if (!masked.value && props.removable) {
    emit('remove');
  }
};

onMounted(()=>{
  masked.value = props.phone;
})

</script>

<template>
  <n-input-group>
    <n-button type="error" v-if="removable" @click="emit('remove')">
      <template #icon>
        <n-icon :component="Delete28Regular" />
      </template>
    </n-button>

    <n-input
        v-model:value="masked"
        @update:value="emit('update:value', unmasked)"
        v-maska:unmasked.unmasked="{ mask: ['##-###-##-##', '##-###'] }"
        @blur="onBlur"
    />

    <n-button type="primary" v-if="addable" @click="emit('add')">
      <template #icon>
        <n-icon :component="AddCircle28Regular" />
      </template>
    </n-button>
  </n-input-group>
</template>
