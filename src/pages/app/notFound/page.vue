<script setup>
  import { useRouter } from 'vue-router'
  import notFoundImg from '@/assets/images/svg/not-found.svg?url'

  const router = useRouter()

  const goHome = () => {
    router.push('/')
  }
</script>

<template>
  <div class="not-found-container">
    <img :src="notFoundImg" class="not-found-img" alt="404" />
    <h1 class="title">Sahifa topilmadi</h1>
    <p class="description">Manzil noto'g'ri yoki o'chirilgan</p>
    <n-button type="primary" size="large" @click="goHome">Bosh sahifaga qaytish</n-button>
  </div>
</template>

<style scoped>
  .not-found-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    padding: 2rem;
    background: var(--surface-ground-soft);
  }

  .not-found-img {
    width: 100%;
    max-width: 280px;
    margin-bottom: 2rem;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    color: var(--textColor0);
    margin: 0 0 0.5rem;
  }

  .description {
    font-size: 1rem;
    color: var(--textColor1);
    margin: 0 0 2rem;
  }

  @media (max-width: 480px) {
    .not-found-img {
      max-width: 200px;
    }

    .title {
      font-size: 1.5rem;
    }
  }
</style>
