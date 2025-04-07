<script setup>
import AudioPlayer from "./AudioPlayer.vue";
import VideoPlayer from "./VideoPlayer.vue";
import DocumentViewer from "./DocumentViewer.vue";
import ImageViewer from "./ImageViewer.vue";
import DjvuViewer from "./DjvuViewer.vue";

const mediaUrl = ref("");
const isVisible = ref(false);
const extension = ref('')
const FileExtensions = {
  IMAGE: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
  PDF: ['pdf'],
  DJVU: ['djvu'],
  DOCUMENT: ['doc', 'docx'],
  SPREADSHEET: ['xls', 'xlsx'],
  PRESENTATION: ['ppt', 'pptx'],
  VIDEO: ['mp4', 'mpeg', 'webm', 'mov'],
  AUDIO: ['mp3', 'wav', 'ogg'],
  ARCHIVE: ['zip', 'rar', '7z'],
  TEXT: ['txt', 'csv', 'json'],
}

const mediaViewer = {
  showMediaViewer(url, ext) {
    mediaUrl.value = url;
    if(!ext){
      let extPos = url.match(/./g).length || 1
      extension.value = url.split('.')?.[extPos-1]
    }else{
      extension.value = ext
    }
    isVisible.value = true;
  },
  hideMediaViewer() {
    mediaUrl.value = '';
    isVisible.value = false;
    extension.value = '';
  },
};

window.$MediaViewer = mediaViewer;
</script>

<template>
  <div>
    <template v-if="isVisible">

      <AudioPlayer
          v-if="FileExtensions.AUDIO.includes(extension)"
          :src="mediaUrl"
          @close="mediaViewer.hideMediaViewer()"
      />
      <VideoPlayer
          v-if="FileExtensions.VIDEO.includes(extension)"
          :src="mediaUrl"
          @close="mediaViewer.hideMediaViewer()" />
      <ImageViewer
          v-if="FileExtensions.IMAGE.includes(extension)"
          :src="mediaUrl"
          @close="mediaViewer.hideMediaViewer()"
      />
      <DocumentViewer v-if="FileExtensions.PDF.includes(extension)" :src="mediaUrl"  @close="mediaViewer.hideMediaViewer()"/>
      <DjvuViewer v-if="FileExtensions.DJVU.includes(extension)" :src="mediaUrl"  @close="mediaViewer.hideMediaViewer()"/>
    </template>
  </div>
</template>

<style scoped>
.media-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
}
.media-container {
  background: white;
  padding: 20px;
  border-radius: 10px;
}
button {
  margin-top: 10px;
  padding: 5px 10px;
}
</style>
