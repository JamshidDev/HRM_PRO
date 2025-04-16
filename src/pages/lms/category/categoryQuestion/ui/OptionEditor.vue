<script setup>
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {i18nChangeLanguage} from '@wangeditor/editor'
import i18n from "@/i18n/index.js"
import {NFormItem} from "naive-ui";

const t = i18n.global.t

const emit = defineEmits(['onRemove', 'update:model-value'])
const props = defineProps({
  placeholder: String,

  extraRules: {
    type: Array,
    default: []
  },
  path: String,
  modelValue: {
    type: String,
  }
})

const editorRef = shallowRef()


onBeforeMount(() => {
  i18nChangeLanguage('en')
})

const toolbarConfig = {
  toolbarKeys: [
    'uploadImage', 'menu1',
  ],
}

const editorConfig = {
  placeholder: props?.placeholder || t('content.enterField'),
  MENU_CONF: {
    uploadImage: {
      base64LimitSize: 0,
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      async customUpload(file, insertFn) {
        const formData = new FormData()
        formData.append('file', file)
        await $ApiService.uploadService._create(formData)
            .then((res) => {
              const {data} = res.data
              console.log(data)
              insertFn(data, data, data)
            })
      },
    },
  },
  hoverbarKeys: {
    'image': {
      menuKeys: [
        'imageWidth30',
        'imageWidth50',
        'imageWidth100',
        'deleteImage',
        'justifyLeft',
        'justifyCenter',
        'justifyRight',
      ],
    },
  },
}

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor
  editor.on('delete-event', () => {
    emit('onRemove')
  })
  console.log(editor.getMenuConfig('menu1'))
}

const text = defineModel('text', {
  type: String,
  default: ''
})

const onChange = (editor) => {
  emit('update:model-value', editor.getHtml())
}
</script>

<template>
  <n-form-item
      :path="path"
      :rule="[{
          trigger: ['input', 'blur'],
          validator() {
            console.log('validator working')
            return (editorRef?.isEmpty() || editorRef?.getText()?.trim()==='') ? new Error( $t('rules.requiredField')) : true
          },
        },
         ...extraRules
        ]"
      :show-label="false"
      :show-feedback="false"
  >
    <div class="w-full flex">
      <Editor
          v-model="text"
          :defaultConfig="editorConfig"
          :mode="'default'"
          class="grow"
          @onCreated="handleCreated"
          @onChange="onChange"
      />

      <div class="flex items-center bg-white shrink-0">
        <Toolbar
            :defaultConfig="toolbarConfig"
            :editor="editorRef"
            :mode="'default'"
        />
      </div>
    </div>
  </n-form-item>
</template>
<style lang="scss">
</style>
