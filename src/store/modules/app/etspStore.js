import { defineStore } from 'pinia'
import { ETSP } from '@/lib/etsp-client.js'
import etspService from '@/service/v1/app/etspService.js'

// ETSP (ichki E-IMZO) kalit bilan kirish. E-IMZO signatureStore'ga PARALLEL — unga tegilmaydi.
// Oqim: agent ping → listKeys → foydalanuvchi kalit+parol → challenge → signAuth → HRM auth → token.
export const useEtspStore = defineStore('etspStore', {
  state: () => ({
    allKeys: [],
    visible: false,
    loading: false,
    successCallback: null
  }),
  actions: {
    async _initialSignature(callback) {
      this.successCallback = callback
      this.loading = true
      try {
        const ok = await ETSP.ping()
        if (!ok) {
          window.$Toast?.error(
            "ETSP Agent topilmadi. Iltimos agentni o'rnating (https://127.0.0.1:27443)."
          )
          return
        }
        const keys = await ETSP.listKeys()
        this.allKeys = (keys || [])
          // FAQAT ETSP'ning o'zi bergan kalitlar: sertifikatli (.cer) — serial + PINFL bor.
          // Boshqa (sertifikatsiz / begona) .pfx fayllar ro'yxatда ko'rsatilmaydi.
          .filter((k) => k.serial && k.pinfl)
          .map((k) => ({
            file: k.file,
            fio: k.fio || k.file,
            pinfl: k.pinfl,
            stir: k.stir,
            serial: k.serial,
            notAfter: k.notAfter,
            expired: !!k.expired,
            type: k.type
          }))
        if (!this.allKeys.length) {
          window.$Toast?.warning(
            "ETSP kaliti topilmadi. ETSP tomonidan berilgan kalitni DSKEYS papkasiga joylang."
          )
          return
        }
        this.visible = true
      } catch (e) {
        window.$Toast?.error('ETSP xatosi: ' + (e?.message || e))
      } finally {
        this.loading = false
      }
    },

    // Kalit tanlanib parol kiritilgach — imzolash + HRM'ga kirish.
    async _accepted(key, password) {
      if (key?.expired) {
        window.$Toast?.error('Kalit muddati tugagan.')
        return
      }
      this.loading = true
      try {
        const ch = await etspService._challenge()
        const nonce = ch?.challenge
        if (!nonce) throw new Error('challenge olinmadi')

        const sig = await ETSP.signAuth(key.file, password, nonce)
        const res = await etspService._auth({
          nonce,
          signature: sig.signature,
          certPem: sig.certPem
        })
        if (!res.ok) {
          window.$Toast?.error(res.data?.message || 'Kirish rad etildi')
          return
        }
        this.visible = false
        this.successCallback?.(res.data)
      } catch (e) {
        window.$Toast?.error('ETSP xatosi: ' + (e?.message || e))
      } finally {
        this.loading = false
      }
    }
  }
})
