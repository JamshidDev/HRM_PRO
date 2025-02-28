<script setup>
import AudioPlayer from "./AudioPlayer.vue";
import VideoPlayer from "./VideoPlayer.vue";
import DocumentViewer from "./DocumentViewer.vue";
import ImageViewer from "./ImageViewer.vue";

const mediaUrl = ref("");
const mediaType = ref("pdf");
const isVisible = ref(true);

const mediaViewer = {
  showMediaViewer(url, type) {
    mediaUrl.value = url;
    if (type.startsWith("audio/")) {
      mediaType.value = "audio"
    } else if (type.startsWith("video/")) {
      mediaType.value = "video"
    } else if (type.startsWith("image/")) {
      mediaType.value = "image"
    } else if (type === "application/pdf") {
      mediaType.value = "pdf"
    } else {
      mediaType.value = ""
    }
    isVisible.value = !!mediaType.value;
  },
  hideMediaViewer() {
    isVisible.value = false;
  },
};

window.$MediaViewer = mediaViewer;
</script>

<template>
  <div>
    <AudioPlayer v-if="mediaType === 'audio'" :src="mediaUrl" />
    <VideoPlayer v-if="mediaType === 'video'" :src="mediaUrl" />
    <ImageViewer v-if="mediaType === 'image'" :src="mediaUrl" />
    <DocumentViewer v-if="mediaType === 'pdf'"  />
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
