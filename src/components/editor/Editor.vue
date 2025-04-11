<script setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { i18nChangeLanguage } from '@wangeditor/editor'
import i18n from "@/i18n/index.js"
import {NFormItem} from "naive-ui";

const {t} = i18n.global

const props = defineProps({
  showToolbar: Boolean,
  showValidationMessage: {
    type: Boolean,
    default: true
  },
  placeholder: String,
  withValidation: {
    type: Boolean,
    default: false
  },
  extraRules: {
    type: Array,
    default: []
  },
  label: String,
  path: String
})

const editorRef = shallowRef()
const text = defineModel("text", {
  required: true,
  type: String
})

onBeforeMount(() => {
  i18nChangeLanguage('en')
})

const toolbarConfig = props.showToolbar ? {
  excludeKeys: [
    'group-indent',
    'emotion',
    'insertLink',
    'insertImage',
    'group-video',
    'codeBlock',
    'fullScreen',
    'code',
    'divider',
    'divider',
  ],
} : {
  toolbarKeys: [
    'uploadImage', 'menu1',
  ],
}

const editorConfig = ref({
  placeholder: props.placeholder || t('content.enterField'),
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
            insertFn(data,data,data)
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
})

onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return
  editor.destroy()
})

const handleCreated = (editor) => {
  editorRef.value = editor
}

</script>

<template>
    <component
        :is="withValidation ? NFormItem : 'div'"
        :label="label"
        :show-label="!!label"
        :rule="[{
          trigger: ['input', 'blur'],
          validator() {
            return (editorRef?.isEmpty() || editorRef?.getText()?.trim()==='') ? new Error( t('rules.requiredField')) : true
          },
        },
         ...extraRules
        ]"
        :path="path"
        :show-feedback="showValidationMessage"
    >
      <div class="w-full border border-surface-line drop-shadow-sm">
        <Toolbar
            v-if="showToolbar"
            :defaultConfig="toolbarConfig"
            :editor="editorRef"
            :mode="'default'"
            class="toolbar border-b border-surface-line"
        />
        <Editor
            v-model="text"
            :defaultConfig="editorConfig"
            :mode="'default'"
            class="editor"
            @onCreated="handleCreated"
        />
      </div>
    </component>
</template>
<style lang="scss">
</style>
