/* global EIMZOClient */ // public/eimzo/e-imzo-client.js dan keladi
import { defineStore } from 'pinia'
import axios from '@/service/index.js'
import i18n from '@/i18n/index.js'
import { useSignatureStore } from '@/store/modules/index.js'
import { GATE_SIGNATURE_TYPE } from './config.js'

const { t } = i18n.global

// Iqtisod bo'limi E-IMZO tasdig'i. Holat ilova ochilganda /user/profile (`eimzo_gate`)
// dan keladi; tasdiq qayta login qilinguncha amal qiladi (backend ham tekshiradi).
export const useEimzoGateStore = defineStore('eimzoGateStore', {
  state: () => ({
    // null = hali ma'lum emas (profil kelmagan).
    required: null,
    verified: null,
    statusLoading: false,
    confirmLoading: false
  }),
  getters: {
    known: (s) => s.required !== null,
    // Tasdiqlanmaguncha iqtisod sahifalari yuklanmaydi (so'rov ham ketmaydi).
    locked: (s) => s.required === true && s.verified !== true
  },
  actions: {
    _apply(gate) {
      if (!gate) return
      this.required = !!gate.required
      this.verified = !!gate.verified
    },

    // Profil kelmagan holat uchun zaxira (masalan sahifa to'g'ridan-to'g'ri ochilsa).
    async _status() {
      if (this.statusLoading) return
      this.statusLoading = true
      try {
        const res = await axios.get('/v1/eimzo-gate/status')
        this._apply(res.data?.data)
      } catch {
        // Server javob bermasa — xavfsiz tomonda qolamiz: tasdiq talab qilinadi.
        this.required = true
        this.verified = false
      } finally {
        this.statusLoading = false
      }
    },

    // Backend 403 eimzo_verification_required qaytardi (admin bekor qilgan va h.k.).
    _lock() {
      this.required = true
      this.verified = false
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
            .post('/v1/eimzo-gate/verify', { code: pkcs7 }, { silentSuccess: true })
            .then((res) => {
              this._apply(res.data?.data)
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
