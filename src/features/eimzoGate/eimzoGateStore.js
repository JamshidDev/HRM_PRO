/* global EIMZOClient */ // public/eimzo/e-imzo-client.js dan keladi
import { defineStore } from 'pinia'
import axios from '@/service/index.js'
import i18n from '@/i18n/index.js'
import { useSignatureStore } from '@/store/modules/index.js'
import { GATE_SIGNATURE_TYPE } from './config.js'

const { t } = i18n.global

export const useEimzoGateStore = defineStore('eimzoGateStore', {
  state: () => ({
    // null = hali so'ralmagan; true/false = serverdan kelgan holat.
    verified: null,
    statusLoading: false,
    confirmLoading: false
  }),
  actions: {
    // Sessiya tasdiqlanganmi — sahifa yangilangandan keyin ham to'g'ri bo'lishi uchun.
    async _status() {
      if (this.statusLoading) return
      this.statusLoading = true
      try {
        const res = await axios.get('/v1/eimzo-gate/status')
        this.verified = !!res.data?.data?.verified
      } catch {
        // Server javob bermasa qulflab qo'ymaymiz — tasdiq talab qilinadi.
        this.verified = false
      } finally {
        this.statusLoading = false
      }
    },

    // Kalit tanlash oynasini ochadi (imzolash SignatureInstance orqali davom etadi).
    async _confirm() {
      const signatureStore = useSignatureStore()
      this.confirmLoading = true
      try {
        await signatureStore._initialSignature(GATE_SIGNATURE_TYPE, () => {})
      } catch {
        // Xabarni signatureStore o'zi ko'rsatadi (E-IMZO ulanmagan va h.k.).
      } finally {
        this.confirmLoading = false
      }
    },

    // SignatureInstance kalit tanlangach shu metodni chaqiradi.
    _sign(keyId, challenge) {
      const signatureStore = useSignatureStore()
      EIMZOClient.createPkcs7(
        keyId,
        challenge,
        null,
        (pkcs7) => {
          axios
            .post('/v1/eimzo-gate/verify', { code: pkcs7 })
            .then(() => {
              this.verified = true
              signatureStore.visible = false
              $Toast.success(t('eimzoGate.verified'))
            })
            .finally(() => {
              signatureStore.loading = false
            })
        },
        () => {
          signatureStore.loading = false
        },
        false
      )
    }
  }
})
