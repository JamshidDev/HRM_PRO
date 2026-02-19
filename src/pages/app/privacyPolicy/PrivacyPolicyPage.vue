<script setup>
import { useRouter } from 'vue-router'
import { AppPaths, useAppSetting } from '@/utils/index.js'

const router = useRouter()
</script>

<template>
  <div class="privacy-bg w-full min-h-screen flex flex-col items-center justify-start py-10 px-4">

    <!-- Header -->
    <div class="w-full max-w-[800px] flex items-center justify-between mb-8">
      <div class="flex items-center gap-3 cursor-pointer" @click="router.push(AppPaths.Login)">
        <img :src="useAppSetting.appLogoUrl" alt="HR Rail Logo" class="h-[44px] object-contain" />
        <span class="text-white font-bold text-xl uppercase tracking-wide">HRM Railway</span>
      </div>
      <n-button
        text
        class="text-white! opacity-70 hover:opacity-100 transition-opacity"
        @click="router.push(AppPaths.Login)"
      >
        ← Back to Login
      </n-button>
    </div>

    <!-- Card -->
    <div class="privacy-card w-full max-w-[800px] rounded-[20px] overflow-hidden">

      <!-- Card Header -->
      <div class="privacy-card-header px-10 py-8">
        <div class="flex items-center gap-3 mb-2">
          <div class="privacy-shield-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.25C17.25 22.15 21 17.25 21 12V7L12 2z" fill="white" opacity="0.9"/>
              <path d="M9 12l2 2 4-4" stroke="#1279F0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <h1 class="text-white text-3xl font-bold">Privacy Policy</h1>
        </div>
        <p class="text-white opacity-70 text-sm mt-1">Effective Date: January 1, 2026</p>
        <p class="text-white opacity-85 mt-4 leading-relaxed text-sm">
          <strong>HRM Railway</strong> is developed for internal use within railway organizations to
          facilitate employee management and HR-related processes.
        </p>
      </div>

      <!-- Card Body -->
      <div class="privacy-card-body px-10 py-8 flex flex-col gap-8">

        <!-- Section: Information We Collect -->
        <div class="privacy-section">
          <div class="section-title-row">
            <div class="section-dot bg-primary-color"></div>
            <h2 class="section-title">Information We Collect</h2>
          </div>
          <p class="section-lead">The App may collect and process the following information:</p>
          <ul class="privacy-list">
            <li>Employee identification data (name, position, department)</li>
            <li>Contact information (phone number, email address)</li>
            <li>Attendance and work schedule data</li>
            <li>Device-related information (device type, operating system)</li>
            <li>Authentication credentials for secure access</li>
          </ul>
        </div>

        <div class="privacy-divider"></div>

        <!-- Section: How We Use Information -->
        <div class="privacy-section">
          <div class="section-title-row">
            <div class="section-dot bg-success-color"></div>
            <h2 class="section-title">How We Use Information</h2>
          </div>
          <p class="section-lead">The collected information is used solely for:</p>
          <ul class="privacy-list">
            <li>Managing employee records</li>
            <li>Attendance tracking</li>
            <li>Internal communication</li>
            <li>Secure system authentication</li>
            <li>Organizational reporting and analytics</li>
          </ul>
        </div>

        <div class="privacy-divider"></div>

        <!-- Section: Data Security -->
        <div class="privacy-section">
          <div class="section-title-row">
            <div class="section-dot bg-warning-color"></div>
            <h2 class="section-title">Data Security</h2>
          </div>
          <div class="flex flex-col gap-3">
            <p class="section-text">
              We implement appropriate technical and organizational measures to protect personal data
              against unauthorized access, disclosure, or misuse.
            </p>
            <p class="section-text">
              All data is transmitted over secure, encrypted connections.
            </p>
          </div>
        </div>

        <div class="privacy-divider"></div>

        <!-- Section: Data Sharing -->
        <div class="privacy-section">
          <div class="section-title-row">
            <div class="section-dot" style="background: #a855f7"></div>
            <h2 class="section-title">Data Sharing</h2>
          </div>
          <ul class="privacy-list">
            <li>We do not sell or share personal information with third parties.</li>
            <li>Data is accessible only to authorized personnel within the organization.</li>
          </ul>
        </div>

        <div class="privacy-divider"></div>

        <!-- Section: Data Retention -->
        <div class="privacy-section">
          <div class="section-title-row">
            <div class="section-dot" style="background: #f97316"></div>
            <h2 class="section-title">Data Retention</h2>
          </div>
          <p class="section-text">
            Personal data is retained only as long as necessary to fulfill HR and legal requirements.
          </p>
        </div>

        <div class="privacy-divider"></div>

        <!-- Section: User Rights -->
        <div class="privacy-section">
          <div class="section-title-row">
            <div class="section-dot bg-primary-color"></div>
            <h2 class="section-title">User Rights</h2>
          </div>
          <p class="section-text">
            Users may contact their organization's HR department regarding access, correction, or
            deletion of personal data.
          </p>
        </div>

        <div class="privacy-divider"></div>

        <!-- Section: Contact -->
        <div class="privacy-contact-block">
          <div class="section-title-row mb-2">
            <div class="section-dot bg-success-color"></div>
            <h2 class="section-title">Contact Information</h2>
          </div>
          <p class="section-text">
            If you have any questions regarding this Privacy Policy, please contact your
            organization's administrator.
          </p>
        </div>

      </div>

      <!-- Card Footer -->
      <div class="privacy-card-footer px-10 py-5 flex items-center justify-between">
        <span class="text-sm opacity-60">© 2026 HRM Railway. All rights reserved.</span>
        <n-button
          size="small"
          class="footer-back-btn"
          @click="router.push(AppPaths.Login)"
        >
          Back to Login
        </n-button>
      </div>

    </div>

    <div class="h-10"></div>
  </div>
</template>

<style scoped>
.privacy-bg {
  background: linear-gradient(160deg, #042440 0%, #0b4d8e 50%, #0177d7 100%);
}

.privacy-card {
  box-shadow: 0 24px 80px rgba(0, 0, 0, 0.3);
}

.privacy-card-header {
  background: linear-gradient(135deg, #0f3a6e 0%, #1279F0 100%);
}

.privacy-card-body {
  background: var(--surface-section);
}

.privacy-card-footer {
  background: var(--surface-ground);
  border-top: 1px solid var(--surface-line);
  color: var(--surface-text);
}

.privacy-shield-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.15);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
}

.privacy-divider {
  height: 1px;
  background: var(--surface-line);
}

.privacy-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.privacy-contact-block {
  border-radius: 12px;
  padding: 20px;
  background: var(--surface-ground);
  border: 1px solid var(--surface-line);
}

.section-title-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.bg-primary-color  { background: var(--primary-color); }
.bg-success-color  { background: var(--success-color); }
.bg-warning-color  { background: var(--warning-color); }

.section-title {
  font-size: 17px;
  font-weight: 700;
  color: var(--surface-text);
  margin: 0;
}

.section-lead {
  font-size: 14px;
  color: var(--surface-text);
  opacity: 0.75;
  margin: 0;
}

.section-text {
  font-size: 14px;
  color: var(--surface-text);
  line-height: 1.7;
  margin: 0;
  opacity: 0.85;
}

.privacy-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.privacy-list li {
  font-size: 14px;
  color: var(--surface-text);
  opacity: 0.85;
  line-height: 1.6;
  padding-left: 20px;
  position: relative;
}

.privacy-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--primary-color);
  opacity: 0.6;
}

.footer-back-btn {
  background: var(--primary-color) !important;
  color: white !important;
  border: none !important;
  border-radius: 8px !important;
}
</style>
