<script setup>
defineProps({
  html: {
    type: String,
    required: true
  },
  className: String
})

</script>

<template>
  <span :class="className" class="wang-wysiwyg-editor">
    <span
      class="editor-content-view"
      v-html="html"
    />
  </span>
</template>

<style lang="scss">
.wang-wysiwyg-editor {
  p, p * {
    color: rgb(var(--v-theme-on-surface));
  }

  .editor-content-view {
    height: 100%;
    overflow-x: auto;

    img {
      max-height: 100%;
      max-width: 100%;
    }

    p,
    li {
      white-space: pre-wrap;
    }

    blockquote {
      border-left: 8px solid rgba(var(--v-theme-primary), 0.4);
      padding: 10px 10px;
      margin: 10px 0;
      background-color: rgba(var(--v-theme-success), 0.1);
    }

    code {
      font-family: monospace;
      background-color: rgba(var(--v-theme-surface), 1);
      padding: 3px;
      border-radius: 3px;
      overflow-x: auto;
    }

    pre > code {
      display: block;
      padding: 10px;
      overflow-x: auto;
    }

    table {
      border-collapse: collapse;
    }

    td,
    th {
      border: 1px solid rgba(var(--v-theme-success), 0.4);
      min-width: 50px;
      height: 20px;
    }

    th {
      background-color: rgba(var(--v-theme-success), 0.2);
    }

    ul,
    ol {
      padding-left: 20px;
    }

    input[type="checkbox"] {
      margin-right: 5px;
    }
  }
}
</style>
