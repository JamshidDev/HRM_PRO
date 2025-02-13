<script setup>
import {Editor, Toolbar} from '@wangeditor/editor-for-vue'
import {i18nChangeLanguage} from '@wangeditor/editor'
import i18n from "@/i18n/index.js"

const emit = defineEmits(['onRemove'])

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

const toolbarConfig= {
  toolbarKeys: [
    'uploadImage', 'menu1',
  ],
}

const editorConfig = {
  placeholder: i18n.global.t('content.enterField'),
  MENU_CONF: {
    uploadImage: {
      base64LimitSize: 0,
      maxNumberOfFiles: 10,
      allowedFileTypes: ['image/*'],
      async customUpload(file, insertFn) {
        const formData = new FormData()
        formData.append('files', file)
        // await uploadBaseApi.uploadFile(formData)
        //     .then(({data}) => {
        //       insertFn(data[0].url, data[0].fileName, data[0].url)
        //     })
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
}
</script>

<template>
  <div
      class="test-option-editor cursor-pointer">
    <div>
      <Editor
          v-model="text"
          :defaultConfig="editorConfig"
          :mode="'default'"
          class="editor"
          @onCreated="handleCreated"
      />
    </div>
    <div class="d-flex justify-end ma-2">
      <Toolbar
          :defaultConfig="toolbarConfig"
          :editor="editorRef"
          :mode="'default'"
          class="toolbar"
      />
    </div>
  </div>
</template>
<style lang="scss">
.test-option-editor {

  .editor {
    .w-e-text-container {
      background-color: transparent;
    }
  }

  .toolbar {
    .w-e-bar {
      background-color: transparent;
    }
  }

  //.radio-input {
  //  height: 17px;
  //  width: 17px;
  //  display: flex;
  //  justify-content: center;
  //  align-items: center;
  //  cursor: pointer;
  //  position: relative;
  //
  //  &:after {
  //    position: absolute;
  //    content: '';
  //    height: 15px;
  //    width: 15px;
  //    border-radius: 50%;
  //    border: 1px solid rgba(var(--v-theme-secondary), 0.3);
  //  }
  //}

  //&-active {
  //  border-color: rgba(var(--v-theme-success), 0.2);
  //  background-color: rgba(var(--v-theme-success), 0.1);
  //
  //  .radio-input {
  //    &:before {
  //      content: '';
  //      height: 9px;
  //      width: 9px;
  //      border-radius: 50%;
  //      border: rgba(var(--v-theme-success), 1);
  //      background-color: rgba(var(--v-theme-success), 1);
  //      position: absolute;
  //    }
  //
  //    &:after {
  //      border: 1px solid rgba(var(--v-theme-secondary), 0.3);
  //    }
  //  }
}
</style>
