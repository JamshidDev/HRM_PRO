<script setup>
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import { i18nChangeLanguage } from '@wangeditor/editor'
import i18n from "@/i18n/index.js"

const {t} = i18n.global

const props = defineProps({
  showToolbar: Boolean,
  height: [Number, String],
  maxHeight: {
    type: String,
    default: 'auto'
  },
  border: Boolean,
  placeholder: String
})

const editorRef = shallowRef()
const text = defineModel("text", {
  required: true,
  type: String
})
const isValid = defineModel("isValid", {
  type: Boolean,
  default: false,
})

watch(text, ()=>{
  isValid.value = editorRef.value?.isEmpty()
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
        formData.append('files', file)
        // await uploadBaseApi.uploadFile(formData)
        //   .then(({ data }) => {
        //     insertFn(data[0].url, data[0].fileName, data[0].url)
        //   })
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
  <div class="wang-wysiwyg-editor">
    <div>
      <Toolbar
          v-if="showToolbar"
          :defaultConfig="toolbarConfig"
          :editor="editorRef"
          :mode="'default'"
          class="toolbar border-b-sm"
      />
      <Editor
          v-model="text"
          :class="{border}"
          :defaultConfig="editorConfig"
          :mode="'default'"
          class="editor"
          @onCreated="handleCreated"
      />
    </div>
  </div>
</template>
<style lang="scss">
.wang-wysiwyg-editor {
  p, p * {
    color: rgb(var(--v-theme-on-surface));
  }
}
</style>
