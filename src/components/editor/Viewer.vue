<script setup>
defineProps({
  html: {
    type: String,
    required: true
  }
})

</script>

<template>
  <div class="w-full">
    <span
      class="editor-content-view text-textColor0"
      v-html="html"
    />
  </div>
</template>

<style lang="scss">
.editor-content-view{
  p,
  li {
    white-space: pre-wrap;
  }

  blockquote {
    border-left: 8px solid #d0e5f2;
    padding: 10px 10px;
    margin: 10px 0;
    background-color: #f1f1f1;
  }

  code {
    font-family: monospace;
    background-color: #eee;
    padding: 3px;
    border-radius: 3px;
  }
  pre>code {
    display: block;
    padding: 10px;
  }

  table {
    border-collapse: collapse;
  }
  td,
  th {
    border: 1px solid #ccc;
    min-width: 50px;
    height: 20px;
  }
  th {
    background-color: #f1f1f1;
  }

  ul,
  ol {
    padding-left: 20px;
  }

  input[type="checkbox"] {
    margin-right: 5px;
  }
  img{
    display: inline;
  }
}

</style>
